import axios, { type AxiosResponse } from 'axios'
import type { HttpResponse, LoginResp as Token } from '../../types/index.ts'
import { showError } from '@/utils/message.ts'

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 1000 * 10,
})

http.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.accessToken = encodeURIComponent(accessToken)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

http.interceptors.response.use(
  async (response) => {
    const resp: HttpResponse = response.data
    if (resp.code == 200) {
      return response
    } else if (resp.code == 400) {
      location.href = '/login'
      return Promise.reject(response)
    } else if (resp.code == 401) {
      //鉴权失败
      console.log('token失效,尝试重新获取')
      const refreshToken: string | null = sessionStorage.getItem('refreshToken')
      if (!refreshToken) {
        location.href = '/login'
        return Promise.reject(response)
      }
      try {
        // 发送请求, 进行刷新token操作, 获取新的token
        const token: Token = await refresh(refreshToken)
        // 保存token
        sessionStorage.setItem('accessToken', token.accessToken)
        sessionStorage.setItem('refreshToken', token.refreshToken)
        //重试
        return http(response.config)
      } catch (error) {
        location.href = '/login'
        showError('错误', '请重新登录')
        return Promise.reject(error)
      }
    } else {
      //其他错误,打印msg
      showError('错误', resp.message)
      return Promise.reject(resp)
    }
  },
  (error) => {
    if (!error.response) {
      showError('网络异常', '请检查您的网络连接')
      return Promise.reject(error)
    }
    switch (error.response.status) {
      case 400:
        showError('请求错误', error.response.data)
        break
      case 401:
        location.href = '/'
        break
      case 405:
        showError('请求方式错误', 'http请求方式有误')
        break
      case 404:
        showError('请求失败', '请求的资源不存在')
        break
      case 500:
        showError('服务器错误', '服务器出了点小差，请稍后再试')
        break
      case 501:
        showError('服务未实现', '服务器不支持当前请求所需要的功能')
        break
    }

    return Promise.reject(error)
  },
)

const refresh = async (refreshToken: string): Promise<Token> => {
  try {
    const response: AxiosResponse<HttpResponse> = await http({
      method: 'put',
      url: '/refreshToken',
      headers: {
        refreshToken: refreshToken,
      },
    })
    return response.data.data as Token
  } catch (error) {
    throw new Error('无法刷新token')
  }
}

export default http
