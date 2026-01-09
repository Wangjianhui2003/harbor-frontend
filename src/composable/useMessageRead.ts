import { onMounted, onUnmounted, type Ref } from 'vue'
import type { BaseMessage } from '@/types/chat'
import { MESSAGE_STATUS, CHATINFO_TYPE } from '@/utils/enums'
import { readPrivateMessage } from '@/api/private-msg'
import { readGroupMessage } from '@/api/group-msg'
import useChatStore from '@/stores/chatStore'

// 全局防抖状态 - 按 chatKey 分组，避免同一个会话的重复请求
const pendingReads = new Map<string, ReturnType<typeof setTimeout>>()
const DEBOUNCE_DELAY = 300 // 300ms 防抖

/**
 * 消息可见时自动标记为已读
 * 使用 Intersection Observer API 监听消息元素是否出现在可视区域
 * 使用防抖优化，合并同一会话的多次已读请求
 */
export function useMessageRead(message: BaseMessage, elementRef: Ref<HTMLElement | null>) {
  const chatStore = useChatStore()
  let observer: IntersectionObserver | null = null

  const markAsRead = () => {
    // 自己发送的消息不需要标记
    if (message.selfSend) return
    // 已经是已读状态不需要重复标记
    if (message.status === MESSAGE_STATUS.READ) return
    // 已撤回的消息不需要标记
    if (message.status === MESSAGE_STATUS.RECALL) return
    // 没有打开的聊天不需要标记
    if (!chatStore.activeChat) return

    const chatType = chatStore.activeChat.type
    const targetId = chatStore.activeChat.targetId
    const chatKey = `${chatType}-${targetId}`

    // 更新本地消息状态
    message.status = MESSAGE_STATUS.READ

    // 更新未读计数
    if (chatStore.activeChat.unreadCount > 0) {
      chatStore.activeChat.unreadCount--
    }

    // 防抖：取消之前的请求，重新计时
    if (pendingReads.has(chatKey)) {
      clearTimeout(pendingReads.get(chatKey))
    }

    // 设置新的定时器
    const timer = setTimeout(async () => {
      pendingReads.delete(chatKey)
      try {
        if (chatType === CHATINFO_TYPE.PRIVATE) {
          await readPrivateMessage(targetId)
        } else if (chatType === CHATINFO_TYPE.GROUP) {
          await readGroupMessage(targetId)
        }
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    }, DEBOUNCE_DELAY)

    pendingReads.set(chatKey, timer)
  }

  onMounted(() => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markAsRead()
            // 标记后取消观察，避免重复调用
            if (observer && elementRef.value) {
              observer.unobserve(elementRef.value)
            }
          }
        })
      },
      {
        // 只要有一点可见就触发
        threshold: 0.1,
        // 使用滚动容器作为 root
        root: document.querySelector('.overflow-auto'),
      },
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    markAsRead,
  }
}
