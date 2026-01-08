<template>
  <div class="flex h-full w-full">
    <!-- Settings Sidebar -->
    <aside class="basis-4/24 shrink-0 border-r border-sidebar-border bg-sidebar">
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex h-14 items-center border-b border-sidebar-border px-4">
          <h2 class="text-lg font-semibold text-sidebar-foreground">设置</h2>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto p-2">
          <!-- 账号设置 -->
          <div class="mb-4">
            <div class="mb-2 px-2 text-xs font-medium text-muted-foreground">账号设置</div>
            <ul class="space-y-1">
              <li>
                <button
                  :class="[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    activeTab === 'profile'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ]"
                  @click="activeTab = 'profile'"
                >
                  <UserIcon class="h-4 w-4" />
                  个人资料
                </button>
              </li>
              <li>
                <button
                  :class="[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    activeTab === 'account'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ]"
                  @click="activeTab = 'account'"
                >
                  <ShieldIcon class="h-4 w-4" />
                  账号安全
                </button>
              </li>
            </ul>
          </div>

          <!-- 偏好设置 -->
          <div class="mb-4">
            <div class="mb-2 px-2 text-xs font-medium text-muted-foreground">偏好设置</div>
            <ul class="space-y-1">
              <li>
                <button
                  :class="[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    activeTab === 'notification'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ]"
                  @click="activeTab = 'notification'"
                >
                  <BellIcon class="h-4 w-4" />
                  通知设置
                </button>
              </li>
              <li>
                <button
                  :class="[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    activeTab === 'privacy'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ]"
                  @click="activeTab = 'privacy'"
                >
                  <LockIcon class="h-4 w-4" />
                  隐私设置
                </button>
              </li>
              <li>
                <button
                  :class="[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    activeTab === 'appearance'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ]"
                  @click="activeTab = 'appearance'"
                >
                  <PaletteIcon class="h-4 w-4" />
                  外观主题
                </button>
              </li>
            </ul>
          </div>

          <!-- 更多 -->
          <div class="mb-4">
            <div class="mb-2 px-2 text-xs font-medium text-muted-foreground">更多</div>
            <ul class="space-y-1">
              <li>
                <button
                  :class="[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    activeTab === 'storage'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ]"
                  @click="activeTab = 'storage'"
                >
                  <HardDriveIcon class="h-4 w-4" />
                  存储空间
                </button>
              </li>
              <li>
                <button
                  :class="[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    activeTab === 'about'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ]"
                  @click="activeTab = 'about'"
                >
                  <InfoIcon class="h-4 w-4" />
                  关于
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-background p-6">
      <div v-if="activeTab === 'profile'" class="max-w-2xl">
        <h3 class="text-xl font-semibold text-foreground mb-4">个人资料</h3>
        <p class="text-muted-foreground">管理您的个人信息和头像</p>
      </div>
      <div v-else-if="activeTab === 'account'" class="max-w-2xl">
        <h3 class="text-xl font-semibold text-foreground mb-4">账号安全</h3>
        <p class="text-muted-foreground">管理密码、两步验证等安全设置</p>
      </div>
      <div v-else-if="activeTab === 'notification'" class="max-w-2xl">
        <h3 class="text-xl font-semibold text-foreground mb-4">通知设置</h3>
        <p class="text-muted-foreground">配置消息通知和提醒方式</p>
      </div>
      <div v-else-if="activeTab === 'privacy'" class="max-w-2xl">
        <h3 class="text-xl font-semibold text-foreground mb-4">隐私设置</h3>
        <p class="text-muted-foreground">管理您的隐私和数据权限</p>
      </div>
      <div v-else-if="activeTab === 'appearance'" class="max-w-2xl">
        <h3 class="text-xl font-semibold text-foreground mb-4">外观主题</h3>
        <p class="text-muted-foreground">自定义应用的外观和主题</p>
      </div>
      <div v-else-if="activeTab === 'storage'" class="max-w-2xl">
        <h3 class="text-xl font-semibold text-foreground mb-4">存储空间</h3>
        <p class="text-muted-foreground">查看和管理存储使用情况</p>
      </div>
      <div v-else-if="activeTab === 'about'" class="max-w-2xl">
        <h3 class="text-xl font-semibold text-foreground mb-4">关于</h3>
        <p class="text-muted-foreground">应用版本和相关信息</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  User as UserIcon,
  Shield as ShieldIcon,
  Bell as BellIcon,
  Lock as LockIcon,
  Palette as PaletteIcon,
  HardDrive as HardDriveIcon,
  Info as InfoIcon,
} from 'lucide-vue-next'

const activeTab = ref('profile')
</script>

<style scoped></style>
