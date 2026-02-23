export function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function createRoom({ hostId, roomName }) {
  const code = generateRoomCode()
  return {
    id: code,
    code,
    name: roomName || `Room ${code}`,
    hostId,
    createdAt: Date.now(),
    users: [],
    phase: 'lobby',
  }
}

export function joinRoom(room, user) {
  if (room.users.some((u) => u.id === user.id)) return room
  if (room.users.length >= 10) throw new Error('Room is full')
  return { ...room, users: [...room.users, user] }
}

export function leaveRoom(room, userId) {
  return { ...room, users: room.users.filter((u) => u.id !== userId) }
}

export function isRoomHost(room, userId) {
  return room.hostId === userId
}
