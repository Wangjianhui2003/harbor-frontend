import type { GroupMessageDTO } from '@/types/chat'
import http from './http/http'

//发送群聊消息
const sendGroupMessage = async (data: GroupMessageDTO) => {
  const res = await http({
    url: '/message/group/send',
    method: 'post',
    data,
  })
  return res.data.data
}

//撤回消息
const recallGroupMessage = async (id: number) => {
  await http({
    url: `/message/group/recall/${id}`,
    method: 'delete',
  })
  return undefined
}

//拉取离线消息（消息将通过 websocket 异步推送）
const pullOfflineGroupMessage = async (minId: number) => {
  const res = await http({
    url: '/message/group/pullOfflineMessage',
    method: 'get',
    params: { minId },
  })
  return res.data.data
}

//设置群聊消息为已读
const readGroupMessage = async (groupId: number) => {
  await http({
    url: '/message/group/readed',
    method: 'put',
    params: { groupId },
  })
  return undefined
}

//获取某条消息的已读用户 ID 列表
const getReadedUsers = async (groupId: number, messageId: number): Promise<number[]> => {
  const res = await http({
    url: '/message/group/findReadedUsers',
    method: 'get',
    params: { groupId, messageId },
  })
  return res.data.data
}

//查询聊天记录
const getGroupHistoryMessages = async (groupId: number, page: number, size: number) => {
  const res = await http({
    url: '/message/group/history',
    method: 'get',
    params: { groupId, page, size },
  })
  return res.data.data
}

export {
  sendGroupMessage,
  recallGroupMessage,
  pullOfflineGroupMessage,
  readGroupMessage,
  getReadedUsers,
  getGroupHistoryMessages,
}
