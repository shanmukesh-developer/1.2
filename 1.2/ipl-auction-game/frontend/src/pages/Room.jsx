import { useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Chat from '../components/Chat.jsx'
import VoicePanel from '../components/VoicePanel.jsx'
import { useGame } from '../state/gameState.jsx'
import { isRoomHost } from '../utils/roomUtils.js'
import { socket } from '../realtime/socket.js'

export default function Room() {
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const room = state.currentRoomId ? state.rooms[state.currentRoomId] : null

  useEffect(() => {
    console.log('Room page state:', { room, users: state.users, currentRoomId: state.currentRoomId })
  }, [state, room, state.currentRoomId])

  const currentUserId = useMemo(() => {
    return state.currentUserId || room?.users[0]?.id
  }, [state.currentUserId, room])

  if (!room) {
    navigate('/')
    return null
  }

  const isHost = isRoomHost(room, currentUserId)

  const currentUser = state.users.find((u) => u.id === currentUserId)
  const messages = room?.chat || []

  function handleSendMessage(text) {
    if (!room?.code || !currentUserId) return
    socket.emit('chat:send', { roomCode: room.code, userId: currentUserId, text }, (res) => {
      if (!res?.ok) dispatch({ type: 'SET_ERROR', payload: res?.error || 'Failed to send message.' })
    })
  }

  function handleStart() {
    dispatch({ type: 'CLEAR_ERROR' })
    socket.emit(
      'auction:start',
      { roomCode: room.code, userId: currentUserId },
      (res) => {
        if (!res?.ok) {
          dispatch({ type: 'SET_ERROR', payload: res?.error || 'Failed to start auction.' })
          return
        }
        navigate('/auction')
      }
    )
  }

  function handleLeave() {
    if (!currentUserId) {
      navigate('/')
      return
    }

    socket.emit('room:leave', { roomCode: room.code, userId: currentUserId }, () => {
      dispatch({ type: 'EXIT_ROOM' })
      navigate('/')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/10 via-pink-600/5 to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-500/20 via-blue-500/10 to-transparent animate-spin" style={{ animationDuration: '30s' }} />
      </div>

      {/* Floating energy particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Glowing room header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
              BATTLE ROOM
            </h1>
            <div className="mt-3 sm:mt-4 text-lg sm:text-2xl text-gray-300 font-light">
              Code: <span className="font-mono text-cyan-400 bg-black/30 px-4 py-2 rounded-xl border-2 border-cyan-400/50">{room.code}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Players arena */}
            <div className="lg:col-span-3 rounded-3xl bg-white/5 backdrop-blur-xl border-2 border-white/20 shadow-2xl p-8 relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent opacity-50" />
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    Warriors Arena ({room.users.length}/10)
                  </h2>
                  <div className="mt-2 flex justify-center gap-2">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${i < room.users.length ? 'bg-green-500' : 'bg-gray-600'} border-2 border-white/30`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {room.users.map((u, index) => (
                    <div
                      key={u.id}
                      className="relative group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative">
                        <div className={`w-20 h-20 ${getTeamColor(u.teamName)} rounded-2xl border-4 border-white/30 shadow-2xl flex items-center justify-center backdrop-blur-sm bg-white/10`}>
                          <span className="text-2xl font-black font-bold">{getTeamInitial(u.teamName)}</span>
                          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            READY
                          </div>
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                          {u.teamName}
                        </div>
                        <div className="absolute inset-0 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-30 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Chat */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <Chat messages={messages} onSendMessage={handleSendMessage} currentUser={currentUser} />
                <VoicePanel roomCode={room.code} userId={currentUserId} users={room.users} />
              </div>
            </div>
          </div>

          {/* Control panel */}
          <div className="mt-8 text-center">
            {isHost && room.users.length >= 1 && (
              <button
                className="relative group w-full sm:w-auto px-10 sm:px-16 py-4 sm:py-6 text-xl sm:text-2xl font-bold text-white bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
                onClick={handleStart}
              >
                <span className="relative z-10">⚔ START BATTLE</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 opacity-0 group-hover:opacity-30 transition-all" />
                <div className="absolute -inset-1 rounded-2xl border-2 border-white/30 animate-pulse" />
              </button>
            )}

            {!isHost && (
              <div className="text-lg text-gray-300 animate-pulse">
                <span className="inline-block animate-bounce">⏳</span> Waiting for battle master...
              </div>
            )}

            <button
              className="mt-4 w-full sm:w-auto px-8 py-3 text-lg font-medium text-gray-300 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 rounded-xl border-2 border-gray-600/30 hover:border-gray-500/50 transition-all"
              onClick={handleLeave}
            >
              🚪 Exit Arena
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  function getTeamColor(teamName) {
    const colors = {
      'Mumbai Indians': 'bg-blue-600',
      'Chennai Super Kings': 'bg-yellow-600',
      'Royal Challengers Bangalore': 'bg-red-600',
      'Kolkata Knight Riders': 'bg-purple-600',
      'Delhi Capitals': 'bg-blue-500',
      'Punjab Kings': 'bg-red-500',
      'Rajasthan Royals': 'bg-pink-600',
      'Sunrisers Hyderabad': 'bg-orange-600',
      'Gujarat Titans': 'bg-indigo-600',
      'Lucknow Super Giants': 'bg-teal-600',
    }
    return colors[teamName] || 'bg-gray-600'
  }

  function getTeamInitial(teamName) {
    const words = teamName.split(' ')
    return words.map(word => word[0]).join('')
  }
}
