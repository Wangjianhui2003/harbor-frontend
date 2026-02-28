import { expect, test, type Page } from '@playwright/test'

const ok = (data: unknown) => ({
  code: 200,
  message: 'ok',
  data,
})

const CURRENT_USER_ID = '100'
const CHAT_A_ID = '2001'
const CHAT_B_ID = '2002'
const CHAT_A_NAME = 'SCROLL_CHAT_A'
const CHAT_B_NAME = 'SCROLL_CHAT_B'

const createMessages = (targetId: string, sendId: string, count: number) => {
  const start = Date.now() - count * 1000
  return Array.from({ length: count }, (_, idx) => {
    const id = idx + 1
    return {
      id: `${targetId}-${id}`,
      recvId: targetId,
      sendId: idx % 2 === 0 ? CURRENT_USER_ID : sendId,
      selfSend: idx % 2 === 0,
      content: `message-${targetId}-${id}`,
      sendTime: start + idx * 1000,
      status: 3,
      type: 0,
    }
  })
}

const createChatData = () => {
  const key = `chats-${CURRENT_USER_ID}`
  const chatAKey = `${key}-PRIVATE-${CHAT_A_ID}`
  const chatBKey = `${key}-PRIVATE-${CHAT_B_ID}`

  return {
    key,
    data: {
      privateMsgMaxId: '0',
      groupMsgMaxId: '0',
      chatKeys: [chatAKey, chatBKey],
    },
    chatAKey,
    chatA: {
      atMe: false,
      delete: false,
      headImage: '',
      lastContent: 'last-a',
      lastSendTime: Date.now() - 2000,
      messages: createMessages(CHAT_A_ID, CHAT_A_ID, 80),
      showName: CHAT_A_NAME,
      pinned: false,
      stored: true,
      targetId: CHAT_A_ID,
      type: 'PRIVATE',
      unreadCount: 0,
    },
    chatBKey,
    chatB: {
      atMe: false,
      delete: false,
      headImage: '',
      lastContent: 'last-b',
      lastSendTime: Date.now() - 1000,
      messages: createMessages(CHAT_B_ID, CHAT_B_ID, 80),
      showName: CHAT_B_NAME,
      pinned: false,
      stored: true,
      targetId: CHAT_B_ID,
      type: 'PRIVATE',
      unreadCount: 0,
    },
  }
}

const seedChatData = async (page: Page) => {
  const payload = createChatData()
  await page.evaluate(async (chatPayload) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('localforage')
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains('keyvaluepairs')) {
          database.createObjectStore('keyvaluepairs')
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const tx = db.transaction('keyvaluepairs', 'readwrite')
    const store = tx.objectStore('keyvaluepairs')
    store.put(chatPayload.data, chatPayload.key)
    store.put(chatPayload.chatA, chatPayload.chatAKey)
    store.put(chatPayload.chatB, chatPayload.chatBKey)

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    db.close()
  }, payload)
}

