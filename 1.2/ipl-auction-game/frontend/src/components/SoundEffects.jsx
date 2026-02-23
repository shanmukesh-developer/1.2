import { useEffect, useRef } from 'react'

export default function useSoundEffects() {
  const audioContext = useRef(null)

  useEffect(() => {
    // Initialize Web Audio API
    try {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)()
    } catch (error) {
      console.log('Audio not supported:', error)
    }
  }, [])

  const playSound = (type) => {
    if (!audioContext.current) return

    const oscillator = audioContext.current.createOscillator()
    const gainNode = audioContext.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.current.destination)

    switch (type) {
      case 'bid':
        oscillator.frequency.value = 800
        gainNode.gain.value = 0.1
        break
      case 'sold':
        oscillator.frequency.value = 1200
        gainNode.gain.value = 0.2
        break
      case 'notification':
        oscillator.frequency.value = 600
        gainNode.gain.value = 0.05
        break
    }

    oscillator.start()
    oscillator.stop(audioContext.current.currentTime + 0.1)
  }

  return {
    playBid: () => playSound('bid'),
    playSold: () => playSound('sold'),
    playNotification: () => playSound('notification'),
  }
}
