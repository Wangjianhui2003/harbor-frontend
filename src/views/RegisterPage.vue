<template>
  <div class="flex h-screen flex-row">
    <div class="basis-5/5 flex h-full flex-col items-center justify-center">
      <Card class="w-[400px]">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>创建你的 Harbor 账户</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            :initial-values="initialValues"
            :validation-schema="formSchema"
            :validate-on-blur="true"
            class="flex flex-col gap-4"
            @submit="onFormSubmit"
            @invalid-submit="onInvalidSubmit"
            v-slot="{ resetForm }"
          >
            <FormField name="username" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input
                    autocomplete="username"
                    placeholder="请输入用户名"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="nickname" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>昵称</FormLabel>
                <FormControl>
                  <Input autocomplete="nickname" placeholder="请输入昵称" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="password" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autocomplete="new-password"
                    placeholder="请输入密码"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="confirmPassword" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autocomplete="new-password"
                    placeholder="请再次输入密码"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="captcha" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>验证码</FormLabel>
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
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="flex flex-row justify-between w-full gap-2">
              <Button class="flex-1" type="submit">注册</Button>
              <Button class="flex-1" type="button" variant="outline" @click="onReset(resetForm)">
                重置
              </Button>
            </div>
          </Form>
        </CardContent>
        <CardFooter class="flex items-center justify-between">
          <span>已有账号？</span>
          <Button variant="link">
            <a href="/login">登录</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { register } from '@/api/user'
import { useCaptcha } from '@/composable/useCaptcha'
import type { RegisterReq } from '@/types/register'
import { showError, showInfo, showSuccess } from '@/utils/message'
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
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject, SubmissionHandler } from 'vee-validate'
import { useToast } from 'primevue/usetoast'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'

const router = useRouter()
const toast = useToast()

const { captchaPic, captchaKey, loadCaptcha } = useCaptcha(toast)

const registerFormSchema = z
  .object({
    username: z.string().min(1, '输入用户名'),
    nickname: z.string().min(1, '输入昵称'),
    password: z.string().min(7, '密码至少 7 位'),
    confirmPassword: z.string().min(7, '密码至少 7 位'),
    captcha: z.string().min(1, '输入验证码'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: '两次输入的密码不一致',
  })

const formSchema = toTypedSchema(registerFormSchema)

type RegisterFormValues = z.infer<typeof registerFormSchema>

const initialValues: RegisterFormValues = {
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  captcha: '',
}

const onInvalidSubmit = () => {
  showError(toast, '错误', '表单验证失败')
  loadCaptcha()
}

const onReset = (resetForm: (state?: { values?: Partial<RegisterFormValues> }) => void) => {
  resetForm({ values: initialValues })
  captchaKey.value = ''
  loadCaptcha()
}

const onFormSubmit: SubmissionHandler<GenericObject> = async (values) => {
  const formValues = values as RegisterFormValues
  const registerReq: RegisterReq = {
    username: formValues.username,
    password: formValues.password,
    nickname: formValues.nickname,
    captcha: formValues.captcha,
    captchaKey: captchaKey.value,
  }
  showInfo(toast, '提示', '正在注册...')
  await register(registerReq)
  showSuccess(toast, '成功', '注册成功，请登录')
  router.push('/login')
}

onMounted(() => {
  loadCaptcha()
})
</script>

<style scoped></style>
