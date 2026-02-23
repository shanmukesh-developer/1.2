import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AIPlayer from '../components/AIPlayer.jsx'
import AuctionCard from '../components/AuctionCard.jsx'
import Chat from '../components/Chat.jsx'
import EventBanner from '../components/EventBanner.jsx'
import Modal from '../components/Modal.jsx'
import PlayerStats from '../components/PlayerStats.jsx'
import PlayerList from '../components/PlayerList.jsx'
import useSoundEffects from '../components/SoundEffects.jsx'
import Timer from '../components/Timer.jsx'
import StadiumVFX from '../components/StadiumVFX.jsx'
import ConfettiBurst from '../components/ConfettiBurst.jsx'
import LeadingBanner from '../components/LeadingBanner.jsx'
import BidTicker from '../components/BidTicker.jsx'
import PurseMeters from '../components/PurseMeters.jsx'
import CheerFlash from '../components/CheerFlash.jsx'
import SoldOverlay from '../components/SoldOverlay.jsx'
import { useGame } from '../state/gameState.jsx'
import { socket } from '../realtime/socket.js'
import VoicePanel from '../components/VoicePanel.jsx'
import { formatINRFromLakhs } from '../utils/money.js'
import { ROUND_SECONDS } from '../utils/auctionLogic.js'

