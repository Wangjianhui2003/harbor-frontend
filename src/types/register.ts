//注册表单
export interface RegisterForm {
  email?: string
  username: string
  password: string
  confirmPassword: string
  nickname: string
  captcha: string
}

// 注册请求
export interface RegisterReq {
  email?: string
  username: string
  password: string
  nickname: string
  captcha: string
  captchaKey: string
}
