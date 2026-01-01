import http from './http/http'
import { WEBRTC_MODE } from '@/utils/enums'

//呼叫视频通话
const call = async (userId: number, mode = WEBRTC_MODE.VIDEO, offer: string) => {
  const res = await http({
    url: '/webrtc/private/call',
    method: 'post',
    params: { userId, mode },
    data: offer,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
  return res.data.data
}

//接受视频通话
const accept = async (userId: number, answer: string) => {
  const res = await http({
    url: '/webrtc/private/accept',
    method: 'post',
    params: { userId },
    data: answer,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
  return res.data.data
}

//拒绝视频通话
const reject = async (userId: number) => {
  await http({
    url: '/webrtc/private/reject',
    method: 'post',
    params: { userId },
  })
  return undefined
}

//取消呼叫
const cancel = async (userId: number) => {
  await http({
    url: '/webrtc/private/cancel',
    method: 'post',
    params: { userId },
  })
  return undefined
}

//呼叫失败
const failed = async (userId: number, reason: string) => {
  await http({
    url: '/webrtc/private/failed',
    method: 'post',
    params: { userId, reason },
  })
  return undefined
}

//挂断
const hangup = async (userId: number) => {
  await http({
    url: '/webrtc/private/hangup',
    method: 'post',
    params: { userId },
  })
  return undefined
}

//同步 candidate
const sendCandidate = async (userId: number, candidate: string) => {
  const res = await http({
    url: '/webrtc/private/candidate',
    method: 'post',
    params: { userId },
    data: candidate,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
  return res.data.data
}

//心跳
const heartbeat = async (userId: number) => {
  await http({
    url: '/webrtc/private/heartbeat',
    method: 'post',
    params: { userId },
  })
  return undefined
}

export { call, accept, reject, cancel, failed, hangup, sendCandidate, heartbeat }
