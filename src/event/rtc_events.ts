export const RTC_EVENTS = {
  // 发起视频通话（本地触发）
  VIDEO_CALL_START: 'video-call-start',
  // 收到视频来电（WebSocket触发）
  VIDEO_CALL_INCOMING: 'video-call-incoming',
  // 对方接受
  VIDEO_CALL_ACCEPTED: 'video-call-accepted',
  // 对方拒绝
  VIDEO_CALL_REJECTED: 'video-call-rejected',
  // 对方取消
  VIDEO_CALL_CANCELLED: 'video-call-cancelled',
  // 通话挂断
  VIDEO_CALL_HANGUP: 'video-call-hangup',
  // ICE candidate
  VIDEO_CALL_CANDIDATE: 'video-call-candidate',
  // 通话失败
  VIDEO_CALL_FAILED: 'video-call-failed',

  // ========== 语音通话 ==========
  VOICE_CALL_START: 'voice-call-start',
  VOICE_CALL_INCOMING: 'voice-call-incoming',
  VOICE_CALL_ACCEPTED: 'voice-call-accepted',
  VOICE_CALL_REJECTED: 'voice-call-rejected',
  VOICE_CALL_CANCELLED: 'voice-call-cancelled',
  VOICE_CALL_HANGUP: 'voice-call-hangup',
  VOICE_CALL_CANDIDATE: 'voice-call-candidate',
  VOICE_CALL_FAILED: 'voice-call-failed',
} as const

export type RTCEventType = (typeof RTC_EVENTS)[keyof typeof RTC_EVENTS]
