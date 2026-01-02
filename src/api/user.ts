import type { CaptchaResp, HttpResponse, OnlineTerminal, User } from '@/types/index'
import type { RegisterReq } from '@/types/register'
import type { LoginData, LoginResp } from '@/types/login.ts'
import http from './http/http.ts'

const login = async (loginData: LoginData): Promise<LoginResp> => {
  const res = await http({
    url: '/login',
    method: 'post',
    data: loginData,
  })
  return res.data.data
}

const register = async (registerData: RegisterReq): Promise<HttpResponse<void>> => {
  const res = await http({
    url: '/register',
    method: 'post',
    data: registerData,
  })
  return res.data as HttpResponse<void>
}

const getCaptcha = async (): Promise<CaptchaResp> => {
  const res = await http({
    url: '/captcha',
    method: 'get',
  })
  return res.data.data
}

//通过用户名或昵称查找用户
const findUserByName = async (name: string): Promise<User[]> => {
  const res = await http({
    url: '/user/findByName',
    method: 'get',
    params: { name },
  })
  return res.data.data
}

//获取自己的userInfo
const getSelfInfo = async (): Promise<User> => {
  const res = await http({
    url: '/user/self',
    method: 'get',
  })
  return res.data.data
}

const getUserOnlineStatus = async (userIds: number[]): Promise<OnlineTerminal[]> => {
  const res = await http({
    url: '/user/terminal/online',
    method: 'get',
    params: { userIds: userIds.join(',') },
  })
  return res.data.data
}

//查看某人的userInfo
const getUserInfo = async (id: number): Promise<User> => {
  const res = await http({
    url: `/user/find/${id}`,
    method: 'get',
  })
  return res.data.data
}

const updateUserInfo = async (userInfo: User) => {
  await http({
    url: '/user/update',
    method: 'put',
    data: userInfo,
  })
  return undefined
}

export {
  login,
  register,
  getCaptcha,
  findUserByName,
  getSelfInfo,
  getUserOnlineStatus,
  getUserInfo,
  updateUserInfo,
}
