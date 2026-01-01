// 登录请求后端数据类型
export interface LoginData {
  username: string
  password: string
  captcha: string
  captchaId: string
}

// 后端响应数据类型
export interface LoginResp {
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
}
