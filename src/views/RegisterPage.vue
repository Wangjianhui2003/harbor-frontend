<template>
  <div class="flex flex-row h-screen">
    <div class="basis-1/5 bg-primary-400 dark:bg-primary-900 h-full">01</div>
    <div class="basis-4/5 bg-primary-100 dark:bg-primary-800 h-full flex flex-col justify-center">
      <div
        class="card flex justify-center bg-primary-200 dark:bg-primary-900 p-6 rounded-lg shadow-lg"
      >
        <Form :resolver="resolver" @submit="onFormSubmit" class="flex flex-col gap-3">
          <FloatLabel variant="on">
            <InputText id="username" name="username" v-model="formData.username" />
            <label for="username">用户名</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputText id="nickname" name="nickname" v-model="formData.nickname" />
            <label for="nickname">昵称</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <Password
              id="password"
              name="password"
              v-model="formData.password"
              promptLabel="请输入密码"
              weakLabel="简单"
              mediumLabel="中等"
              strongLabel="强"
            />
            <label for="password">密码</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <Password
              id="confirmPassword"
              name="confirmPassword"
              v-model="formData.confirmPassword"
              promptLabel="请再次输入密码"
              weakLabel="简单"
              mediumLabel="中等"
              strongLabel="强"
              :feedback="false"
            />
            <label for="confirmPassword">确认密码</label>
          </FloatLabel>
          <div class="flex gap-2">
            <FloatLabel variant="on">
              <InputText id="captcha" name="captcha" v-model="formData.captcha" />
              <label for="captcha">验证码</label>
            </FloatLabel>
            <img :src="captchaPic" alt="验证码" class="h-10 cursor-pointer" @click="loadCaptcha" />
          </div>
          <div class="flex gap-2">
            <Button type="submit">注册</Button>
            <Button type="button" @click="clear">重置</Button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { register } from '@/api/user'
import type { RegisterForm, RegisterReq } from '@/types/register'
import { showError, showInfo, showSuccess } from '@/utils/message'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useCaptcha } from '@/composable/useCaptcha'

const router = useRouter()
const toast = useToast()

const { captchaPic, captchaKey, loadCaptcha } = useCaptcha(toast)

const formData = ref<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  captcha: '',
})

const resolver = ({ values }: { values: Record<string, unknown> }) => {
  const errors: Record<string, Array<{ message: string }>> = {}
  if (!values.username) {
    errors.username = [{ message: '输入用户名' }]
  }
  if (!values.password) {
    errors.password = [{ message: '输入密码' }]
  }
  if (!values.nickname) {
    errors.nickname = [{ message: '输入昵称' }]
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = [{ message: '请确认密码' }]
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = [{ message: '两次输入的密码不一致' }]
  }
  if (!values.captcha) {
    errors.captcha = [{ message: '输入验证码' }]
  }
  return {
    values,
    errors,
  }
}

const onFormSubmit = async (e: FormSubmitEvent<Record<string, unknown>>) => {
  if (!e.valid) {
    showError(toast, '错误', '表单验证失败')
    loadCaptcha()
    return
  }

  const registerReq: RegisterReq = {
    username: formData.value.username,
    password: formData.value.password,
    nickname: formData.value.nickname,
    captcha: formData.value.captcha,
    captchaKey: captchaKey.value,
  }
  showInfo(toast, '提示', '正在注册...')
  await register(registerReq)
  showSuccess(toast, '成功', '注册成功，请登录')
  router.push('/login')
}

const clear = () => {
  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    captcha: '',
  }
}

onMounted(() => {
  loadCaptcha()
})
</script>
<style scoped></style>
