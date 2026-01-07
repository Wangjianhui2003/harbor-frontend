export const MESSAGE_TYPE = {
  TEXT: 0,
  IMAGE: 1,
  FILE: 2,
  AUDIO: 3,
  VIDEO: 4,
  RECALL: 10,
  READ: 11,
  RECEIPT: 12,
  TIP_TIME: 20,
  TIP_TEXT: 21,
  LOADING: 30,

  ACT_RT_VOICE: 40,
  ACT_RT_VIDEO: 41,

  USER_BANNED: 50,

  FRIEND_NEW: 80,
  FRIEND_DEL: 81,
  GROUP_NEW: 90,
  GROUP_DEL: 91,

  RTC_CALL_VOICE: 100,
  RTC_CALL_VIDEO: 101,
  RTC_ACCEPT: 102,
  RTC_REJECT: 103,
  RTC_CANCEL: 104,
  RTC_FAILED: 105,
  RTC_HANGUP: 106,

  RTC_CANDIDATE: 107,
  RTC_GROUP_SETUP: 200,
  RTC_GROUP_ACCEPT: 201,
  RTC_GROUP_REJECT: 202,
  RTC_GROUP_FAILED: 203,
  RTC_GROUP_CANCEL: 204,
  RTC_GROUP_QUIT: 205,
  RTC_GROUP_INVITE: 206,
  RTC_GROUP_JOIN: 207,
  RTC_GROUP_OFFER: 208,
  RTC_GROUP_ANSWER: 209,
  RTC_GROUP_CANDIDATE: 210,
  RTC_GROUP_DEVICE: 211,
} as const

export const RTC_STATE = {
  FREE: 0, //空闲，可以被呼叫
  WAIT_CALL: 1, // 呼叫后等待
  WAIT_ACCEPT: 2, // 被呼叫后等待
  ACCEPTED: 3, // 已接受聊天，等待建立连接
  CHATTING: 4, // 聊天中
} as const

//终端类型
export const TERMINAL_TYPE = {
  WEB: 0,
  APP: 1,
  PC: 2,
} as const

export const MESSAGE_STATUS = {
  UNSENT: 0,
  SENT: 1,
  RECALL: 2,
  READ: 3,
} as const

export const MSG_INFO_LOAD_STATUS = {
  LOADING: 'loading',
  FAIL: 'fail',
  OK: 'ok',
} as const

/**
 * 登录
 * 心跳
 * 强制登出
 * 私信
 * 群消息
 * 系统消息
 */
export const CMD_TYPE = {
  LOGIN: 0,
  HEARTBEAT: 1,
  FORCE_LOGOUT: 2,
  PRIVATE_MESSAGE: 3,
  GROUP_MESSAGE: 4,
  SYSTEM_MESSAGE: 5,
} as const

/**
 * 会话类型
 */
export const CHATINFO_TYPE = {
  PRIVATE: 'PRIVATE',
  GROUP: 'GROUP',
} as const

/**
 * 聊天框内容类型
 */
export const MSG_CONTENT_TYPE = {
  TEXT: 'text',
  FILE: 'file',
  IMAGE: 'image',
} as const

/**
 * 消息操作枚举
 */
export const MSG_ITEM_OP = {
  DELETE: 'DELETE',
  RECALL: 'RECALL',
} as const

/**
 * RTC通话状态枚举
 */
export const WEBRTC_STATE = {
  CLOSE: 'CLOSE',
  WAITING: 'WAITING',
  CHATTING: 'CHATTING',
  ERROR: 'ERROR',
} as const

/**
 * RTC通话模式
 */
export const WEBRTC_MODE = {
  VIDEO: 'VIDEO',
  VOICE: 'VOICE',
} as const

export const WEBSOCKET_CLOSE_CODE = {
  FORCE_LOGOUT: 3000,
}
// 类型导出
export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE]
export type RTCStateType = (typeof RTC_STATE)[keyof typeof RTC_STATE]
export type TerminalType = (typeof TERMINAL_TYPE)[keyof typeof TERMINAL_TYPE]
export type MessageStatusType = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS]
export type CmdType = (typeof CMD_TYPE)[keyof typeof CMD_TYPE]
export type ChatInfoType = (typeof CHATINFO_TYPE)[keyof typeof CHATINFO_TYPE]
export type MsgContentType = (typeof MSG_CONTENT_TYPE)[keyof typeof MSG_CONTENT_TYPE]
export type MsgItemOpType = (typeof MSG_ITEM_OP)[keyof typeof MSG_ITEM_OP]
export type WebRTCStateType = (typeof WEBRTC_STATE)[keyof typeof WEBRTC_STATE]
export type WebRTCModeType = (typeof WEBRTC_MODE)[keyof typeof WEBRTC_MODE]