export default function Auction() {
  const navigate = useNavigate()
  const {
    state: { users, round, phase, rooms, currentRoomId, currentUserId },
    dispatch,
  } = useGame()

  const [playerListModal, setPlayerListModal] = useState(null)
  const [secretBidMax, setSecretBidMax] = useState('')
  const [aiEnabled, setAiEnabled] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [confettiKey, setConfettiKey] = useState(0)
  const [cheerKey, setCheerKey] = useState(0)
  const [soldKey, setSoldKey] = useState(0)
  const [timerSettings, setTimerSettings] = useState({ seconds: ROUND_SECONDS })
  const [showTimerSettings, setShowTimerSettings] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [showMobileTeams, setShowMobileTeams] = useState(false)
  const [showMobileSquad, setShowMobileSquad] = useState(false)
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const [activeMobileTab, setActiveMobileTab] = useState('auction')
  const [isMobile, setIsMobile] = useState(false)
  const [sidePanelCollapsed, setSidePanelCollapsed] = useState(false)
  const [yourTurnBannerDismissed, setYourTurnBannerDismissed] = useState(false)
  const chatSectionRef = useRef(null)
  const battleControlsRef = useRef(null)
  const soundEffects = useSoundEffects()

  const room = currentRoomId ? rooms[currentRoomId] : null
  const messages = room?.chat || []

  // Unread chat badge logic (only count when chat modal is closed)
  useEffect(() => {
    if (showMobileChat) setUnreadChatCount(0)
  }, [showMobileChat])
  useEffect(() => {
    if (!showMobileChat && messages.length > 0) {
      setUnreadChatCount(messages.length)
    }
  }, [messages, showMobileChat])

  const lastRoundRef = useRef({ playerId: null, hadBidder: false })

  useEffect(() => {
    function onCloseStats() {
      setShowStats(false)
    }

    window.addEventListener('closeStats', onCloseStats)
    return () => window.removeEventListener('closeStats', onCloseStats)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(Boolean(mq.matches))
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (users.length === 0) navigate('/')
  }, [users.length, navigate])

  useEffect(() => {
    socket.on('auction:playerSold', (data) => {
      if (data.sold) {
        // Player was sold - existing confetti/sold effects will handle this
        console.log(`Player ${data.player.name} sold to ${data.winnerId} for ${data.price}`)
      } else {
        // Player went unsold - show different feedback
        console.log(`Player ${data.player.name} went UNSOLD`)
        soundEffects.playNotification() // Play a different sound for unsold
      }
    })

    return () => {
      socket.off('auction:playerSold')
    }
  }, [soundEffects])

  useEffect(() => {
    const playerId = round?.player?.id || null
    const hadBidder = Boolean(round?.currentBidderUserId)

    const prev = lastRoundRef.current
    const playerChanged = prev.playerId && playerId && prev.playerId !== playerId

    if (playerChanged && prev.hadBidder) {
      setConfettiKey((k) => k + 1)
      setSoldKey((k) => k + 1)
    }

    const bidChanged = prev.playerId === playerId && prev.currentBid !== round.currentBid
    if (bidChanged) {
      setCheerKey((k) => k + 1)
    }

    lastRoundRef.current = { playerId, hadBidder, currentBid: round.currentBid }
  }, [round?.player?.id, round?.currentBidderUserId, round?.currentBid])

  const currentBidderLabel = useMemo(() => {
    if (!round.currentBidderUserId) return null
    const u = users.find((x) => x.id === round.currentBidderUserId)
    return u ? u.teamName : null
  }, [round.currentBidderUserId, users])

  const currentUser = users[currentPlayerIndex] // Current user based on turn
  const me = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || null
  }, [currentUserId, users])

  function handleBid(userId) {
    if (phase !== 'auction') return
    if (!room?.code) return
    socket.emit('auction:bid', { roomCode: room.code, userId }, (res) => {
      if (res?.ok) {
        soundEffects.playBid()
        // Haptic feedback on mobile
        if (isMobile && navigator.vibrate) {
          navigator.vibrate(50)
        }
      }
    })
  }

  function handleSendMessage(text) {
    if (!room?.code || !currentUserId) return
    socket.emit('chat:send', { roomCode: room.code, userId: currentUserId, text }, (res) => {
      if (res?.ok) soundEffects.playNotification()
    })
  }

  function handleTimerSettings(seconds) {
    if (!room?.code || room.hostUserId !== currentUserId) return
    socket.emit('auction:setTimer', { roomCode: room.code, userId: currentUserId, seconds }, (res) => {
      if (res?.ok) {
        setTimerSettings({ seconds })
        setShowTimerSettings(false)
      }
    })
  }

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

  function getRoleBadgeColor(role) {
    const map = {
      'Batsman': 'bg-green-500 text-white',
      'Bowler': 'bg-blue-500 text-white',
      'All-Rounder': 'bg-purple-500 text-white',
      'Wicket-Keeper': 'bg-yellow-500 text-black',
    }
    return map[role] || 'bg-gray-600 text-white'
  }

  function getTeamInitial(teamName) {
    const words = teamName.split(' ')
    return words.map(word => word[0]).join('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <ConfettiBurst triggerKey={confettiKey} />
      <CheerFlash triggerKey={cheerKey} />
      <SoldOverlay triggerKey={soldKey} users={users} round={round} />
      <div className="absolute inset-0">
        <StadiumVFX density={isMobile ? 12 : 22} />
      </div>

      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 pb-40 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {/* Main Auction Area */}
          <div className="md:col-span-2 lg:col-span-3 space-y-4 order-2 lg:order-1">
            {/* Mobile Your Turn Banner */}
            {isMobile && me && currentUser?.id === me.id && phase === 'auction' && round.player && !yourTurnBannerDismissed && (
              <div className="mb-4 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 shadow-2xl p-4 animate-pulse relative">
                <button
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg leading-none flex items-center justify-center transition-colors"
                  onClick={() => setYourTurnBannerDismissed(true)}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="text-center font-black text-white text-lg pr-6">
                  🎯 Your Turn – {me.teamName}
                </div>
              </div>
            )}

            <EventBanner event={round.event} />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer seconds={round.secondsLeft} />
                {round.bidHistory && round.bidHistory.length > 0 && (
                  <div className="text-xs text-yellow-300 font-semibold animate-pulse">
                    {(() => {
                      const lastBid = round.bidHistory[round.bidHistory.length - 1]
                      const teamName = lastBid?.teamName || ''
                      const teamNameLower = teamName.toLowerCase()
                      
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
                      let resetTime = 30 // Default
                      for (const [keyword, timerFunc] of Object.entries(teamConfigs)) {
                        if (teamNameLower.includes(keyword)) {
                          resetTime = timerFunc()
                          break
                        }
                      }
                      
                      return `${teamName} +${resetTime}s`
                    })()}
                  </div>
                )}
              </div>
                {room?.hostUserId === currentUserId && (
                  <button
                    onClick={() => setShowTimerSettings(true)}
                    className="text-xs text-white/70 hover:text-white transition-colors"
                  >
                    ⚙️ Settings
                  </button>
                )}
              </div>
              <div className="text-sm text-white/70">
                Pool: {round.player ? 'Live' : 'Ended'}
              </div>
            </div>

            <LeadingBanner users={users} round={round} />

            <AuctionCard player={round.player} currentBid={round.currentBid} currentBidderLabel={currentBidderLabel} />
            
            {/* Player Stats for Current Player */}
            {showStats && round.player && (
              <PlayerStats 
                player={round.player}
                isVisible={showStats}
                isCurrentTurn={currentPlayerIndex === users.findIndex(u => u.id === currentUser?.id)}
                currentBid={round.currentBid}
                currentBidderLabel={currentBidderLabel}
                secondsLeft={round.secondsLeft}
              />
            )}

            {/* Bid Console */}
            <div ref={battleControlsRef} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-cyan-300 to-pink-400 drop-shadow" style={{ textShadow: '0 0 12px rgba(245,197,66,0.6), 0 0 24px rgba(34,211,238,0.3)' }}>
                  Battle Controls
                </div>
                <div className="text-xs sm:text-sm text-white/60 font-medium">
                  {users.length} teams
                </div>
              </div>
              
              {/* Mobile: Single column, Desktop: Grid */}
              <div className="mt-4 space-y-4 md:hidden">
                {me && (() => {
                  const frozen = round.frozenUserIds.includes(me.id)
                  const disabled = frozen || !round.player
                  return (
                    <div key={me.id} className="relative">
                      <div className={`rounded-2xl ${getTeamColor(me.teamName)} bg-opacity-20 border border-white/15 p-3 shadow-lg transition-colors`}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-10 h-10 ${getTeamColor(me.teamName)} bg-opacity-90 rounded-xl flex items-center justify-center font-black border border-white/20 flex-shrink-0`}>
                              <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{me.teamName.slice(0,2)}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-sm truncate" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)' }}>{me.teamName}</div>
                              <div className="text-xs text-white/70 truncate font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>@{me.username}</div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="text-base font-black text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.4)' }}>
                              {formatINRFromLakhs(me.purse)}
                            </div>
                            <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeColor(round.player?.role)}`}>
                              {round.player?.role}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <button
                            className={`h-11 rounded-xl text-sm font-semibold transition-colors ${
                              'bg-white/10 hover:bg-white/15'
                            } text-white`}
                            onClick={() => setShowStats(true)}
                            disabled={!round.player}
                          >
                            📊 Stats
                          </button>

                          <button
                            className={`h-11 rounded-xl text-sm font-semibold transition-colors ${
                              'bg-white/10 hover:bg-white/15'
                            } text-white`}
                            onClick={() => setPlayerListModal(me.id)}
                            disabled={!round.player}
                          >
                            📋 Squad
                          </button>

                          <button
                            className={`h-11 rounded-xl text-sm font-semibold transition-colors ${
                              'bg-white/10 hover:bg-white/15'
                            } text-white`}
                            onClick={() => setShowMobileChat(true)}
                          >
                            💬 Chat
                          </button>

                          <button
                            className={`h-11 rounded-xl text-sm font-semibold transition-colors ${
                              'bg-white/10 hover:bg-white/15'
                            } text-white`}
                            onClick={() => {
                              if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                                alert('Speech recognition is not supported in your browser.')
                                return
                              }
                              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
                              const recognition = new SpeechRecognition()
                              recognition.continuous = false
                              recognition.interimResults = false
                              recognition.lang = 'en-US'
                              recognition.onresult = (event) => {
                                const transcript = event.results[0][0].transcript
                                handleSendMessage(transcript)
                              }
                              recognition.onerror = () => {}
                              recognition.start()
                            }}
                          >
                            🎤 Mic
                          </button>
                        </div>

                        <div className="mt-2">
                          <button
                            className={`w-full h-12 font-bold text-white rounded-xl transition-colors ${
                              disabled
                                ? 'bg-gray-600/80 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:brightness-110'
                            }`}
                            disabled={disabled}
                            onClick={() => {
                              handleBid(me.id)
                            }}
                          >
                            <span className="text-sm">⚡ BID</span>
                          </button>
                        </div>
                      </div>

                      {frozen && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          ❄ FROZEN
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              <div className="mt-4 hidden md:grid md:grid-cols-2 md:gap-4">
                {users.map((u, index) => {
                  const isCurrentPlayer = index === currentPlayerIndex
                  const frozen = round.frozenUserIds.includes(u.id)
                  const disabled = frozen || !round.player
                  return (
                    <div key={u.id} className="relative group">
                      <div className={`rounded-2xl ${getTeamColor(u.teamName)} bg-opacity-20 border border-white/15 p-3 sm:p-4 shadow-lg transition-colors ${
                        isCurrentPlayer ? 'ring-2 ring-green-400/80 ring-offset-2 ring-offset-black/20' : ''
                      }`}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-10 h-10 ${getTeamColor(u.teamName)} bg-opacity-90 rounded-xl flex items-center justify-center font-black border border-white/20 flex-shrink-0`}>
                              <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{u.teamName.slice(0,2)}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-sm truncate" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)' }}>{u.teamName}</div>
                              <div className="text-xs text-white/70 truncate font-medium" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>@{u.username}</div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="text-base sm:text-lg font-black text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.4)' }}>
                              {formatINRFromLakhs(u.purse)}
                            </div>
                            <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeColor(round.player?.role)}`}>
                              {round.player?.role}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            className={`col-span-2 px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-white rounded-xl transition-colors ${
                              disabled
                                ? 'bg-gray-600/80 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:brightness-110'
                            }`}
                            disabled={disabled}
                            onClick={() => {
                              handleBid(u.id)
                            }}
                          >
                            <span className="text-sm sm:text-base">
                              {isCurrentPlayer ? '⚡ YOUR TURN' : '⚡ BATTLE BID'}
                            </span>
                          </button>
                          
                          <button
                            className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                              isCurrentPlayer ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600/80'
                            } text-white`}
                            onClick={() => isCurrentPlayer ? setShowStats(true) : null}
                            disabled={!round.player}
                          >
                            📊 Stats
                          </button>
                          
                          <button
                            className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold transition-colors hover:brightness-110"
                            onClick={() => setPlayerListModal(u.id)}
                            disabled={!round.player}
                          >
                            <span>📋 PLAYER LIST</span>
                          </button>
                        </div>
                      </div>

                      {frozen && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          ❄ FROZEN
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="hidden md:block md:col-span-1 space-y-4 order-1 lg:order-2">
            <button
              className="w-full h-10 rounded-xl bg-white/5 text-white/70 text-xs font-semibold transition-colors hover:bg-white/10"
              onClick={() => setSidePanelCollapsed(!sidePanelCollapsed)}
              aria-label={sidePanelCollapsed ? 'Expand' : 'Collapse'}
            >
              {sidePanelCollapsed ? '➕ Show Panel' : '➖ Hide Panel'}
            </button>
            {!sidePanelCollapsed && (
              <>
                <BidTicker users={users} bidHistory={round.bidHistory} />
                <PurseMeters users={users} />
                <Chat 
                  messages={messages} 
                  onSendMessage={handleSendMessage}
                  currentUser={users.find((u) => u.id === currentUserId) || currentUser}
                />
                {room?.code && currentUserId && (
                  <VoicePanel roomCode={room.code} userId={currentUserId} users={room.users} />
                )}
                {aiEnabled && <AIPlayer 
                  enabled={aiEnabled}
                  onToggle={() => setAiEnabled(!aiEnabled)}
                />}
              </>
            )}
          </div>

          {/* Mobile Tab Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
            <div className="mx-auto max-w-screen-sm px-2 pb-2">
              <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-2xl p-2">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    className={`h-14 rounded-xl font-bold text-white transition-colors flex flex-col items-center justify-center ${
                      activeMobileTab === 'auction'
                        ? 'bg-gradient-to-r from-orange-500 via-red-600 to-pink-600'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                    onClick={() => setActiveMobileTab('auction')}
                    aria-label="Auction"
                  >
                    <div className="text-lg">⚡</div>
                    <div className="text-[10px] font-bold tracking-wide mt-1">Auction</div>
                  </button>

                  <button
                    className={`h-14 rounded-xl font-bold text-white transition-colors flex flex-col items-center justify-center relative ${
                      activeMobileTab === 'chat'
                        ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                    onClick={() => {
                      setActiveMobileTab('chat')
                      setShowMobileChat(true)
                    }}
                    aria-label="Chat"
                  >
                    <div className="text-lg">💬</div>
                    <div className="text-[10px] font-bold tracking-wide mt-1">Chat</div>
                    {unreadChatCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadChatCount}
                      </span>
                    )}
                  </button>

                  <button
                    className={`h-14 rounded-xl font-bold text-white transition-colors flex flex-col items-center justify-center ${
                      activeMobileTab === 'teams'
                        ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                    onClick={() => {
                      setActiveMobileTab('teams')
                      setShowMobileTeams(true)
                    }}
                    aria-label="Teams"
                  >
                    <div className="text-lg">👥</div>
                    <div className="text-[10px] font-bold tracking-wide mt-1">Teams</div>
                  </button>

                  <button
                    className={`h-14 rounded-xl font-bold text-white transition-colors flex flex-col items-center justify-center ${
                      activeMobileTab === 'squad'
                        ? 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                    onClick={() => {
                      setActiveMobileTab('squad')
                      setShowMobileSquad(true)
                    }}
                    aria-label="Squad"
                  >
                    <div className="text-lg">📋</div>
                    <div className="text-[10px] font-bold tracking-wide mt-1">Squad</div>
                  </button>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-2">
                  <button
                    className={`w-full h-12 rounded-xl font-black text-white transition-colors ${
                      !me || phase !== 'auction' || !round.player || round.frozenUserIds.includes(me.id)
                        ? 'bg-gray-600/70'
                        : 'bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:brightness-110'
                    }`}
                    disabled={!me || phase !== 'auction' || !round.player || round.frozenUserIds.includes(me.id)}
                    onClick={() => {
                      if (!me) return
                      handleBid(me.id)
                    }}
                    aria-label="Bid"
                  >
                    ⚡ BID
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            className="relative group px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-green-500/50"
            onClick={() => {
              if (!room?.code || !currentUserId) return
              socket.emit('auction:fastForward', { roomCode: room.code, userId: currentUserId })
            }}
            disabled={phase !== 'auction'}
          >
            <span className="relative z-10">⏭ FAST FORWARD</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 opacity-0 group-hover:opacity-30 transition-all" />
            <div className="absolute -inset-1 rounded-2xl border-2 border-white/30 animate-pulse" />
          </button>
          
          <Link className="relative group px-6 py-4 text-xl font-medium text-gray-300 rounded-xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 transform transition-all duration-300 hover:scale-110 hover:shadow-cyan-500/50" to="/results">
            <span className="relative z-10">🏆 VIEW RESULTS</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 opacity-0 group-hover:opacity-20 transition-all" />
            <div className="absolute -inset-1 rounded-2xl border-2 border-cyan-400/30 animate-pulse" />
          </Link>
        </div>

      {/* Player List Modal */}
      <Modal
        open={!!playerListModal}
        title="🏆 My Acquired Players"
        onClose={() => setPlayerListModal(null)}
      >
        <PlayerList users={users} currentUserId={currentUserId} />
      </Modal>

      {/* Timer Settings Modal */}
      <Modal
        open={showTimerSettings}
        title="⏰ Timer Settings"
        onClose={() => setShowTimerSettings(false)}
      >
        <div className="space-y-4">
          <div className="text-sm text-white/70">
            Set the default timer duration for each bidding round (in seconds):
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[10, 15, 20, 30, 45, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => handleTimerSettings(sec)}
                className={`relative group px-4 py-3 rounded-xl font-bold text-white transform transition-all duration-300 hover:scale-105 ${
                  timerSettings.seconds === sec
                    ? 'bg-green-600 border-2 border-green-400'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-purple-500/50'
                }`}
              >
                <span className="relative z-10">{sec}s</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-30 transition-all" />
              </button>
            ))}
          </div>
          <div className="text-xs text-white/50">
            Current: {timerSettings.seconds} seconds per round
          </div>
        </div>
      </Modal>

      <Modal
        open={showMobileSquad}
        title="📋 My Squad"
        onClose={() => setShowMobileSquad(false)}
      >
        <PlayerList users={users} currentUserId={currentUserId} />
      </Modal>

      <Modal
        open={showMobileChat}
        title="💬 Chat"
        onClose={() => setShowMobileChat(false)}
      >
        <Chat 
          messages={messages} 
          onSendMessage={handleSendMessage}
          currentUser={users.find((u) => u.id === currentUserId) || currentUser}
        />
      </Modal>

      <Modal
        open={showMobileTeams}
        title="👥 Teams"
        onClose={() => setShowMobileTeams(false)}
      >
        <div className="space-y-4">
          <BidTicker users={users} bidHistory={round.bidHistory} />
          <PurseMeters users={users} />
        </div>
      </Modal>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-screen-sm px-2 pb-2">
          <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-2xl p-2">
            <div className="grid grid-cols-4 gap-2">
              <button
                className={`h-14 rounded-xl font-bold text-white transition-colors flex flex-col items-center justify-center ${
                  activeMobileTab === 'auction'
                    ? 'bg-gradient-to-r from-orange-500 via-red-600 to-pink-600'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
                onClick={() => setActiveMobileTab('auction')}
                aria-label="Auction"
              >
                <div className="text-lg">⚡</div>
                <div className="text-[10px] font-bold tracking-wide mt-1">Auction</div>
              </button>

              <button
                className={`h-14 rounded-xl font-bold text-white transition-colors flex flex-col items-center justify-center relative ${
                  activeMobileTab === 'chat'
                    ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
                onClick={() => {
                  setActiveMobileTab('chat')
                  setShowMobileChat(true)
                }}
                aria-label="Chat"
              >
                <div className="text-lg">💬</div>
                <div className="text-[10px] font-bold tracking-wide mt-1">Chat</div>
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              <button
                className={`h-14 rounded-xl font-bold text-white transition-colors flex flex-col items-center justify-center ${
                  activeMobileTab === 'teams'
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
                onClick={() => {
                  setActiveMobileTab('teams')
                  setShowMobileTeams(true)
                }}
                aria-label="Teams"
              >
                <div className="text-lg">👥</div>
                <div className="text-[10px] font-bold tracking-wide mt-1">Teams</div>
              </button>

              <button
                className={`h-14 rounded-xl font-bold text-white transition-colors flex flex-col items-center justify-center ${
                  activeMobileTab === 'squad'
                    ? 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
                onClick={() => {
                  setActiveMobileTab('squad')
                  setShowMobileSquad(true)
                }}
                aria-label="Squad"
              >
                <div className="text-lg">📋</div>
                <div className="text-[10px] font-bold tracking-wide mt-1">Squad</div>
              </button>
            </div>

            {/* Bottom Action Bar */}
            <div className="mt-2">
              <button
                className={`w-full h-12 rounded-xl font-black text-white transition-colors ${
                  !me || phase !== 'auction' || !round.player || round.frozenUserIds.includes(me.id)
                    ? 'bg-gray-600/70'
                    : 'bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 hover:brightness-110'
                }`}
                disabled={!me || phase !== 'auction' || !round.player || round.frozenUserIds.includes(me.id)}
                onClick={() => {
                  if (!me) return
                  handleBid(me.id)
                }}
                aria-label="Bid"
              >
                ⚡ BID
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
