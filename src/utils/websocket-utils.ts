import type { WebSocketMessage } from '@/types'
import { CMD_TYPE } from '@/utils/enums'
import { HEARTBEAT_INTERVAL, RECONNECT_INTERVAL, RETRY_INTERVAL } from '@/utils/constant'

export function createWebSocketClient() {
  let socket: WebSocket | null = null
  let isConnected: boolean = false
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  //连接成功回调(拉取消息)
  let onConnect: (() => void) | null = null
  //收到消息回调（处理消息）
  let onMessage: ((msg: WebSocketMessage) => void) | null = null
  //连接关闭回调
  let onClose: ((e: CloseEvent) => void) | null = null

  const heartbeat = {
    timer: null as ReturnType<typeof setTimeout> | null,
    send() {
      if (!isConnected || !socket) return
      const heartbeat: WebSocketMessage = { cmd: CMD_TYPE.HEARTBEAT, data: {} }
      socket.send(JSON.stringify(heartbeat))
    },
    reset() {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => this.send(), HEARTBEAT_INTERVAL)
    },
  }

  const connect = (url: string, accessToken: string) => {
    if (isConnected) return
    try {
      socket = new WebSocket(url)
    } catch (err) {
      console.error('WebSocket 创建失败，准备重连', err)
      return scheduleReconnect(url, accessToken)
    }

    socket.onopen = () => {
      isConnected = true
      socket?.send(JSON.stringify({ cmd: CMD_TYPE.LOGIN, data: { accessToken } }))
    }

    socket.onmessage = (e) => {
      const payload = JSON.parse(e.data) as WebSocketMessage
      switch (payload.cmd) {
        case CMD_TYPE.LOGIN:
          // 登录成功
          heartbeat.reset()
          onConnect?.()
          break
        case CMD_TYPE.HEARTBEAT:
          // 收到心跳响应
          heartbeat.reset()
          break
        default:
          // 其他消息
          onMessage?.(payload)
      }
    }

    socket.onclose = (e) => {
      isConnected = false
      onClose?.(e)
      scheduleReconnect(url, accessToken)
    }

    socket.onerror = (e) => {
      console.error('WebSocket 出错', e)
      socket?.close()
    }
  }

  const scheduleReconnect = (url: string, token: string) => {
    if (isConnected) return
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => connect(url, token), RECONNECT_INTERVAL)
  }

  const close = (code: number) => {
    isConnected = false
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (heartbeat.timer) clearTimeout(heartbeat.timer)
    socket?.close(code)
  }

  const send = (data: WebSocketMessage) => {
    if (!socket) return
    if (socket.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify(data)
      socket.send(payload)
    } else {
      // 简单重试：1 秒后再试一次
      setTimeout(() => send(data), RETRY_INTERVAL)
    }
  }

  return {
    connect,
    close,
    send,
    onConnect: (handler: () => void) => (onConnect = handler),
    onMessage: (handler: (msg: WebSocketMessage) => void) => (onMessage = handler),
    onClose: (handler: (e: CloseEvent) => void) => (onClose = handler),
  }
}
