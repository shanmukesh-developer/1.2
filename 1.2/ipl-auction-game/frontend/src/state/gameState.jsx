import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { players as allPlayers } from '../data/players.js'
import { createRoom, joinRoom, leaveRoom, isRoomHost } from '../utils/roomUtils.js'
import { socket } from '../realtime/socket.js'
import {
  applyRandomEvent,
  getRandomPowerCards,
  nextBidAmount,
  resolveWinner,
  ROUND_SECONDS,
  shouldTriggerEvent,
} from '../utils/auctionLogic.js'

const GameStateContext = createContext(null)

function makeInitialState() {
  return {
    // Global users (across rooms)
    users: [],

    // Current device/session user
    currentUserId: null,

    // Simple UI error channel
    lastError: null,

    // Room system
    rooms: {},
    currentRoomId: null,

    // Player pool
    pool: allPlayers.slice(),
    poolIndex: 0,

    // Current round state (only meaningful when phase === 'auction')
    round: {
      secondsLeft: ROUND_SECONDS,
      player: allPlayers[0] || null,
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

    // Global phase
    phase: 'home',
  }
}

function pickRoundPlayer(state) {
  const player = state.pool[state.poolIndex] || null
  return player
}

function startNewRound(state) {
  const player = pickRoundPlayer(state)
  if (!player) {
    return { ...state, phase: 'ended', round: { ...state.round, player: null } }
  }

  return {
    ...state,
    phase: 'auction',
    round: {
      secondsLeft: ROUND_SECONDS,
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
    },
  }
}

function advancePool(state) {
  const next = { ...state, poolIndex: state.poolIndex + 1 }
  return startNewRound(next)
}

function maybeApplyEvent(state) {
  if (!state.round.player) return state
  if (!shouldTriggerEvent()) return state

  const res = applyRandomEvent({ player: state.round.player, users: state.users })
  return {
    ...state,
    users: res.users,
    round: {
      ...state.round,
      player: res.player,
      event: res.event,
    },
  }
}

function reducer(state, action) {
  console.log('Reducer action:', action.type, action.payload)
  
  switch (action.type) {
    case 'RESET':
      return makeInitialState()

    case 'EXIT_ROOM':
      return {
        ...state,
        users: [],
        currentUserId: null,
        currentRoomId: null,
        phase: 'home',
        lastError: null,
      }

    case 'CLEAR_ERROR':
      return { ...state, lastError: null }

    case 'SET_ERROR':
      return { ...state, lastError: action.payload || 'Something went wrong.' }

    case 'APPLY_ROOM_SNAPSHOT': {
      const { room, currentUserId } = action.payload || {}
      if (!room?.id) return state

      const nextState = {
        ...state,
        rooms: { ...state.rooms, [room.id]: { ...state.rooms[room.id], ...room } },
        currentRoomId: room.id,
        users: room.users || [],
        currentUserId: currentUserId || state.currentUserId,
        phase: room.phase || state.phase,
        lastError: null,
      }

      if (room.auction?.round) {
        return {
          ...nextState,
          poolIndex: typeof room.auction.poolIndex === 'number' ? room.auction.poolIndex : nextState.poolIndex,
          round: room.auction.round,
        }
      }

      return nextState
    }

    case 'ADD_USER': {
      const { id: providedId, username, teamName, avatar } = action.payload
      const id = providedId || `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const nextUser = {
        id,
        username,
        teamName,
        avatar,
        purse: 12000,
        squad: [],
        captainId: null,
        powerCards: getRandomPowerCards(2),
      }
      return { ...state, users: [...state.users, nextUser], currentUserId: id, lastError: null }
    }

    case 'CLEAR_USERS':
      return { ...state, users: [] }

    // Room actions
    case 'CREATE_ROOM': {
      const { roomName, hostUser } = action.payload

      if (!hostUser?.username?.trim()) {
        return { ...state, lastError: 'Please enter your name!', phase: 'home' }
      }

      const hostId = hostUser.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const host = {
        id: hostId,
        username: hostUser.username.trim(),
        teamName: hostUser.teamName || 'HOST',
        avatar: hostUser.avatar || { id: 'host', label: 'HOST', src: '/assets/avatars/avatar-1.svg' },
        purse: 12000,
        squad: [],
        captainId: null,
        powerCards: getRandomPowerCards(2),
      }

      const room = createRoom({ hostId, roomName })
      const roomWithHost = joinRoom(room, host)

      return {
        ...state,
        users: roomWithHost.users,
        currentUserId: hostId,
        rooms: { ...state.rooms, [room.id]: roomWithHost },
        currentRoomId: room.id,
        phase: 'room',
        lastError: null,
      }
    }

    case 'JOIN_ROOM': {
      const { roomCode, user } = action.payload
      const roomId = (roomCode || '').trim().toUpperCase()
      const room = state.rooms[roomId]
      if (!room) return { ...state, lastError: 'Room code not found.' }

      if (!user?.username?.trim()) return { ...state, lastError: 'Please enter your name!' }
      if (!user?.teamName?.trim()) return { ...state, lastError: 'Please select a team!' }

      const teamTaken = room.users.some((u) => u.teamName === user.teamName)
      if (teamTaken) return { ...state, lastError: 'Team already taken. Choose another team.' }

      const userId = user.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const normalizedUser = {
        id: userId,
        username: user.username.trim(),
        teamName: user.teamName,
        avatar: user.avatar || { id: 'player', label: 'Player', src: '/assets/avatars/avatar-1.svg' },
        purse: 12000,
        squad: [],
        captainId: null,
        powerCards: getRandomPowerCards(2),
      }

      let updated
      try {
        updated = joinRoom(room, normalizedUser)
      } catch (e) {
        return { ...state, lastError: e?.message || 'Failed to join room.' }
      }

      return {
        ...state,
        users: updated.users,
        currentUserId: userId,
        rooms: { ...state.rooms, [roomId]: updated },
        currentRoomId: roomId,
        phase: 'room',
        lastError: null,
      }
    }

    case 'LEAVE_ROOM': {
      const { roomId, userId } = action.payload
      const room = state.rooms[roomId]
      if (!room) return state
      const updated = leaveRoom(room, userId)
      const newRooms = { ...state.rooms, [roomId]: updated }
      if (updated.users.length === 0) {
        delete newRooms[roomId]
        return { ...state, users: [], rooms: newRooms, currentRoomId: null, currentUserId: null, phase: 'home' }
      }
      return {
        ...state,
        users: updated.users,
        rooms: newRooms,
        currentRoomId: updated.users.length > 0 ? roomId : null,
        phase: updated.users.length > 0 ? 'room' : 'home',
      }
    }

    // Auction actions
    case 'START_AUCTION': {
      if (state.users.length === 0) return { ...state, lastError: 'No players in room.' }
      const seeded = startNewRound({ ...state, phase: 'auction' })
      return maybeApplyEvent(seeded)
    }

    case 'TICK': {
      if (state.phase !== 'auction') return state
      const secondsLeft = Math.max(0, state.round.secondsLeft - 1)
      if (secondsLeft > 0) {
        return { ...state, round: { ...state.round, secondsLeft } }
      }

      const winnerId = state.round.currentBidderUserId
      const price = state.round.currentBid
      const player = state.round.player

      let users = state.users
      if (winnerId && player) users = resolveWinner({ users, winnerUserId: winnerId, player, price })

      const next = { ...state, users }
      return maybeApplyEvent(advancePool(next))
    }

    case 'BID': {
      if (state.phase !== 'auction') return state
      const { userId } = action.payload
      if (!state.round.player) return state
      if (state.round.frozenUserIds.includes(userId)) return state

      const user = state.users.find((u) => u.id === userId)
      if (!user) return state

      const doubleActive = state.round.powerEffects.doubleBidUserId === userId
      const nextBid = nextBidAmount({ currentBid: state.round.currentBid, doubleBidActive: doubleActive })
      if ((user.purse || 0) < nextBid) return state

      const bidHistory = [
        ...state.round.bidHistory,
        {
          ts: Date.now(),
          userId,
          amount: nextBid,
        },
      ]

      const resetTimer = state.round.secondsLeft <= 2 ? ROUND_SECONDS : state.round.secondsLeft

      return {
        ...state,
        round: {
          ...state.round,
          currentBid: nextBid,
          currentBidderUserId: userId,
          bidHistory,
          secondsLeft: resetTimer,
          powerEffects: {
            ...state.round.powerEffects,
            doubleBidUserId: doubleActive ? null : state.round.powerEffects.doubleBidUserId,
          },
        },
      }
    }

    case 'USE_POWER': {
      if (state.phase !== 'auction') return state
      const { userId, powerId, targetUserId, secretMaxBid } = action.payload

      const user = state.users.find((u) => u.id === userId)
      if (!user) return state

      const hasPower = (user.powerCards || []).some((p) => p.id === powerId)
      if (!hasPower) return state

      const users = state.users.map((u) =>
        u.id === userId ? { ...u, powerCards: (u.powerCards || []).filter((p) => p.id !== powerId) } : u
      )

      if (powerId === 'double_bid') {
        return { ...state, users, round: { ...state.round, powerEffects: { ...state.round.powerEffects, doubleBidUserId: userId } } }
      }

      if (powerId === 'freeze_opponent' && targetUserId) {
        return { ...state, users, round: { ...state.round, frozenUserIds: [...state.round.frozenUserIds, targetUserId] } }
      }

      if (powerId === 'instant_buy') {
        const player = state.round.player
        const price = state.round.currentBid
        const winnerId = userId

        let nextUsers = users
        if (winnerId && player) nextUsers = resolveWinner({ users: nextUsers, winnerUserId: winnerId, player, price })

        const next = { ...state, users: nextUsers }
        return maybeApplyEvent(advancePool(next))
      }

      if (powerId === 'price_drop') {
        const player = state.round.player
        if (!player) return { ...state, users }
        const nextPlayer = { ...player, basePrice: Math.max(10, Math.round((player.basePrice * 0.8) / 10) * 10) }
        const nextBid = Math.min(state.round.currentBid, nextPlayer.basePrice)
        return {
          ...state,
          users,
          round: {
            ...state.round,
            player: nextPlayer,
            currentBid: nextBid,
          },
        }
      }

      if (powerId === 'secret_bid') {
        const max = typeof secretMaxBid === 'number' ? secretMaxBid : null
        if (!max) return { ...state, users }
        return {
          ...state,
          users,
          round: {
            ...state.round,
            powerEffects: {
              ...state.round.powerEffects,
              secretBid: { userId, maxBid: max },
            },
          },
        }
      }

      return { ...state, users }
    }

    case 'SET_CAPTAIN': {
      const { userId, captainId } = action.payload
      const users = state.users.map((u) => (u.id === userId ? { ...u, captainId } : u))
      return { ...state, users }
    }

    default:
      return state
  }
}

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState)
  const value = useMemo(() => ({ state, dispatch }), [state])

  useEffect(() => {
    function onRoomUpdate({ room }) {
      dispatch({ type: 'APPLY_ROOM_SNAPSHOT', payload: { room } })
    }

    socket.on('room:update', onRoomUpdate)

    return () => {
      socket.off('room:update', onRoomUpdate)
    }
  }, [])

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameStateContext)
  if (!ctx) throw new Error('useGame must be used within GameStateProvider')
  return ctx
}