test.beforeEach(async ({ page }) => {
  let privateSendRequestCount = 0

  await page.addInitScript(() => {
    sessionStorage.setItem('accessToken', 'playwright-access-token')

    class MockWebSocket {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3
      readyState = MockWebSocket.OPEN
      onopen: ((event: Event) => void) | null = null
      onmessage: ((event: MessageEvent) => void) | null = null
      onclose: ((event: CloseEvent) => void) | null = null
      onerror: ((event: Event) => void) | null = null

      constructor(_url: string) {
        setTimeout(() => {
          this.onopen?.(new Event('open'))
        }, 0)
      }

      send(_data: string) {}

      close() {
        this.readyState = MockWebSocket.CLOSED
      }
    }

    Object.defineProperty(window, 'WebSocket', {
      writable: true,
      value: MockWebSocket,
    })
  })

  await page.route('**/api/**', async (route) => {
    const { pathname } = new URL(route.request().url())
    const path = pathname.replace(/^\/api/, '')

    if (path === '/user/self') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          ok({
            id: CURRENT_USER_ID,
            username: 'playwright-user',
            nickname: 'playwright-user',
            headImage: '',
            headImageThumb: '',
            sex: 0,
            isBanned: false,
            type: 0,
            addType: 0,
            online: true,
          }),
        ),
      })
    }

    if (path === '/friend/list') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          ok([
            {
              id: CHAT_A_ID,
              friendNickname: CHAT_A_NAME,
              remark: '',
              headImage: '',
              headImageThumb: '',
              online: true,
              onlineWeb: true,
              onlineApp: false,
              deleted: false,
            },
            {
              id: CHAT_B_ID,
              friendNickname: CHAT_B_NAME,
              remark: '',
              headImage: '',
              headImageThumb: '',
              online: true,
              onlineWeb: true,
              onlineApp: false,
              deleted: false,
            },
          ]),
        ),
      })
    }

    if (path === '/group/list') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok([])),
      })
    }

    if (path === '/webrtc/config') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok({})),
      })
    }

    if (path === '/user/terminal/online') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ok([])),
      })
    }

    if (path === '/message/private/send') {
      const requestId = ++privateSendRequestCount
      await new Promise((resolve) => {
        setTimeout(resolve, 1200)
      })

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          ok({
            id: `rapid-send-${requestId}`,
          }),
        ),
      })
    }

    if (path === `/friend/find/${CHAT_A_ID}`) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          ok({
            id: CHAT_A_ID,
            friendNickname: CHAT_A_NAME,
            remark: '',
            headImage: '',
            headImageThumb: '',
            online: true,
            onlineWeb: true,
            onlineApp: false,
            deleted: false,
          }),
        ),
      })
    }

    if (path === `/friend/find/${CHAT_B_ID}`) {
      await new Promise((resolve) => {
        setTimeout(resolve, 700)
      })
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          ok({
            id: CHAT_B_ID,
            friendNickname: CHAT_B_NAME,
            remark: '',
            headImage: '',
            headImageThumb: '',
            online: true,
            onlineWeb: true,
            onlineApp: false,
            deleted: false,
          }),
        ),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(ok(null)),
    })
  })
})

test('switching chats opens message list at bottom immediately', async ({ page }) => {
  await page.goto('/home/chat')
  await seedChatData(page)
  await page.reload()

  await expect(page.getByText(CHAT_A_NAME, { exact: true })).toBeVisible()
  await page.getByText(CHAT_A_NAME, { exact: true }).click()
  await expect(page.locator('#chat-scroll-area [data-slot="scroll-area-viewport"]')).toBeVisible()

  await page.getByText(CHAT_B_NAME, { exact: true }).click()
  await expect
    .poll(
      async () => {
        return page.evaluate(() => {
          const viewport = document.querySelector(
            '#chat-scroll-area [data-slot="scroll-area-viewport"]',
          ) as HTMLElement | null
          if (!viewport) {
            return Number.POSITIVE_INFINITY
          }
          return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
        })
      },
      { timeout: 120, intervals: [20] },
    )
    .toBeLessThanOrEqual(4)

  const metrics = await page.evaluate(() => {
    const viewport = document.querySelector(
      '#chat-scroll-area [data-slot="scroll-area-viewport"]',
    ) as HTMLElement | null
    if (!viewport) {
      return null
    }
    return {
      scrollHeight: viewport.scrollHeight,
      clientHeight: viewport.clientHeight,
      distanceFromBottom: viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight,
    }
  })

  expect(metrics).not.toBeNull()
  expect(metrics!.scrollHeight).toBeGreaterThan(metrics!.clientHeight)
  expect(metrics!.distanceFromBottom).toBeLessThanOrEqual(4)
})

test('rapid sends keep every optimistic message visible with sending status', async ({ page }) => {
  await page.goto('/home/chat')
  await seedChatData(page)
  await page.reload()

  await expect(page.getByText(CHAT_A_NAME, { exact: true })).toBeVisible()
  await page.getByText(CHAT_A_NAME, { exact: true }).click()

  const input = page.getByPlaceholder('输入消息 shift+enter 换行')
  await input.fill('rapid-send-one')
  await input.press('Enter')
  await input.fill('rapid-send-two')
  await input.press('Enter')

  await expect(page.locator('#chat-scroll-area').getByText('rapid-send-one', { exact: true })).toBeVisible()
  await expect(page.locator('#chat-scroll-area').getByText('rapid-send-two', { exact: true })).toBeVisible()
  await expect
    .poll(
      async () => page.locator('#chat-scroll-area svg.animate-spin').count(),
      { timeout: 500, intervals: [25] },
    )
    .toBe(2)

  await expect
    .poll(
      async () => page.locator('#chat-scroll-area svg.animate-spin').count(),
      { timeout: 2500, intervals: [50] },
    )
    .toBe(0)
})
