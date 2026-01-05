<template>
  <div class="flex h-screen flex-row">
    <div class="basis-5/5 flex h-full flex-col items-center justify-center">
      <Card class="w-[360px]">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>欢迎使用Harbor</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            :initial-values="initialValues"
            :validation-schema="formSchema"
            :validate-on-blur="false"
            :validate-on-change="false"
            :validate-on-input="false"
            :validate-on-model-update="false"
            class="flex flex-col gap-4"
            @submit="onFormSubmit"
            @invalid-submit="onInvalidSubmit"
            v-slot="{ resetForm }"
          >
            <FormField name="username" v-slot="{ componentField }">
              <FormItem>
                <div class="flex items-center">
                  <FormLabel class="mr-3">用户名</FormLabel>
                  <FormMessage class="text-[10px] leading-tight" />
                </div>
                <FormControl>
                  <Input
                    autocomplete="username"
                    placeholder="请输入用户名"
                    v-bind="componentField"
                  />
                </FormControl>
              </FormItem>
            </FormField>

            <FormField name="password" v-slot="{ componentField }">
              <FormItem>
                <div class="flex items-center">
                  <FormLabel class="mr-3">密码</FormLabel>
                  <FormMessage class="text-[10px] leading-tight" />
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autocomplete="current-password"
                    placeholder="请输入密码"
                    v-bind="componentField"
                  />
                </FormControl>
              </FormItem>
            </FormField>

            <FormField name="captcha" v-slot="{ componentField }">
              <FormItem>
                <div class="flex items-center">
                  <FormLabel class="mr-3">验证码</FormLabel>
                  <FormMessage class="text-[10px] leading-tight" />
                </div>
                <FormControl>
                  <div class="flex items-center gap-3">
                    <Input
                      autocomplete="one-time-code"
                      placeholder="请输入验证码"
                      v-bind="componentField"
                      class="flex-1"
                    />
                    <img
                      :src="captchaPic"
                      alt="验证码"
                      class="h-10 min-w-24 cursor-pointer rounded-md border"
                      @click="loadCaptcha"
                    />
                  </div>
                </FormControl>
              </FormItem>
            </FormField>
            <div class="flex flex-row justify-between w-full gap-2">
              <Button type="submit" class="flex-1">登录</Button>
              <Button type="button" class="flex-1" variant="outline" @click="onReset(resetForm)">
                重置
              </Button>
            </div>
          </Form>
        </CardContent>
        <CardFooter class="flex items-center">
          <span>没有账号?</span>
          <a href="/register" class="ml-2 hover:underline">注册</a>
          <Button variant="link"> </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { login } from '@/api/user'
import { useCaptcha } from '@/composable/useCaptcha'
import type { LoginData } from '@/types/login'
import { setCookie } from '@/utils/cookie-utils'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/utils/constant'
import { TERMINAL_TYPE } from '@/utils/enums'
import { showError, showInfo, showSuccess } from '@/utils/message'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import { useToast } from 'primevue/usetoast'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'

const router = useRouter()
const toast = useToast()
const { captchaPic, captchaKey, loadCaptcha } = useCaptcha()

const loginFormSchema = z.object({
  username: z.string().min(1, '输入用户名'),
  password: z.string().min(7, '密码至少 7 位'),
  captcha: z.string().min(1, '输入验证码'),
})

const formSchema = toTypedSchema(loginFormSchema)

type LoginFormValues = z.infer<typeof loginFormSchema>

const initialValues: LoginFormValues = {
  username: '',
  password: '',
  captcha: '',
}

const onInvalidSubmit = () => {
  showError(toast, '错误', '验证失败')
  loadCaptcha()
}

const onReset = (resetForm: (state?: { values?: Partial<LoginFormValues> }) => void) => {
  resetForm({ values: initialValues })
  captchaKey.value = ''
  loadCaptcha()
}

const onFormSubmit = async (values: GenericObject) => {
  const formValues = values as LoginFormValues
  const loginReqData: LoginData = {
    terminal: TERMINAL_TYPE.WEB,
    username: formValues.username,
    password: formValues.password,
    captcha: formValues.captcha,
    captchaKey: captchaKey.value,
  }
  showInfo(toast, '提示', '正在登录...')
  const loginRespData = await login(loginReqData)
  setCookie('username', formValues.username)
  setCookie('password', formValues.password)
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
