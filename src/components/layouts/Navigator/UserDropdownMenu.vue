<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-40" align="start">
      <DropdownMenuItem @select.prevent>
        <Sun v-if="mode === 'light'" /> <Moon v-else />
        <Switch id="airplane-mode" @click="switchMode" />
      </DropdownMenuItem>
      <DropdownMenuItem @click="toSettingPage"> <Cog />设置</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="logout"> <LogOut />登出 </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LogOut, Cog, Sun, Moon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Switch } from '@/components/ui/switch'
import { useColorMode } from '@vueuse/core'

import { useAuth } from '@/composable/useAuth'

const router = useRouter()
const { logout } = useAuth()

const toSettingPage = () => {
  router.push({ name: 'Setting' })
}

const mode = useColorMode({
  // 持久化到 localStorage
  storageKey: 'harbor-color-mode',
  // 初始值为 auto，跟随系统偏好
  initialValue: 'auto',
})

const switchMode = () => {
  // 如果当前是 auto 模式，根据系统实际显示的主题来切换
  if (mode.value === 'auto') {
    mode.value =
      mode.store.value === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'light'
          : 'dark'
        : mode.store.value === 'light'
          ? 'dark'
          : 'light'
  } else {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }
}
</script>

<style scoped></style>
