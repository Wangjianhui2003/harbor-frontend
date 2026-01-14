<template>
  <div class="h-screen flex flex-col">
    <div
      v-if="hasChanges"
      class="bg-amber-500/90 text-white px-4 py-2 text-sm flex justify-end items-center gap-2"
    >
      <AlertCircle class="w-4 h-4" />
      未保存修改
    </div>
    <!-- 顶部背景横幅 -->
    <div class="w-full bg-linear-to-r from-blue-400 to-purple-500 h-30 relative">
      <div class="absolute top-10 left-10 p-1 bg-card rounded-full z-10">
        <div class="relative group cursor-pointer" @click="triggerAvatarUpload">
          <BaseAvatar :headImage="form.headImage" :name="form.nickname" :size="8" />
          <div
            class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Camera class="w-6 h-6 text-white" />
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          />
        </div>
      </div>
    </div>
    <!-- <div class="h-20"></div> -->
    <ScrollArea class="flex-1 overflow-auto">
      <!-- 表单内容 -->
      <div class="mt-15 mx-11 space-y-6">
        <!-- 昵称 -->
        <div class="space-y-2">
          <Label for="nickname" class="flex items-center gap-2">
            <UserIcon class="w-4 h-4" />
            昵称
          </Label>
          <Input id="nickname" v-model="form.nickname" placeholder="请输入昵称" class="max-w-md" />
        </div>

        <!-- 个性签名 -->
        <div class="space-y-2">
          <Label for="signature" class="flex items-center gap-2">
            <PencilLine class="w-4 h-4" />
            个性签名
          </Label>
          <Textarea
            id="signature"
            v-model="form.signature"
            placeholder="介绍一下自己吧"
            class="max-w-md resize-none"
            :rows="3"
          />
        </div>

        <!-- 性别 -->
        <div class="space-y-2">
          <Label class="flex items-center gap-2">
            <component :is="form.sex === 0 ? Mars : Venus" class="w-4 h-4" />
            性别
          </Label>
          <RadioGroup v-model="sexValue" class="flex gap-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="0" id="male" />
              <Label for="male" class="cursor-pointer">男</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="1" id="female" />
              <Label for="female" class="cursor-pointer">女</Label>
            </div>
          </RadioGroup>
        </div>

        <!-- 邮箱 -->
        <div class="space-y-2">
          <Label for="email" class="flex items-center gap-2">
            <Mail class="w-4 h-4" />
            邮箱
          </Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            class="max-w-md"
          />
        </div>

        <!-- 手机号 -->
        <div class="space-y-2">
          <Label for="phone" class="flex items-center gap-2">
            <Phone class="w-4 h-4" />
            手机号
          </Label>
          <Input
            id="phone"
            v-model="form.phoneNumber"
            placeholder="请输入手机号"
            class="max-w-md"
          />
        </div>

        <!-- 地区 -->
        <div class="space-y-2">
          <Label for="region" class="flex items-center gap-2">
            <MapPin class="w-4 h-4" />
            地区
          </Label>
          <Input id="region" v-model="form.region" placeholder="请输入地区" class="max-w-md" />
        </div>

        <!-- 添加方式 -->
        <div class="space-y-2">
          <Label class="flex items-center gap-2">
            <UserPlus class="w-4 h-4" />
            好友添加方式
          </Label>
          <RadioGroup v-model="addTypeValue" class="flex gap-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="0" id="addDirect" />
              <Label for="addDirect" class="cursor-pointer">直接添加</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="1" id="addApprove" />
              <Label for="addApprove" class="cursor-pointer">需验证通过</Label>
            </div>
          </RadioGroup>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 pt-4">
          <Button @click="handleSave" :disabled="saving">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            保存
          </Button>
          <Button variant="outline" @click="handleCancel" :disabled="saving"> 取消 </Button>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import useUserStore from '@/stores/userStore'
import { updateUserInfo } from '@/api/user'
import { showSuccess, showError } from '@/utils/message'
import { useToast } from 'primevue/usetoast'
import type { User } from '@/types'
import {
  User as UserIcon,
  PencilLine,
  Mail,
  Phone,
  MapPin,
  Mars,
  Venus,
  Camera,
  Loader2,
  AlertCircle,
  UserPlus,
} from 'lucide-vue-next'

const userStore = useUserStore()
const toast = useToast()
const saving = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

// 表单数据
const form = reactive<Partial<User>>({
  id: undefined,
  nickname: '',
  headImage: '',
  signature: '',
  sex: 0,
  email: '',
  phoneNumber: '',
  region: '',
  addType: 0,
})

// 原始数据备份（用于取消恢复）
const originalData = ref<Partial<User>>({})

// 性别值转换（RadioGroup 需要 string）
const sexValue = computed({
  get: () => String(form.sex ?? 0),
  set: (val: string) => {
    form.sex = Number(val)
  },
})

// 添加方式值转换
const addTypeValue = computed({
  get: () => String(form.addType ?? 0),
  set: (val: string) => {
    form.addType = Number(val)
  },
})

// 是否有未保存的修改
const hasChanges = computed(() => {
  return JSON.stringify(form) !== JSON.stringify(originalData.value)
})

// 加载用户信息
const loadUserInfo = () => {
  const user = userStore.userInfo
  if (user) {
    form.id = user.id
    form.nickname = user.nickname || ''
    form.headImage = user.headImage || ''
    form.signature = user.signature || ''
    form.sex = user.sex ?? 0
    form.email = user.email || ''
    form.phoneNumber = user.phoneNumber || ''
    form.region = user.region || ''
    form.addType = user.addType ?? 0

    // 备份原始数据
    originalData.value = { ...form }
  }
}

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 处理头像选择
const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    // 预览头像
    const reader = new FileReader()
    reader.onload = (e) => {
      form.headImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
    // TODO: 实际应该上传到服务器获取 URL
  }
}

// 保存
const handleSave = async () => {
  if (!form.nickname?.trim()) {
    showError(toast, '提示', '昵称不能为空')
    return
  }

  saving.value = true
  try {
    await updateUserInfo(form as User)
    // 更新本地 store
    userStore.setUserInfo({ ...userStore.userInfo, ...form } as User)
    // 更新备份
    originalData.value = { ...form }
    showSuccess(toast, '成功', '保存成功')
  } catch (error) {
    showError(toast, '错误', '保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  // 恢复原始数据
  Object.assign(form, originalData.value)
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped></style>
