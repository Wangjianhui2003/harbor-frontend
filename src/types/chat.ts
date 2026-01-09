import type {
  MESSAGE_TYPE,
  MessageStatusType,
  MsgInfoLoadStatusType,
  MessageType,
} from '@/utils/enums'

export type BaseMessage = GroupMessage | PrivateMessage

export type Message = GroupMessage | PrivateMessage | TimeTipMessage

export type Chat = GroupChat | PrivateChat

// 聊天信息类型
export interface ChatInfo {
  targetId: number
  type: string
  showName: string
  headImage: string
}

//本地存储的聊天数据结构
export interface ChatsData {
  privateMsgMaxId: number
  groupMsgMaxId: number
  chatKeys: string[]
  chats?: (GroupChat | PrivateChat)[]
}

export interface GroupChat {
  atAll: boolean
  atMe: boolean
  delete: boolean
  headImage: string
  lastContent: string
  lastSendTime: number
  lastTimeTip?: number
  messages: (GroupMessage | TimeTipMessage)[]
  showName: string // 显示名称,由ChatInfo决定
  groupName: string
  stored: boolean
  targetId: number
  type: string
  unreadCount: number
}

export interface PrivateChat {
  atMe: boolean
  delete: boolean
  headImage: string
  lastContent: string
  lastSendTime: number
  lastTimeTip?: number
  messages: (PrivateMessage | TimeTipMessage)[]
  showName: string // 显示名称,由ChatInfo决定
  stored: boolean
  targetId: number
  type: string
  unreadCount: number
}

// 群聊消息
export interface GroupMessage {
  atUserIds: number[]
  content: string
  groupId: number
  id: number
  readCount: number
  receipt: boolean
  receiptOk: boolean | null
  selfSend: boolean
  sendId: number
  sendNickname: string
  sendTime: number
  status: MessageStatusType
  type: MessageType
  tmpId?: string
  quoteMessage?: GroupMessage
  loadStatus?: MsgInfoLoadStatusType
}

// 私聊消息
export interface PrivateMessage {
  content: string
  id: number
  recvId: number
  selfSend: boolean
  sendId: number
  sendTime: number
  status: MessageStatusType
  type: MessageType
  quoteMessage?: PrivateMessage
  loadStatus?: MsgInfoLoadStatusType
  tmpId?: string
}

// 私聊消息DTO
export interface PrivateMessageDTO {
  recvId: number
  content: string
  type: MessageType
}

// 群聊消息DTO
export interface GroupMessageDTO {
  groupId: number
  content: string
  type: MessageType
  atUserIds?: number[]
  receipt?: boolean
}

export interface TimeTipMessage {
  sendTime: number
  type: MessageType
}

export interface ImageContent {
  thumbUrl: string
  originUrl: string
}
