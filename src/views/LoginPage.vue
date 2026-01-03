<template>
  <div class="flex flex-row h-screen">
    <div class="basis-1/5 bg-primary-400 dark:bg-primary-900 h-full"></div>
    <div class="basis-4/5 bg-primary-100 dark:bg-primary-800 h-full flex flex-col justify-center">
      <Form :resolver="resolver" @submit="onFormSubmit">
        <FloatLabel variant="on">
          <InputText id="username" name="username" v-model="loginFormData.username" />
          <label for="username">用户名</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <Password
            id="password"
            name="password"
            v-model="loginFormData.password"
            promptLabel="请输入密码"
            :feedback="false"
          />
          <label for="password">密码</label>
        </FloatLabel>
        <div class="flex gap-2">
          <FloatLabel variant="on">
            <InputText id="captcha" name="captcha" v-model="loginFormData.captcha" />
            <label for="captcha">验证码</label>
          </FloatLabel>
          <img :src="captchaPic" alt="验证码" class="h-10 cursor-pointer" @click="loadCaptcha" />
        </div>
        <div class="flex gap-2">
          <Button type="submit">登录</Button>
          <Button type="button" @click="clear">重置</Button>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCaptcha } from '@/composable/useCaptcha'
import type { LoginData } from '@/types/login'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { login } from '@/api/user'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { showError, showInfo, showSuccess } from '@/utils/message'
import { TERMINAL_TYPE } from '@/utils/enums'
import { setCookie } from '@/utils/cookie-utils'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/utils/constant'

const router = useRouter()
const toast = useToast()
const { captchaPic, captchaKey, loadCaptcha } = useCaptcha()

const loginFormData = ref({
  username: '',
  password: '',
  captcha: '',
})

const resolver = async ({ values }: { values: Record<string, unknown> }) => {
  const errors: Record<string, Array<{ message: string }>> = {}
  if (!values.username) {
    errors.username = [{ message: '输入用户名' }]
  }
  if (!values.password) {
    errors.password = [{ message: '输入密码' }]
  }
  if (!values.captcha) {
    errors.captcha = [{ message: '输入验证码' }]
  }
  return {
    values,
    errors,
  }
}

const clear = () => {
  loginFormData.value.username = ''
  loginFormData.value.password = ''
  loginFormData.value.captcha = ''
  captchaKey.value = ''
  loadCaptcha()
}

const onFormSubmit = async (e: FormSubmitEvent<Record<string, unknown>>) => {
  if (!e.valid) {
    showError(toast, '错误', '验证失败')
    loadCaptcha()
    return
  }

  const loginReqData: LoginData = {
    terminal: TERMINAL_TYPE.WEB,
    username: loginFormData.value.username,
    password: loginFormData.value.password,
    captcha: loginFormData.value.captcha,
    captchaKey: captchaKey.value,
  }
  showInfo(toast, '提示', '正在登录...')
  const loginRespData = await login(loginReqData)
  setCookie('username', loginFormData.value.username)
  setCookie('password', loginFormData.value.password)
  sessionStorage.setItem(ACCESS_TOKEN_KEY, loginRespData.accessToken)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, loginRespData.refreshToken)
  showSuccess(toast, '成功', '登录成功')
  router.push('/home')
}

onMounted(() => {
  loadCaptcha()
})
</script>

<style scoped></style>
