import axios, { type AxiosResponse } from 'axios'
import type { HttpResponse } from '../../types/index.ts'
import type { LoginResp as Token } from '@/types/login.ts'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
        return Promise.reject(error)
      }
    } else {
      return Promise.reject(resp)
    }
  },
  (error) => {
    if (!error.response) {
      return Promise.reject(error)
    }
    switch (error.response.status) {
      case 400:
        return Promise.reject(error)
      case 401:
        location.href = '/'
        return Promise.reject(error)
      case 405:
        return Promise.reject(error)
      case 404:
        return Promise.reject(error)
      case 500:
        return Promise.reject(error)
      case 501:
        return Promise.reject(error)
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
