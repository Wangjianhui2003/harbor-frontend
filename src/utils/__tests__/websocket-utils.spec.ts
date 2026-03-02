import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WebSocketMessage } from '@/types'
import { HEARTBEAT_INTERVAL, RECONNECT_INTERVAL, RETRY_INTERVAL } from '@/utils/constant'
import { CMD_TYPE } from '@/utils/enums'
import { createWebSocketClient } from '@/utils/websocket-utils'

class MockWebSocket {
  static OPEN = 1
  static instances: MockWebSocket[] = []

  readonly url: string
  readyState = 0
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent<string>) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  send = vi.fn<(payload: string) => void>()
  close = vi.fn<(code?: number) => void>()

  constructor(url: string) {
    this.url = url
    MockWebSocket.instances.push(this)
  }

  emitOpen() {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  emitMessage(payload: WebSocketMessage) {
    this.onmessage?.({ data: JSON.stringify(payload) } as MessageEvent<string>)
  }

  emitClose(code = 1000) {
    this.readyState = 3
    this.onclose?.({ code } as CloseEvent)
  }
}

describe('createWebSocketClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    MockWebSocket.instances = []
    vi.stubGlobal('WebSocket', MockWebSocket)
  })

  it('sends the login payload on open and starts heartbeats after login succeeds', () => {
    const client = createWebSocketClient()
    const onWebSocketLogin = vi.fn()

    client.onWebSocketLogin(onWebSocketLogin)
    client.connect('ws://localhost:8080/ws', 'access-token')

    const socket = MockWebSocket.instances[0]!
    socket.emitOpen()

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        cmd: CMD_TYPE.LOGIN,
        data: { accessToken: 'access-token' },
      }),
    )

    socket.emitMessage({ cmd: CMD_TYPE.LOGIN, data: {} })
    expect(onWebSocketLogin).toHaveBeenCalledOnce()

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL)

    expect(socket.send).toHaveBeenLastCalledWith(
      JSON.stringify({
        cmd: CMD_TYPE.HEARTBEAT,
        data: {},
      }),
    )
  })

  it('forwards non-login messages to the registered handler', () => {
    const client = createWebSocketClient()
    const onMessage = vi.fn()

    client.onMessage(onMessage)
    client.connect('ws://localhost:8080/ws', 'access-token')

    const socket = MockWebSocket.instances[0]!
    const payload: WebSocketMessage = {
      cmd: CMD_TYPE.PRIVATE_MESSAGE,
      data: { text: 'hello' },
    }

    socket.emitMessage(payload)

    expect(onMessage).toHaveBeenCalledWith(payload)
  })

  it('reconnects after the socket closes', () => {
    const client = createWebSocketClient()

    client.connect('ws://localhost:8080/ws', 'access-token')

    const socket = MockWebSocket.instances[0]!
    socket.emitClose(1006)

    expect(MockWebSocket.instances).toHaveLength(1)

    vi.advanceTimersByTime(RECONNECT_INTERVAL)

    expect(MockWebSocket.instances).toHaveLength(2)
    expect(MockWebSocket.instances[1]?.url).toBe('ws://localhost:8080/ws')
  })

  it('retries outbound messages until the socket becomes open', () => {
    const client = createWebSocketClient()
    const payload: WebSocketMessage = {
      cmd: CMD_TYPE.SYSTEM_MESSAGE,
      data: { id: 1 },
    }

    client.connect('ws://localhost:8080/ws', 'access-token')

    const socket = MockWebSocket.instances[0]!

    client.send(payload)
    expect(socket.send).not.toHaveBeenCalled()

    vi.advanceTimersByTime(RETRY_INTERVAL)
    expect(socket.send).not.toHaveBeenCalled()

    socket.readyState = MockWebSocket.OPEN

    vi.advanceTimersByTime(RETRY_INTERVAL)

    expect(socket.send).toHaveBeenCalledWith(JSON.stringify(payload))
  })

  it('clears heartbeat and reconnect timers when closed manually', () => {
    const client = createWebSocketClient()

    client.connect('ws://localhost:8080/ws', 'access-token')

    const socket = MockWebSocket.instances[0]!
    socket.emitOpen()
    socket.emitMessage({ cmd: CMD_TYPE.LOGIN, data: {} })

    client.close(3000)

    expect(socket.close).toHaveBeenCalledWith(3000)

    vi.advanceTimersByTime(HEARTBEAT_INTERVAL + RECONNECT_INTERVAL)

    expect(socket.send).toHaveBeenCalledTimes(1)
    expect(MockWebSocket.instances).toHaveLength(1)
  })
})
