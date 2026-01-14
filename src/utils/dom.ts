import { nextTick } from 'vue'

/**
 * 滚动元素到底部
 * @param selector CSS 选择器，默认为聊天窗口的滚动区域
 * @param smooth 是否使用平滑滚动，默认为 false
 */
export function scrollToBottom(
  selector = '#chat-scroll-area [data-slot="scroll-area-viewport"]',
  smooth = false,
) {
  nextTick(() => {
    const container = document.querySelector(selector)
    if (container) {
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      } else {
        container.scrollTop = container.scrollHeight
      }
    }
  })
}

/**
 * 滚动元素到顶部
 * @param selector CSS 选择器，默认为聊天窗口的滚动区域
 * @param smooth 是否使用平滑滚动，默认为 false
 */
export function scrollToTop(selector = '[data-slot="scroll-area-viewport"]', smooth = false) {
  nextTick(() => {
    const container = document.querySelector(selector)
    if (container) {
      if (smooth) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      } else {
        container.scrollTop = 0
      }
    }
  })
}

/**
 * 检测滚动元素是否在底部
 * @param selector CSS 选择器，默认为聊天窗口的滚动区域
 * @param threshold 允许的误差阈值，默认为 20px
 * @returns boolean 是否在底部
 */
export function isScrollAtBottom(
  selector = '#chat-scroll-area [data-slot="scroll-area-viewport"]',
  threshold = 20,
): boolean {
  const container = document.querySelector(selector)
  if (!container) return false
  return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
}
