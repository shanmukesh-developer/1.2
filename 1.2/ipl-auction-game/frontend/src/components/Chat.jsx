import { useState, useEffect, useRef } from 'react'

export default function Chat({ messages, onSendMessage, currentUser }) {
  const [message, setMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Removed auto-scrolling to prevent unwanted scrolling in dashboard
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e) {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  function handleMicToggle() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setMessage(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  return (
    <div className="h-[55vh] sm:h-96 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-white">Battle Chat</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden space-y-2 mb-3 sm:mb-4 min-h-0">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
              msg.userId === currentUser?.id
                ? 'bg-blue-600/20 border-blue-400/30'
                : 'bg-white/10 border-white/20'
            } animate-in`}
          >
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                msg.userId === currentUser?.id ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {msg.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">{msg.username}</span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-white text-sm break-words">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your strategy..."
          className="flex-1 px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          maxLength={200}
        />
        <button
          type="button"
          onClick={handleMicToggle}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
          title="Voice input"
        >
          {isListening ? '🔴' : '🎤'}
        </button>
        <button
          type="submit"
          className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          Send
        </button>
      </form>
    </div>
  )
}
