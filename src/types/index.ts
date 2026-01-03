//http response
export interface HttpResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 验证码响应
export interface CaptchaResp {
  captchaPic: string
  captchaKey: string
}

// 用户
export interface User {
  id: number
  username: string
  nickname: string
  headImage: string
  headImageThumb: string
  email?: string
  phoneNumber?: string
  sex?: number
  isBanned?: boolean
  signature: string
  type: number
}

// 好友相关类型
export interface Friend {
  id: number
  friendNickname: string
  headImage: string
  headImageThumb?: string
  online: boolean
  onlineWeb: boolean
  onlineApp: boolean
  deleted?: boolean
}

// 群组相关类型
export interface Group {
  id: number
  name: string
  ownerId: number
  headImage: string
  headImageThumb: string
  notice?: string
  remarkNickname?: string
  showNickname?: string
  showGroupName?: string
  remarkGroupName?: string
  dissolve: boolean
  isBanned: boolean
  reason: string
  memberCount: number
  joinType?: number
  quit: boolean
}

export interface GroupMember {
  userId: number
  nickname: string
  headImage: string
  showNickname: string
  remark: string
  isOwner: boolean
  quit: boolean
}

// RTC信息类型
export interface RTCInfo {
  friend: Friend | Record<string, never>
  mode: string
  state: number
}

// WebRTC配置
export interface WebRTCConfig {
  maxChannel?: number
  iceServers?: RTCIceServer[]
}

// 在线终端类型
export interface OnlineTerminal {
  userId: number
  terminals: number[]
}

// WebSocket发送信息
export interface WebSocketMessage {
  cmd: number
  data: unknown
}
