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
  sex: number
  isBanned: boolean
  signature?: string
  type: number //用户类型
  addType: number //添加方式
  lastLoginTime?: string
  region?: string //地区
  online: boolean
  reason?: string
}

// 好友state
export interface Friend {
  id: number
  friendNickname: string //好友原始昵称
  remark?: string //好友备注名
  headImage: string
  headImageThumb?: string
  online: boolean
  onlineWeb: boolean
  onlineApp: boolean
  deleted: boolean
}

// 群组相关类型
export interface Group {
  id: number
  name: string
  ownerId: number
  headImage: string
  headImageThumb: string
  notice?: string
  remarkNickname?: string //用户在群内的备注昵称
  showNickname?: string //用户在群内显示的昵称
  showGroupName?: string //显示给该用户的群名称
  remarkGroupName?: string //用户备注的群名称
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
  userNickname: string //用户原昵称
  remarkNickname?: string //群内设置的备注昵称
  remark: string
  role: number // 0-群主 1-管理员 2-普通成员
  online: boolean
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
