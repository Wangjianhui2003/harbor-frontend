import http from '@/api/http/http'

export interface AddFriendReq {
  requestUserId: number
  receiveUserId: number
  requestNote: string
}

/**
 * 查询添加好友请求
 */
export interface AddUserRequestRecord {
  id: number
  requestUserId: number
  receiveUserId: number
  status: number
  requestNote: string
  dealTime: string | null // datetime
  comment: string | null
  createdTime: string //
  updateTime: string | null
}

export interface DealAddFriendReq {
  id: number
  requestUserId: number
  receiveUserId: number
  status: number //1: 同意 2: 拒绝
  comment: string
}

/**
 * 加群请求
 */
export interface AddGroupReq {
  groupId: number
  requestUserId: number
  requestNote: string
}

/**
 * 对应第二张图的接口结构
 */
export interface AddGroupRequestRecord {
  id: number
  groupId: number
  requestUserId: number
  status: number
  requestNote: string
  dealUserId: number | null
  comment: string | null
  dealTime: string | null // datetime
  createdTime: string //
  updateTime: string
}

export interface DealAddGroupReq {
  id: number
  groupId: number
  requestUserId: number
  dealUserId: number
  status: number
  comment: string
}

/**
 * 发送添加好友请求
 */
export const addFriendRequest = async (data: AddFriendReq): Promise<void> => {
  await http({
    url: '/add/friend',
    method: 'post',
    data,
  })
  return undefined
}

/**
 * 处理添加好友请求
 */
export const dealAddFriendRequest = async (data: DealAddFriendReq): Promise<void> => {
  await http({
    url: '/add/friend/deal',
    method: 'post',
    data,
  })
  return undefined
}

/**
 * 发送添加群组请求
 */
export const addGroupRequest = async (data: AddGroupReq): Promise<void> => {
  await http({
    url: '/add/group',
    method: 'post',
    data,
  })
  return undefined
}

/**
 * 处理添加群组请求
 */
export const dealAddGroupRequest = async (data: DealAddGroupReq): Promise<void> => {
  await http({
    url: '/add/group/deal',
    method: 'post',
    data,
  })
  return undefined
}

/**
 * 查询我发送的好友请求列表
 */
export const getSentFriendRequests = async (): Promise<AddUserRequestRecord[]> => {
  const res = await http({
    url: '/add/friend/sent',
    method: 'get',
  })
  return res.data.data
}

/**
 * 查询我接收的好友请求列表
 */
export const getReceivedFriendRequests = async (): Promise<AddUserRequestRecord[]> => {
  const res = await http({
    url: '/add/friend/received',
    method: 'get',
  })
  return res.data.data
}

/**
 * 查询我发送的群组请求列表
 */
export const getSentGroupRequests = async (): Promise<AddGroupRequestRecord[]> => {
  const res = await http({
    url: '/add/group/sent',
    method: 'get',
  })
  return res.data.data
}

/**
 * 查询指定群组的请求列表
 */
export const getGroupRequests = async (groupId: number): Promise<AddGroupRequestRecord[]> => {
  const res = await http({
    url: `/add/group/${groupId}`,
    method: 'get',
  })
  return res.data.data
}

/**
 * 根据群组ID列表查询请求
 */
export const findRequestsByGroupIds = async (
  groupIds: number[],
): Promise<AddGroupRequestRecord[]> => {
  const res = await http({
    url: '/add/group/list',
    method: 'post',
    data: groupIds,
  })
  return res.data.data
}
