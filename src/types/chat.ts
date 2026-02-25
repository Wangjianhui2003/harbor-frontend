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
  targetId: string
  type: string
  showName: string
  headImage: string
}

//本地存储的聊天数据结构
export interface ChatsData {
  privateMsgMaxId: string
  groupMsgMaxId: string
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
  pinned?: boolean // 是否固定
  stored: boolean
  targetId: string
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
  pinned?: boolean // 是否固定
  stored: boolean
  targetId: string
  type: string
  unreadCount: number
}

// 群聊消息
export interface GroupMessage {
  atUserIds: string[]
  content: string
  groupId: string
  id: string
  readCount: number
  receipt: boolean
  receiptOk: boolean | null
  selfSend: boolean
  sendId: string
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
  id: string
  recvId: string
  selfSend: boolean
  sendId: string
  sendTime: number
  status: MessageStatusType
  type: MessageType
  quoteMessage?: PrivateMessage
  loadStatus?: MsgInfoLoadStatusType
  tmpId?: string
}

// 私聊消息DTO
export interface PrivateMessageDTO {
  recvId: string
  content: string
  type: MessageType
}

// 群聊消息DTO
export interface GroupMessageDTO {
  groupId: string
  content: string
  type: MessageType
  atUserIds?: string[]
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
