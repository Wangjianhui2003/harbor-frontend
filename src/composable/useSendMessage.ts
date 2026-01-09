import { ref } from 'vue'
import useChatStore from '@/stores/chatStore'
import useUserStore from '@/stores/userStore'
import { sendPrivateMessage } from '@/api/private-msg'
import { sendGroupMessage } from '@/api/group-msg'
import { MESSAGE_TYPE, MESSAGE_STATUS, CHATINFO_TYPE } from '@/utils/enums'
import type {
  PrivateMessage,
  GroupMessage,
  PrivateMessageDTO,
  GroupMessageDTO,
  ChatInfo,
  BaseMessage,
} from '@/types/chat'
import type { MessageType } from '@/utils/enums'

export interface SendMessageOptions {
  content: string
  type: MessageType
  /** 群聊 @ 用户 ID 列表（仅群聊有效） */
  atUserIds?: number[]
  /** 是否需要回执（仅群聊有效） */
  receipt?: boolean
  /** 引用的消息 */
  quoteMessage?: PrivateMessage | GroupMessage
}

export function useSendMessage() {
  const chatStore = useChatStore()
  const userStore = useUserStore()

  const isSending = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 发送消息（通用方法）
   * @param options 消息选项
   * @returns 是否发送成功
   */
  async function sendMessage(options: SendMessageOptions): Promise<boolean> {
    const { content, type, atUserIds = [], receipt = false, quoteMessage } = options
    const trimmedContent = content.trim()

    if (!trimmedContent || !chatStore.activeChat || isSending.value) {
      return false
    }

    const tmpId = crypto.randomUUID()
    const chat = chatStore.activeChat
    const chatInfo: ChatInfo = {
      targetId: chat.targetId,
      type: chat.type,
      showName: chat.showName,
      headImage: chat.headImage,
    }

    isSending.value = true
    error.value = null

    try {
      if (chat.type === CHATINFO_TYPE.PRIVATE) {
        const localMsg: PrivateMessage = {
          id: 0,
          tmpId,
          content: trimmedContent,
          type,
          sendId: userStore.userInfo.id,
          recvId: chat.targetId,
          sendTime: Date.now(),
          selfSend: true,
          status: MESSAGE_STATUS.UNSENT,
          quoteMessage: quoteMessage as PrivateMessage | undefined,
        }
        chatStore.insertMessage(localMsg, chatInfo)

        const dto: PrivateMessageDTO = {
          recvId: chat.targetId,
          content: trimmedContent,
          type,
        }
        const result = await sendPrivateMessage(dto)
        chatStore.updateMessage(
          { ...localMsg, id: result.id, status: MESSAGE_STATUS.SENT },
          chatInfo,
        )
      } else {
        const localMsg: GroupMessage = {
          id: 0,
          tmpId,
          content: trimmedContent,
          type,
          groupId: chat.targetId,
          sendId: userStore.userInfo.id,
          sendNickname: userStore.userInfo.nickname,
          sendTime: Date.now(),
          selfSend: true,
          status: MESSAGE_STATUS.UNSENT,
          readCount: 0,
          receipt,
          receiptOk: null,
          atUserIds,
          quoteMessage: quoteMessage as GroupMessage | undefined,
        }
        chatStore.insertMessage(localMsg, chatInfo)

        const dto: GroupMessageDTO = {
          groupId: chat.targetId,
          content: trimmedContent,
          type,
          atUserIds: atUserIds.length > 0 ? atUserIds : undefined,
          receipt: receipt || undefined,
        }
        const result = await sendGroupMessage(dto)
        chatStore.updateMessage(
          { ...localMsg, id: result.id, status: MESSAGE_STATUS.SENT },
          chatInfo,
        )
      }

      return true
    } catch (err) {
      console.error('消息发送失败', err)
      error.value = err instanceof Error ? err : new Error('发送失败')

      // 更新消息状态为 ERROR
      if (chat.type === CHATINFO_TYPE.PRIVATE) {
        const errorMsg: PrivateMessage = {
          id: -1,
          tmpId,
          content: trimmedContent,
          type,
          sendId: userStore.userInfo.id,
          recvId: chat.targetId,
          sendTime: Date.now(),
          selfSend: true,
          status: MESSAGE_STATUS.ERROR,
          quoteMessage: quoteMessage as PrivateMessage | undefined,
        }
        chatStore.updateMessage(errorMsg, chatInfo)
      } else {
        const errorMsg: GroupMessage = {
          id: -1,
          tmpId,
          content: trimmedContent,
          type,
          groupId: chat.targetId,
          sendId: userStore.userInfo.id,
          sendNickname: userStore.userInfo.nickname,
          sendTime: Date.now(),
          selfSend: true,
          status: MESSAGE_STATUS.ERROR,
          readCount: 0,
          receipt,
          receiptOk: null,
          atUserIds,
          quoteMessage: quoteMessage as GroupMessage | undefined,
        }
        chatStore.updateMessage(errorMsg, chatInfo)
      }

      return false
    } finally {
      isSending.value = false
    }
  }

  /** 发送文本消息 */
  function sendTextMessage(content: string) {
    return sendMessage({ content, type: MESSAGE_TYPE.TEXT })
  }

  /** 发送图片消息 */
  function sendImageMessage(imageUrl: string) {
    return sendMessage({ content: imageUrl, type: MESSAGE_TYPE.IMAGE })
  }

  /** 发送文件消息 */
  function sendFileMessage(fileInfo: string) {
    return sendMessage({ content: fileInfo, type: MESSAGE_TYPE.FILE })
  }

  /**
   * 重发失败的消息
   * @param message 需要重发的消息
   * @param chatInfo 聊天信息
   * @returns 是否发送成功
   */
  async function resendMessage(message: BaseMessage, chatInfo: ChatInfo): Promise<boolean> {
    if (message.status !== MESSAGE_STATUS.ERROR || isSending.value) {
      return false
    }

    isSending.value = true
    error.value = null

    // 先将状态改为 UNSENT
    chatStore.updateMessage({ ...message, status: MESSAGE_STATUS.UNSENT }, chatInfo)

    try {
      if (chatInfo.type === CHATINFO_TYPE.PRIVATE) {
        const privateMsg = message as PrivateMessage
        const dto: PrivateMessageDTO = {
          recvId: privateMsg.recvId,
          content: privateMsg.content,
          type: privateMsg.type,
        }
        const result = await sendPrivateMessage(dto)
        chatStore.updateMessage(
          { ...message, id: result.id, status: MESSAGE_STATUS.SENT },
          chatInfo,
        )
      } else {
        const groupMsg = message as GroupMessage
        const dto: GroupMessageDTO = {
          groupId: groupMsg.groupId,
          content: groupMsg.content,
          type: groupMsg.type,
          atUserIds: groupMsg.atUserIds?.length ? groupMsg.atUserIds : undefined,
          receipt: groupMsg.receipt || undefined,
        }
        const result = await sendGroupMessage(dto)
        chatStore.updateMessage(
          { ...message, id: result.id, status: MESSAGE_STATUS.SENT },
          chatInfo,
        )
      }
      return true
    } catch (err) {
      console.error('消息重发失败', err)
      error.value = err instanceof Error ? err : new Error('重发失败')
      // 恢复为 ERROR 状态
      chatStore.updateMessage({ ...message, status: MESSAGE_STATUS.ERROR }, chatInfo)
      return false
    } finally {
      isSending.value = false
    }
  }

  return {
    isSending,
    error,
    sendMessage,
    sendTextMessage,
    sendImageMessage,
    sendFileMessage,
    resendMessage,
  }
}
