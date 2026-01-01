import type { PrivateMessageDTO } from '@/types/chat'
import http from './http/http'

//发送私聊消息
const sendPrivateMessage = async (data: PrivateMessageDTO) => {
  const res = await http({
    url: '/message/private/send',
    method: 'post',
    data,
  })
  return res.data.data
}

//撤回私聊消息
const recallPrivateMessage = async (id: number) => {
  await http({
    url: `/message/private/recall/${id}`,
    method: 'delete',
  })
  return undefined
}

//拉取离线消息（通过 websocket 异步推送）
const pullOfflinePrivateMessage = async (minId: number) => {
  const res = await http({
    url: '/message/private/pullOfflineMessage',
    method: 'get',
    params: { minId },
  })
  return res.data.data
}

//设置会话中接收的消息为已读
const readPrivateMessage = async (friendId: number) => {
  await http({
    url: '/message/private/readed',
    method: 'put',
    params: { friendId },
  })
  return undefined
}

//获取某个会话中已读消息的最大 ID
const getMaxReadPrivateMessageId = async (friendId: number): Promise<number> => {
  const res = await http({
    url: '/message/private/maxReadedId',
    method: 'get',
    params: { friendId },
  })
  return res.data.data
}

//查询聊天记录
const getPrivateMessageHistory = async (friendId: number, page: number, size: number) => {
  const res = await http({
    url: '/message/private/history',
    method: 'get',
    params: { friendId, page, size },
  })
  return res.data.data
}

export {
  sendPrivateMessage,
  recallPrivateMessage,
  pullOfflinePrivateMessage,
  readPrivateMessage,
  getMaxReadPrivateMessageId,
  getPrivateMessageHistory,
}
