import http from 'node:http'
import fs from 'node:fs'
import { Server } from 'socket.io'
import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { players as allPlayers } from '../../frontend/src/data/players.js'
import {
  applyRandomEvent,
  getRandomPowerCards,
  nextBidAmount,
  resolveWinner,
  ROUND_SECONDS,
  shouldTriggerEvent,
} from '../../frontend/src/utils/auctionLogic.js'

const PORT = Number(process.env.PORT || 3001)
const NODE_ENV = process.env.NODE_ENV || 'development'
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Middleware: add CORS headers for frontend communication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Health check endpoint for Render monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: NODE_ENV, timestamp: new Date().toISOString() })
})

// API endpoint to check frontend dist availability
app.get('/api/status', (req, res) => {
  const distExists = fs.existsSync(join(__dirname, '../../frontend/dist'))
  res.json({ 
    backend: 'ok', 
    frontend_dist_exists: distExists,
    env: NODE_ENV,
    port: PORT
  })
})

// Serve static files from the built frontend
app.use(express.static(join(__dirname, '../../frontend/dist')))

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../frontend/dist/index.html'))
})

const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
})

/**
 * In-memory rooms:
 * roomCode -> { code, hostSocketId, hostUserId, phase, users: [{id, username, teamName, avatar}], chat: [], auction?: {...} }
 */
const rooms = new Map()

// Voice participants (signaling only)
// roomCode -> Map(userId -> socketId)
const voiceMembers = new Map()

// Team-specific timer reset settings - works with any team name
function getTeamTimerReset(teamName, currentSecondsLeft) {
  const teamNameLower = (teamName || '').toLowerCase()
  
  // You can configure any team here - these are just examples
  const teamConfigs = {
    // Example: CSK gets 20-30 seconds reset
    'csk': () => 20 + Math.floor(Math.random() * 11),
    'chennai': () => 20 + Math.floor(Math.random() * 11),
    'super kings': () => 20 + Math.floor(Math.random() * 11),
    
    // Example: RCB gets full 30 seconds reset
    'rcb': () => 30,
    'bangalore': () => 30,
    'royal challengers': () => 30,
    
    // Example: Any team with "mumbai" gets 25 seconds
    'mumbai': () => 25,
    'indians': () => 25,
    
    // Example: Any team with "delhi" gets 22 seconds
    'delhi': () => 22,
    'capitals': () => 22,
    
    // Example: Any team with "kolkata" gets 28 seconds
    'kolkata': () => 28,
    'knight': () => 28,
    
    // Example: Any team with "rajasthan" gets 24 seconds
    'rajasthan': () => 24,
    'royals': () => 24,
    
    // Example: Any team with "punjab" gets 26 seconds
    'punjab': () => 26,
    'kings': () => 26,
    
    // Example: Any team with "hyderabad" gets 27 seconds
    'hyderabad': () => 27,
    'sunrisers': () => 27,
    
    // Example: Any team with "lucknow" gets 23 seconds
    'lucknow': () => 23,
    'supergiants': () => 23,
    
    // Example: Any team with "gujarat" gets 29 seconds
    'gujarat': () => 29,
    'titans': () => 29,
  }
  
  // Check if any keyword matches the team name
  for (const [keyword, timerFunc] of Object.entries(teamConfigs)) {
    if (teamNameLower.includes(keyword)) {
      return timerFunc()
    }
  }
  
  // Default: reset to 30 seconds for any other team
  return 30
}

function genCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function genUserId() {
  return `u-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function snapshot(room) {
  return {
    code: room.code,
    id: room.code,
    hostId: room.hostUserId,
    phase: room.phase,
    users: room.users,
    chat: room.chat,
    auction: room.auction
      ? {
          poolIndex: room.auction.poolIndex,
          round: room.auction.round,
        }
      : null,
  }
}

function emitRoom(room) {
  io.to(room.code).emit('room:update', { room: snapshot(room) })
}

function pickRoundPlayer(room) {
  const idx = room?.auction?.poolIndex || 0
  return allPlayers[idx] || null
}

function startNewRound(room) {
  const player = pickRoundPlayer(room)
  if (!player) {
    room.phase = 'ended'
    room.auction.round = { ...room.auction.round, player: null }
    return
  }

  room.auction.round = {
    secondsLeft: room.timerDuration || ROUND_SECONDS,
    player,
    currentBid: player.basePrice,
    currentBidderUserId: null,
    bidHistory: [],
    frozenUserIds: [],
    event: null,
    powerEffects: {
      doubleBidUserId: null,
      secretBid: null,
    },
  }
}

function advancePool(room) {
  room.auction.poolIndex += 1
  startNewRound(room)
}

function maybeApplyEvent(room) {
  if (!room.auction?.round?.player) return
  if (!shouldTriggerEvent()) return
  const res = applyRandomEvent({ player: room.auction.round.player, users: room.users })
  room.users = res.users
  room.auction.round.player = res.player
  room.auction.round.event = res.event
}

function stopAuctionTimer(room) {
  if (room?.auction?.timerId) {
    clearInterval(room.auction.timerId)
    room.auction.timerId = null
  }
}

function startAuctionTimer(room) {
  stopAuctionTimer(room)
  room.auction.timerId = setInterval(() => {
    if (!room.auction?.round || room.phase !== 'auction') return

    const secondsLeft = Math.max(0, (room.auction.round.secondsLeft || 0) - 1)
    room.auction.round.secondsLeft = secondsLeft

    if (secondsLeft > 0) {
      emitRoom(room)
      return
    }

    const winnerId = room.auction.round.currentBidderUserId
    const price = room.auction.round.currentBid
    const player = room.auction.round.player

    if (winnerId && player) {
      // Player is sold
      room.users = resolveWinner({ users: room.users, winnerUserId: winnerId, player, price })
      io.to(room.code).emit('auction:playerSold', { 
        roomCode: room.code, 
        player, 
        winnerId, 
        price,
        sold: true 
      })
    } else if (player) {
      // Player went unsold
      io.to(room.code).emit('auction:playerSold', { 
        roomCode: room.code, 
        player, 
        winnerId: null, 
        price: 0,
        sold: false 
      })
    }

    advancePool(room)
    maybeApplyEvent(room)
    emitRoom(room)
  }, 1000)
}

function getVoiceMap(roomCode) {
  const code = String(roomCode || '').trim().toUpperCase()
  if (!voiceMembers.has(code)) voiceMembers.set(code, new Map())
  return voiceMembers.get(code)
}

function removeSocketFromAllVoiceRooms(socketId) {
  for (const [code, m] of voiceMembers.entries()) {
    for (const [userId, sid] of m.entries()) {
      if (sid === socketId) {
        m.delete(userId)
        io.to(code).emit('voice:peer-left', { userId })
      }
    }
    if (m.size === 0) voiceMembers.delete(code)
  }
}

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    removeSocketFromAllVoiceRooms(socket.id)
  })

  socket.on('room:create', (payload, ack) => {
    try {
      const username = String(payload?.username || '').trim()
      if (!username) return ack?.({ ok: false, error: 'Please enter your name!' })

      let code = genCode()
      while (rooms.has(code)) code = genCode()

      const hostUserId = genUserId()
      const host = {
        id: hostUserId,
        username,
        teamName: 'HOST',
        avatar: { id: 'host', label: 'HOST', src: '/assets/avatars/avatar-1.svg' },
        purse: 12000,
        squad: [],
        captainId: null,
        powerCards: getRandomPowerCards(2),
      }

      const room = {
        code,
        hostSocketId: socket.id,
        hostUserId,
        phase: 'room',
        users: [host],
        chat: [],
        timerDuration: ROUND_SECONDS,
      }

      rooms.set(code, room)
      socket.join(code)

      ack?.({ ok: true, room: snapshot(room), currentUserId: hostUserId })
      emitRoom(room)
    } catch (e) {
      ack?.({ ok: false, error: e?.message || 'Failed to create room.' })
    }
  })

  socket.on('room:join', (payload, ack) => {
    try {
      const code = String(payload?.roomCode || '').trim().toUpperCase()
      const username = String(payload?.username || '').trim()
      const teamName = String(payload?.teamName || '').trim()
      const avatar = payload?.avatar || { id: 'player', label: 'Player', src: '/assets/avatars/avatar-1.svg' }

      const room = rooms.get(code)
      if (!room) return ack?.({ ok: false, error: 'Room code not found.' })
      if (!username) return ack?.({ ok: false, error: 'Please enter your name!' })
      if (!teamName) return ack?.({ ok: false, error: 'Please select a team!' })
      if (room.users.length >= 10) return ack?.({ ok: false, error: 'Room is full' })

      const teamTaken = room.users.some((u) => u.teamName === teamName)
      if (teamTaken) return ack?.({ ok: false, error: 'Team already taken. Choose another team.' })

      const id = genUserId()
      const user = {
        id,
        username,
        teamName,
        avatar,
        purse: 12000,
        squad: [],
        captainId: null,
        powerCards: getRandomPowerCards(2),
      }

      room.users.push(user)
      socket.join(code)

      ack?.({ ok: true, room: snapshot(room), currentUserId: id })
      emitRoom(room)
    } catch (e) {
      ack?.({ ok: false, error: e?.message || 'Failed to join room.' })
    }
  })

  socket.on('room:leave', (payload, ack) => {
    try {
      const code = String(payload?.roomCode || '').trim().toUpperCase()
      const userId = String(payload?.userId || '').trim()
      const room = rooms.get(code)
      if (!room) return ack?.({ ok: false })

      room.users = room.users.filter((u) => u.id !== userId)
      socket.leave(code)

      if (room.users.length === 0) {
        stopAuctionTimer(room)
        rooms.delete(code)
        return ack?.({ ok: true, deleted: true })
      }

      if (room.hostUserId === userId) {
        room.hostUserId = room.users[0].id
      }

      emitRoom(room)
      ack?.({ ok: true })
    } catch {
      ack?.({ ok: false })
    }
  })

  socket.on('auction:start', (payload, ack) => {
    const code = String(payload?.roomCode || '').trim().toUpperCase()
    const userId = String(payload?.userId || '').trim()
    const room = rooms.get(code)
    if (!room) return ack?.({ ok: false, error: 'Room not found.' })
    if (room.hostUserId !== userId) return ack?.({ ok: false, error: 'Only host can start.' })

    room.phase = 'auction'

    if (!room.auction) {
      room.auction = {
        poolIndex: 0,
        round: {
          secondsLeft: ROUND_SECONDS,
          player: null,
          currentBid: 0,
          currentBidderUserId: null,
          bidHistory: [],
          frozenUserIds: [],
          event: null,
          powerEffects: {
            doubleBidUserId: null,
            secretBid: null,
          },
        },
        timerId: null,
      }
    }

    startNewRound(room)
    maybeApplyEvent(room)
    startAuctionTimer(room)
    emitRoom(room)
    io.to(room.code).emit('auction:started', { roomCode: room.code })
    ack?.({ ok: true })
  })

  socket.on('auction:bid', (payload, ack) => {
    const code = String(payload?.roomCode || '').trim().toUpperCase()
    const userId = String(payload?.userId || '').trim()
    const room = rooms.get(code)
    if (!room) return ack?.({ ok: false, error: 'Room not found.' })
    if (room.phase !== 'auction') return ack?.({ ok: false, error: 'Auction not started.' })
    if (!room.auction?.round?.player) return ack?.({ ok: false, error: 'No player in round.' })
    if (room.auction.round.frozenUserIds.includes(userId)) return ack?.({ ok: false, error: 'You are frozen.' })

    const user = room.users.find((u) => u.id === userId)
    if (!user) return ack?.({ ok: false, error: 'User not found.' })

    const doubleActive = room.auction.round.powerEffects.doubleBidUserId === userId
    const nextBid = nextBidAmount({ currentBid: room.auction.round.currentBid, doubleBidActive: doubleActive })
    if ((user.purse || 0) < nextBid) return ack?.({ ok: false, error: 'Insufficient purse.' })

    room.auction.round.currentBid = nextBid
    room.auction.round.currentBidderUserId = userId
    room.auction.round.bidHistory = [
      ...(room.auction.round.bidHistory || []),
      { ts: Date.now(), userId, amount: nextBid, teamName: user.teamName },
    ]
    
    // Team-specific timer reset - always reset to team's preferred time
    const teamResetTime = getTeamTimerReset(user.teamName, room.auction.round.secondsLeft)
    room.auction.round.secondsLeft = teamResetTime

    if (doubleActive) room.auction.round.powerEffects.doubleBidUserId = null

    emitRoom(room)
    ack?.({ ok: true })
  })

  socket.on('auction:fastForward', (payload, ack) => {
    const code = String(payload?.roomCode || '').trim().toUpperCase()
    const userId = String(payload?.userId || '').trim()
    const room = rooms.get(code)
    if (!room) return ack?.({ ok: false, error: 'Room not found.' })
    if (room.phase !== 'auction') return ack?.({ ok: false, error: 'Auction not started.' })
    if (room.hostUserId !== userId) return ack?.({ ok: false, error: 'Only host can fast forward.' })
    if (!room.auction?.round) return ack?.({ ok: false, error: 'No round.' })

    room.auction.round.secondsLeft = 0

    const winnerId = room.auction.round.currentBidderUserId
    const price = room.auction.round.currentBid
    const player = room.auction.round.player

    if (winnerId && player) {
      room.users = resolveWinner({ users: room.users, winnerUserId: winnerId, player, price })
    }

    advancePool(room)
    maybeApplyEvent(room)
    emitRoom(room)
    ack?.({ ok: true })
  })

  socket.on('auction:usePower', (payload, ack) => {
    const code = String(payload?.roomCode || '').trim().toUpperCase()
    const userId = String(payload?.userId || '').trim()
    const powerId = String(payload?.powerId || '').trim()
    const targetUserId = payload?.targetUserId ? String(payload.targetUserId).trim() : null
    const secretMaxBid = payload?.secretMaxBid

    const room = rooms.get(code)
    if (!room) return ack?.({ ok: false, error: 'Room not found.' })
    if (room.phase !== 'auction') return ack?.({ ok: false, error: 'Auction not started.' })
    if (!room.auction?.round) return ack?.({ ok: false, error: 'No round.' })

    const user = room.users.find((u) => u.id === userId)
    if (!user) return ack?.({ ok: false, error: 'User not found.' })

    const hasPower = (user.powerCards || []).some((p) => p.id === powerId)
    if (!hasPower) return ack?.({ ok: false, error: 'Power not available.' })

    room.users = room.users.map((u) =>
      u.id === userId ? { ...u, powerCards: (u.powerCards || []).filter((p) => p.id !== powerId) } : u
    )

    if (powerId === 'double_bid') {
      room.auction.round.powerEffects.doubleBidUserId = userId
      emitRoom(room)
      return ack?.({ ok: true })
    }

    if (powerId === 'freeze_opponent' && targetUserId) {
      room.auction.round.frozenUserIds = [...(room.auction.round.frozenUserIds || []), targetUserId]
      emitRoom(room)
      return ack?.({ ok: true })
    }

    if (powerId === 'instant_buy') {
      const player = room.auction.round.player
      const price = room.auction.round.currentBid
      if (player) room.users = resolveWinner({ users: room.users, winnerUserId: userId, player, price })
      advancePool(room)
      maybeApplyEvent(room)
      emitRoom(room)
      return ack?.({ ok: true })
    }

    if (powerId === 'price_drop') {
      const player = room.auction.round.player
      if (!player) return ack?.({ ok: false, error: 'No player.' })
      const nextPlayer = { ...player, basePrice: Math.max(10, Math.round((player.basePrice * 0.8) / 10) * 10) }
      room.auction.round.player = nextPlayer
      room.auction.round.currentBid = Math.min(room.auction.round.currentBid, nextPlayer.basePrice)
      emitRoom(room)
      return ack?.({ ok: true })
    }

    if (powerId === 'secret_bid') {
      const max = typeof secretMaxBid === 'number' ? secretMaxBid : null
      if (!max) return ack?.({ ok: false, error: 'Invalid max bid.' })
      room.auction.round.powerEffects.secretBid = { userId, maxBid: max }
      emitRoom(room)
      return ack?.({ ok: true })
    }
  })

  socket.on('auction:setTimer', (payload, ack) => {
    const code = String(payload?.roomCode || '').trim().toUpperCase()
    const userId = String(payload?.userId || '').trim()
    const seconds = Number(payload?.seconds) || ROUND_SECONDS

    const room = rooms.get(code)
    if (!room) return ack?.({ ok: false, error: 'Room not found.' })
    if (room.hostUserId !== userId) return ack?.({ ok: false, error: 'Only host can change timer.' })
    if (seconds < 5 || seconds > 300) return ack?.({ ok: false, error: 'Invalid timer duration.' })

    // Update default timer duration
    room.timerDuration = seconds
    emitRoom(room)
    ack?.({ ok: true })
  })

  socket.on('chat:send', (payload, ack) => {
    const code = String(payload?.roomCode || '').trim().toUpperCase()
    const userId = String(payload?.userId || '').trim()
    const text = String(payload?.text || '').trim()

    const room = rooms.get(code)
    if (!room) return ack?.({ ok: false, error: 'Room not found.' })
    if (!text) return ack?.({ ok: false })

    const user = room.users.find((u) => u.id === userId)
    const msg = {
      id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      userId,
      username: user?.teamName || user?.username || 'Player',
      text,
      timestamp: Date.now(),
    }

    room.chat.push(msg)
    if (room.chat.length > 200) room.chat.splice(0, room.chat.length - 200)

    io.to(room.code).emit('chat:message', msg)
    emitRoom(room)
    ack?.({ ok: true })
  })

  // ----------------------
  // Voice signaling events
  // ----------------------
  socket.on('voice:join', (payload, ack) => {
    const roomCode = String(payload?.roomCode || '').trim().toUpperCase()
    const userId = String(payload?.userId || '').trim()
    const room = rooms.get(roomCode)
    if (!room) return ack?.({ ok: false, error: 'Room not found.' })
    if (!userId) return ack?.({ ok: false, error: 'Missing userId.' })

    const m = getVoiceMap(roomCode)
    m.set(userId, socket.id)
    socket.join(roomCode)

    const peers = [...m.keys()].filter((id) => id !== userId)
    io.to(roomCode).emit('voice:peer-joined', { userId })
    ack?.({ ok: true, peers })
  })

  socket.on('voice:leave', (payload, ack) => {
    const roomCode = String(payload?.roomCode || '').trim().toUpperCase()
    const userId = String(payload?.userId || '').trim()
    const m = voiceMembers.get(roomCode)
    if (m) {
      m.delete(userId)
      if (m.size === 0) voiceMembers.delete(roomCode)
    }
    io.to(roomCode).emit('voice:peer-left', { userId })
    ack?.({ ok: true })
  })

  socket.on('voice:signal', (payload, ack) => {
    const roomCode = String(payload?.roomCode || '').trim().toUpperCase()
    const toUserId = String(payload?.toUserId || '').trim()
    const fromUserId = String(payload?.fromUserId || '').trim()
    const data = payload?.data

    const m = voiceMembers.get(roomCode)
    const toSocketId = m?.get(toUserId)
    if (!toSocketId) return ack?.({ ok: false, error: 'Peer not connected.' })

    io.to(toSocketId).emit('voice:signal', { roomCode, fromUserId, data })
    ack?.({ ok: true })
  })
})

httpServer.listen(PORT, () => {
  const distPath = join(__dirname, '../../frontend/dist')
  const distExists = fs.existsSync(distPath)
  console.log(`\n✨ [${NODE_ENV.toUpperCase()}] Server running at http://localhost:${PORT}`)
  console.log(`📁 Frontend dist folder: ${distExists ? '✓ Ready' : '✗ Not found (will be created on first build)'}`)
  console.log(`🔗 Health check: GET /health`)
  console.log(`📊 Status API: GET /api/status\n`)
})
