import http from '@/api/http/http'
import type { Friend } from '../types'

/**
 * 添加好友
 */
export const addFriend = async (friendId: number): Promise<void> => {
  await http({
    url: '/friend/add',
    method: 'post',
    params: { friendId },
  })
  return undefined
}

/**
 * 查找所有好友
 */
export const getFriendList = async (): Promise<Friend[]> => {
  const res = await http({
    url: '/friend/list',
    method: 'get',
  })
  return res.data.data
}

/**
 * 移除好友
 */
export const removeFriend = async (friendId: number): Promise<void> => {
  await http({
    url: `/friend/delete/${friendId}`,
    method: 'delete',
  })
  return undefined
}

/**
 * 查找单个好友的信息
 */
export const findFriend = async (friendId: number): Promise<Friend> => {
  const res = await http({
    url: `/friend/find/${friendId}`,
    method: 'get',
  })
  return res.data.data
}

export const updateFriendNickName = async (friend: Friend) => {
  http({
    url: `/friend/editFriendNickName/`,
    method: 'post',
    data: friend
  })
}
