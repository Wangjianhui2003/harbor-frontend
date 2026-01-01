import type { MESSAGE_TYPE, MessageType } from '@/utils/enums'

// 聊天会话类型
export interface Chat {
  atAll: boolean
  atMe: boolean
  delete: boolean
  headImage: string
  lastContent: string
  lastSendTime: number
  lastTimeTip?: number
  messages: (MessageInfo | TimeTipMessage)[]
  sendNickname?: string
  showName: string
  stored: boolean
  targetId: number
  type: string
  unreadCount: number
}

// 消息相关类型
export interface MessageInfo {
  id: number
  sendId: number
  recvId: number
  content: string
  type: number
  status: number
  sendTime: number
  sendNickname?: string
  loadStatus?: string
  selfSend?: boolean
  groupId?: number
  atUserIds?: number[]
  receipt?: boolean
  receiptOk?: boolean
  quoteMessage?: MessageInfo
  tmpId?: string
}

export interface TimeTipMessage {
  sendTime: number
  type: typeof MESSAGE_TYPE.TIP_TIME
}

// 聊天信息类型
export interface ChatInfo {
  targetId: number
  type: string
  showName: string
  headImage: string
}

//
export interface ChatsData {
  privateMsgMaxId: number
  groupMsgMaxId: number
  chatKeys: string[]
  chats?: Chat[]
}

// 私聊消息DTO
export interface PrivateMessageDTO {
  recvId: number
  content: string
  type: number
}

// 群聊消息DTO
export interface GroupMessageDTO {
  groupId: number
  content: string
  type: number
  atUserIds?: number[]
  receipt?: boolean
}
