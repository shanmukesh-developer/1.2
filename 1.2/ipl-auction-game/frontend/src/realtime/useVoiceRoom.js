import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { socket } from './socket.js'

function makePeerConnection() {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  })
  return pc
}

export function useVoiceRoom({ roomCode, userId }) {
  const normalizedRoomCode = String(roomCode || '').trim().toUpperCase()
  const enabled = Boolean(normalizedRoomCode && userId)

  const [joined, setJoined] = useState(false)
  const [micEnabled, setMicEnabled] = useState(true)
  const [speakerEnabled, setSpeakerEnabled] = useState(true)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [peerIds, setPeerIds] = useState([])
  const [levels, setLevels] = useState({})

  const localStreamRef = useRef(null)
  const peersRef = useRef(new Map()) // peerUserId -> { pc, audioEl }

  const audioCtxRef = useRef(null)
  const analysersRef = useRef(new Map()) // peerUserId -> { analyser, data }
  const localAnalyserRef = useRef(null)
  const rafRef = useRef(null)

  const setRemoteStream = useCallback((peerId, stream) => {
    setRemoteStreams((prev) => {
      if (prev[peerId] === stream) return prev
      return { ...prev, [peerId]: stream }
    })
  }, [])

  const removeRemoteStream = useCallback((peerId) => {
    setRemoteStreams((prev) => {
      if (!prev[peerId]) return prev
      const next = { ...prev }
      delete next[peerId]
      return next
    })

    const a = analysersRef.current.get(peerId)
    if (a) analysersRef.current.delete(peerId)

    setLevels((prev) => {
      if (!(peerId in prev)) return prev
      const next = { ...prev }
      delete next[peerId]
      return next
    })
  }, [])

  const ensureAudioContext = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    audioCtxRef.current = ctx
    return ctx
  }, [])

  const attachAnalyserForStream = useCallback(
    (peerId, stream) => {
      if (!stream) return
      const ctx = ensureAudioContext()
      if (analysersRef.current.has(peerId)) return

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)

      const data = new Uint8Array(analyser.fftSize)
      analysersRef.current.set(peerId, { analyser, data })
    },
    [ensureAudioContext]
  )

  const attachLocalAnalyser = useCallback(
    (stream) => {
      if (!stream) return
      const ctx = ensureAudioContext()
      if (localAnalyserRef.current) return

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)

      localAnalyserRef.current = { analyser, data: new Uint8Array(analyser.fftSize) }
    },
    [ensureAudioContext]
  )

  const startLevelLoop = useCallback(() => {
    if (rafRef.current) return

    const tick = () => {
      const next = {}

      if (localAnalyserRef.current) {
        const { analyser, data } = localAnalyserRef.current
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length)
        next.local = rms
      }

      for (const [peerId, a] of analysersRef.current.entries()) {
        a.analyser.getByteTimeDomainData(a.data)
        let sum = 0
        for (let i = 0; i < a.data.length; i++) {
          const v = (a.data[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / a.data.length)
        next[peerId] = rms
      }

      setLevels((prev) => {
        let changed = false
        const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
        for (const k of keys) {
          const a = prev[k]
          const b = next[k]
          if (a === undefined && b === undefined) continue
          if (a === undefined || b === undefined || Math.abs(a - b) > 0.01) {
            changed = true
            break
          }
        }
        return changed ? next : prev
      })

      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
  }, [])

  const stopLevelLoop = useCallback(() => {
    if (!rafRef.current) return
    window.cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const ensurePeer = useCallback(
    async ({ peerUserId, initiator }) => {
      if (!enabled) return
      if (!peerUserId || peerUserId === userId) return

      if (peersRef.current.has(peerUserId)) return

      const pc = makePeerConnection()
      peersRef.current.set(peerUserId, { pc })

      pc.onicecandidate = (evt) => {
        if (!evt.candidate) return
        socket.emit('voice:signal', {
          roomCode: normalizedRoomCode,
          toUserId: peerUserId,
          fromUserId: userId,
          data: { type: 'ice', candidate: evt.candidate },
        })
      }

      pc.ontrack = (evt) => {
        const [stream] = evt.streams
        if (stream) setRemoteStream(peerUserId, stream)
      }

      const localStream = localStreamRef.current
      if (localStream) {
        for (const track of localStream.getTracks()) {
          pc.addTrack(track, localStream)
        }
      }

      if (initiator) {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        socket.emit('voice:signal', {
          roomCode: normalizedRoomCode,
          toUserId: peerUserId,
          fromUserId: userId,
          data: { type: 'offer', sdp: pc.localDescription },
        })
      }
    },
    [enabled, normalizedRoomCode, setRemoteStream, userId]
  )

  const closePeer = useCallback(
    (peerUserId) => {
      const entry = peersRef.current.get(peerUserId)
      if (!entry) return
      try {
        entry.pc.close()
      } catch {
        // ignore
      }
      peersRef.current.delete(peerUserId)
      removeRemoteStream(peerUserId)

      setPeerIds((prev) => prev.filter((id) => id !== peerUserId))
    },
    [removeRemoteStream]
  )

  const join = useCallback(async () => {
    if (!enabled || joined) return

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    localStreamRef.current = stream

    attachLocalAnalyser(stream)
    startLevelLoop()

    for (const track of stream.getAudioTracks()) {
      track.enabled = micEnabled
    }

    socket.emit('voice:join', { roomCode: normalizedRoomCode, userId }, async (res) => {
      if (!res?.ok) return
      const peers = res.peers || []
      setJoined(true)
      setPeerIds([userId, ...peers])
      for (const p of peers) {
        await ensurePeer({ peerUserId: p, initiator: true })
      }
    })
  }, [attachLocalAnalyser, enabled, ensurePeer, joined, micEnabled, normalizedRoomCode, startLevelLoop, userId])

  const leave = useCallback(() => {
    if (!enabled) return

    socket.emit('voice:leave', { roomCode: normalizedRoomCode, userId })

    for (const [peerId, entry] of peersRef.current.entries()) {
      try {
        entry.pc.close()
      } catch {
        // ignore
      }
      peersRef.current.delete(peerId)
    }

    setRemoteStreams({})
    setPeerIds([])
    setLevels({})

    const stream = localStreamRef.current
    if (stream) {
      for (const t of stream.getTracks()) t.stop()
    }
    localStreamRef.current = null

    localAnalyserRef.current = null
    analysersRef.current.clear()
    stopLevelLoop()
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close()
      } catch {
        // ignore
      }
      audioCtxRef.current = null
    }

    setJoined(false)
  }, [enabled, normalizedRoomCode, stopLevelLoop, userId])

  useEffect(() => {
    if (!enabled) return

    const onPeerJoined = async ({ userId: peerUserId }) => {
      if (!joined) return
      setPeerIds((prev) => (prev.includes(peerUserId) ? prev : [...prev, peerUserId]))
      await ensurePeer({ peerUserId, initiator: true })
    }

    const onPeerLeft = ({ userId: peerUserId }) => {
      closePeer(peerUserId)
    }

    const onSignal = async ({ fromUserId, data }) => {
      const peerUserId = fromUserId
      if (!peerUserId || peerUserId === userId) return

      if (!peersRef.current.has(peerUserId)) {
        await ensurePeer({ peerUserId, initiator: false })
      }

      const entry = peersRef.current.get(peerUserId)
      if (!entry) return
      const pc = entry.pc

      if (data?.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('voice:signal', {
          roomCode: normalizedRoomCode,
          toUserId: peerUserId,
          fromUserId: userId,
          data: { type: 'answer', sdp: pc.localDescription },
        })
        return
      }

      if (data?.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        return
      }

      if (data?.type === 'ice' && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch {
          // ignore
        }
      }
    }

    socket.on('voice:peer-joined', onPeerJoined)
    socket.on('voice:peer-left', onPeerLeft)
    socket.on('voice:signal', onSignal)

    return () => {
      socket.off('voice:peer-joined', onPeerJoined)
      socket.off('voice:peer-left', onPeerLeft)
      socket.off('voice:signal', onSignal)
    }
  }, [closePeer, enabled, ensurePeer, joined, normalizedRoomCode, userId])

  useEffect(() => {
    for (const [peerId, stream] of Object.entries(remoteStreams)) {
      attachAnalyserForStream(peerId, stream)
    }
  }, [attachAnalyserForStream, remoteStreams])

  useEffect(() => {
    const stream = localStreamRef.current
    if (!stream) return
    for (const track of stream.getAudioTracks()) track.enabled = micEnabled
  }, [micEnabled])

  useEffect(() => {
    for (const entry of peersRef.current.values()) {
      if (entry.audioEl) entry.audioEl.muted = !speakerEnabled
    }
  }, [speakerEnabled])

  const remoteEntries = useMemo(() => {
    return Object.entries(remoteStreams).map(([peerUserId, stream]) => ({ peerUserId, stream }))
  }, [remoteStreams])

  const audioElements = useMemo(() => {
    return remoteEntries.map(({ peerUserId, stream }) => (
      <audio
        key={peerUserId}
        ref={(el) => {
          const entry = peersRef.current.get(peerUserId)
          if (!entry) return
          entry.audioEl = el
          if (!el) return
          el.autoplay = true
          el.playsInline = true
          el.muted = !speakerEnabled
          if (el.srcObject !== stream) el.srcObject = stream
        }}
      />
    ))
  }, [remoteEntries, speakerEnabled])

  return {
    enabled,
    joined,
    micEnabled,
    speakerEnabled,
    peerIds,
    levels,
    join,
    leave,
    setMicEnabled,
    setSpeakerEnabled,
    audioElements,
  }
}
