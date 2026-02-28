import http from '@/api/http/http'
import type { Group, GroupMember } from '../types'

//群聊信息
export interface GroupResult {
  id: string
  name: string
  ownerId: string
  headImage: string
  headImageThumb: string
  notice: string
  isBanned: boolean
  reason: string
  dissolve: number
  joinType: number | null
  updateTime: string | null
  createdTime: string
}

export interface CreateGroupData {
  name: string
  notice?: string
  joinType?: number
  friendIds?: string[]
}

export interface ModifyGroupData {
  id: string
  name?: string
  headImage?: string
  headImageThumb?: string
  notice?: string
  remarkNickname?: string
  remarkGroupName?: string
  joinType?: number
}

interface InviteData {
  groupId: string
  friendIds: string[]
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
export const modifyGroup = async (data: ModifyGroupData): Promise<Group> => {
  const res = await http({
    url: '/group/modify',
    method: 'PUT',
    data,
  })
  return res.data.data
}

// 解散群聊
export const deleteGroup = async (groupId: string): Promise<void> => {
  await http({
    url: `/group/delete/${groupId}`,
    method: 'DELETE',
  })
  return undefined
}

// 查询单个所在群聊信息
export const findGroup = async (groupId: string): Promise<Group> => {
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
export const findGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  const res = await http({
    url: `/group/members/${groupId}`,
    method: 'GET',
  })
  return res.data.data
}

// 退出群聊
export const quitGroup = async (groupId: string): Promise<void> => {
  await http({
    url: `/group/quit/${groupId}`,
    method: 'DELETE',
  })
  return undefined
}

// 踢出群聊
export const kickGroup = async (groupId: string, userId: string): Promise<void> => {
  await http({
    url: `/group/kick/${groupId}`,
    method: 'DELETE',
    params: { userId },
  })
  return undefined
}

export const searchGroup = async (groupId: string): Promise<GroupResult> => {
  const res = await http({
    url: '/group/search',
    method: 'GET',
    params: { groupId },
  })
  return res.data.data
}


/**
 * 获取当前用户管理的群组ID列表（群主或管理员）
 */
export const getManagedGroupIds = async (): Promise<string[]> => {
  const res = await http({
    url: '/group/managed',
    method: 'GET',
  })
  return (res.data.data || []).map((id: string | number) => String(id))
}

/**
 * 设置或移除群管理员
 */
export const setGroupAdmin = async (
  groupId: string,
  userId: string,
  isAdmin: boolean,
): Promise<void> => {
  await http({
    url: `/group/admin/${groupId}`,
    method: 'PUT',
    params: { userId, isAdmin },
  })
}
