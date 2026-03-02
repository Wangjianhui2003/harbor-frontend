import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { isScrollAtBottom, scrollToBottom, scrollToTop } from '@/utils/dom'

const setScrollMetrics = (
  element: HTMLElement,
  {
    scrollHeight = 0,
    clientHeight = 0,
    scrollTop = 0,
  }: {
    scrollHeight?: number
    clientHeight?: number
    scrollTop?: number
  },
) => {
  Object.defineProperty(element, 'scrollHeight', { value: scrollHeight, configurable: true })
  Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true })
  Object.defineProperty(element, 'scrollTop', { value: scrollTop, writable: true, configurable: true })
}

describe('dom scroll utils', () => {
  it('scrolls the default viewport to the bottom', async () => {
    document.body.innerHTML =
      '<div id="chat-scroll-area"><div data-slot="scroll-area-viewport"></div></div>'
    const viewport = document.querySelector(
      '#chat-scroll-area [data-slot="scroll-area-viewport"]',
    ) as HTMLElement

    setScrollMetrics(viewport, { scrollHeight: 900, clientHeight: 300, scrollTop: 0 })

    scrollToBottom()
    await nextTick()

    expect(viewport.scrollTop).toBe(900)
  })

  it('uses smooth scrolling when requested', async () => {
    const viewport = document.createElement('div')
    viewport.scrollTo = vi.fn()
    setScrollMetrics(viewport, { scrollHeight: 640 })

    scrollToBottom(viewport, true)
    await nextTick()

    expect(viewport.scrollTo).toHaveBeenCalledWith({
      top: 640,
      behavior: 'smooth',
    })
  })

  it('scrolls a matched element to the top', async () => {
    document.body.innerHTML = '<div data-slot="scroll-area-viewport"></div>'
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement

    setScrollMetrics(viewport, { scrollTop: 250 })

    scrollToTop()
    await nextTick()

    expect(viewport.scrollTop).toBe(0)
  })

  it('checks whether the viewport is within the bottom threshold', () => {
    document.body.innerHTML =
      '<div id="chat-scroll-area"><div data-slot="scroll-area-viewport"></div></div>'
    const viewport = document.querySelector(
      '#chat-scroll-area [data-slot="scroll-area-viewport"]',
    ) as HTMLElement

    setScrollMetrics(viewport, { scrollHeight: 900, clientHeight: 300, scrollTop: 580 })
    expect(isScrollAtBottom()).toBe(true)

    setScrollMetrics(viewport, { scrollHeight: 900, clientHeight: 300, scrollTop: 540 })
    expect(isScrollAtBottom()).toBe(false)
  })
})
