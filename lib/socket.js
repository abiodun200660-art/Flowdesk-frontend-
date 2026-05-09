'use client'

import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
  }
  return socket
}

export const connectSocket = (userId) => {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
    s.emit('set_user', userId)
  }
  return s
}

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect()
}

export const joinWorkspace = (workspaceId) => {
  getSocket().emit('join_workspace', workspaceId)
}

export const leaveWorkspace = (workspaceId) => {
  getSocket().emit('leave_workspace', workspaceId)
}

export const emitPresence = (workspaceId, status) => {
  getSocket().emit('presence', { workspaceId, status })
}

export default getSocket
