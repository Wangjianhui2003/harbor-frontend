import http from '@/api/http/http'
import type { Group, GroupMember } from '../types'

interface CreateGroupData {
  name: string
  memberIds: number[]
}

interface ModifyGroupData {
  id: number
  name?: string
  headImage?: string
  notice?: string
  remark?: string
}

interface InviteData {
  groupId: number
  friendIds: number[]
}

// 创建群聊
export const createGroup = async (data: CreateGroupData): Promise<Group> => {
  const res = await http({
    url: '/group/create',
    method: 'POST',
    data,
  })
  return res.data.data
}

// 修改群聊信息
export const modifyGroup = async (data: ModifyGroupData): Promise<void> => {
  await http({
    url: '/group/modify',
    method: 'PUT',
    data,
  })
  return undefined
}

// 解散群聊
export const deleteGroup = async (groupId: number): Promise<void> => {
  await http({
    url: `/group/delete/${groupId}`,
    method: 'DELETE',
  })
  return undefined
}

// 查询单个群聊
export const findGroup = async (groupId: number): Promise<Group> => {
  const res = await http({
    url: `/group/find/${groupId}`,
    method: 'GET',
  })
  return res.data.data
}

// 查询群聊列表
export const findGroups = async (): Promise<Group[]> => {
  const res = await http({
    url: '/group/list',
    method: 'GET',
  })
  return res.data.data
}

// 邀请进群
export const inviteToGroup = async (data: InviteData): Promise<void> => {
  await http({
    url: '/group/invite',
    method: 'POST',
    data,
  })
  return undefined
}

// 查询群聊成员
export const findGroupMembers = async (groupId: number): Promise<GroupMember[]> => {
  const res = await http({
    url: `/group/members/${groupId}`,
    method: 'GET',
  })
  return res.data.data
}

// 退出群聊
export const quitGroup = async (groupId: number): Promise<void> => {
  await http({
    url: `/group/quit/${groupId}`,
    method: 'DELETE',
  })
  return undefined
}

// 踢出群聊
export const kickGroup = async (groupId: number, userId: number): Promise<void> => {
  await http({
    url: `/group/kick/${groupId}`,
    method: 'DELETE',
    params: { userId },
  })
  return undefined
}
