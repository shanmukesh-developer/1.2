import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../state/gameState.jsx'
import { socket } from '../realtime/socket.js'

const IPL_TEAMS = [
  { id: 'MI', name: 'Mumbai Indians', color: 'bg-blue-600' },
  { id: 'CSK', name: 'Chennai Super Kings', color: 'bg-yellow-600' },
  { id: 'RCB', name: 'Royal Challengers Bangalore', color: 'bg-red-600' },
  { id: 'KKR', name: 'Kolkata Knight Riders', color: 'bg-purple-600' },
  { id: 'DC', name: 'Delhi Capitals', color: 'bg-blue-500' },
  { id: 'PBKS', name: 'Punjab Kings', color: 'bg-red-500' },
  { id: 'RR', name: 'Rajasthan Royals', color: 'bg-pink-600' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', color: 'bg-orange-600' },
  { id: 'GT', name: 'Gujarat Titans', color: 'bg-indigo-600' },
  { id: 'LSG', name: 'Lucknow Super Giants', color: 'bg-teal-600' },
]

export default function Home() {
  const navigate = useNavigate()
  const { state, dispatch } = useGame()
  const [username, setUsername] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(IPL_TEAMS[0])
  const [roomCode, setRoomCode] = useState('')

  // Debug: log state changes
  useEffect(() => {
    console.log('Home state updated:', { users: state.users, rooms: state.rooms, currentRoomId: state.currentRoomId })
  }, [state])

  function handleCreateRoom() {
    dispatch({ type: 'CLEAR_ERROR' })

    const u = username.trim()
    if (!u) {
      alert('Please enter your name!')
      return
    }

    socket.emit('room:create', { username: u }, (res) => {
      if (!res?.ok) {
        dispatch({ type: 'SET_ERROR', payload: res?.error || 'Failed to create room.' })
        return
      }
      dispatch({ type: 'APPLY_ROOM_SNAPSHOT', payload: { room: res.room, currentUserId: res.currentUserId } })
      navigate('/room')
    })
  }

  function handleJoinRoom() {
    dispatch({ type: 'CLEAR_ERROR' })

    const u = username.trim()
    const code = roomCode.trim().toUpperCase()
    if (!u) {
      alert('Please enter your name!')
      return
    }
    if (!code) {
      alert('Please enter room code!')
      return
    }

    socket.emit(
      'room:join',
      {
        roomCode: code,
        username: u,
        teamName: selectedTeam.name,
        avatar: { id: selectedTeam.id, label: selectedTeam.name, src: '/assets/avatars/avatar-1.svg' },
      },
      (res) => {
        if (!res?.ok) {
          dispatch({ type: 'SET_ERROR', payload: res?.error || 'Failed to join room.' })
          return
        }
        dispatch({ type: 'APPLY_ROOM_SNAPSHOT', payload: { room: res.room, currentUserId: res.currentUserId } })
        navigate('/room')
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/20 via-cyan-500/10 to-transparent animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-transparent animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/2 right-1/2 w-64 h-64 bg-gradient-to-bl from-green-500/20 via-teal-500/10 to-transparent animate-spin" style={{ animationDuration: '25s' }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Main content with glassmorphism */}
        <div className="container mx-auto px-4 py-8">
          {/* Glowing title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
              IPL AUCTION
            </h1>
            <div className="mt-2 text-2xl text-gray-300 font-light tracking-wider">ULTIMATE EDITION</div>
          </div>

          {/* Join by code */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <label className="block text-center mb-4">
                <span className="text-lg font-medium text-gray-300">Room Code</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter host room code..."
                  className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:border-white/40 transition-all"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-15 blur-xl -z-10" />
              </div>
            </div>
          </div>

          {state.lastError && (
            <div className="max-w-md mx-auto mb-6 rounded-xl bg-red-600/20 border border-red-400/30 px-4 py-3 text-sm text-red-200">
              {state.lastError}
            </div>
          )}

          {/* Name input with glow effect */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <label className="block text-center mb-4">
                <span className="text-lg font-medium text-gray-300">Enter Your Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your champion name..."
                  className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-400 focus:border-white/40 transition-all"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 opacity-20 blur-xl -z-10" />
              </div>
            </div>
          </div>

          {/* Team selection with 3D cards */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Choose Your Dynasty
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {IPL_TEAMS.map((team, index) => (
                <div
                  key={team.id}
                  className={`relative group transform transition-all duration-500 hover:scale-110 hover:-translate-y-2`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTeam(team)}
                    className={`relative w-24 h-24 ${team.color} rounded-2xl border-4 shadow-2xl flex items-center justify-center backdrop-blur-sm bg-white/10 w-full ${
                      selectedTeam?.id === team.id ? 'border-white/70 ring-4 ring-cyan-400/60' : 'border-white/20'
                    }`}
                  >
                    <span className="text-3xl font-black font-bold">{team.id}</span>
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      HOT
                    </div>
                  </button>
                  <div className="pointer-events-none absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                    {team.name}
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white/20 bg-gradient-to-br from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-20 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons with advanced effects */}
          <div className="flex justify-center gap-6">
            <button
              onClick={handleCreateRoom}
              disabled={!username.trim()}
              className="relative group px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">⚡ Create Battle Room</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 opacity-0 group-hover:opacity-30 transition-all" />
              <div className="absolute -inset-1 rounded-2xl border-2 border-white/30 animate-pulse" />
            </button>
            
            <button
              onClick={handleJoinRoom}
              disabled={!username.trim() || !roomCode.trim()}
              className="relative group px-10 py-6 text-xl font-medium text-gray-300 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">🔗 Join Room</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 opacity-0 group-hover:opacity-20 transition-all" />
              <div className="absolute -inset-1 rounded-2xl border-2 border-cyan-400/30 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Footer with glow */}
        <div className="text-center mt-16 text-gray-400">
          <p className="text-sm">Powered by <span className="text-orange-400 font-bold">⚡ Lightning Auction Engine</span></p>
          <p className="text-xs mt-2">Experience the thrill of IPL bidding like never before</p>
        </div>
      </div>
    </div>
  )
}
