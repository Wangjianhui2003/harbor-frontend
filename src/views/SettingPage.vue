<template>
  <div class="flex h-full w-full">
    <!-- Settings Sidebar -->
    <aside class="basis-4/24 shrink-0 border-r border-sidebar-border bg-sidebar">
      <div class="flex h-full flex-col">
        <nav class="flex-1 overflow-y-auto p-2">
          <div>
            <ul class="space-y-1">
              <li v-for="item in navItems" :key="item.key">
                <button
                  :class="[
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    activeTab === item.key
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  ]"
                  @click="activeTab = item.key"
                >
                  <component :is="item.icon" class="h-4 w-4" />
                  {{ item.label }}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-background">
      <ProfilePage v-if="activeTab === 'profile'" />
      <AboutPage v-else-if="activeTab === 'about'" />
      <StorageManagePage v-else-if="activeTab === 'storage'" />

      <!-- <div v-else-if="activeTab === 'account'" class="max-w-2xl">...</div>
      <div v-else-if="activeTab === 'notification'" class="max-w-2xl">...</div>
      <div v-else-if="activeTab === 'privacy'" class="max-w-2xl">...</div>
      <div v-else-if="activeTab === 'appearance'" class="max-w-2xl">...</div> -->
    </main>
  </div>
</template>

<script setup lang="ts">
import ProfilePage from '@/components/layouts/Window/SettingWindow/ProfilePage.vue'
import AboutPage from '@/components/layouts/Window/SettingWindow/AboutPage.vue'
import StorageManagePage from '@/components/layouts/Window/SettingWindow/StorageManagePage.vue'
import { ref } from 'vue'
import {
  User as UserIcon,
  // Shield as ShieldIcon,
  // Bell as BellIcon,
  // Lock as LockIcon,
  // Palette as PaletteIcon,
  HardDrive as HardDriveIcon,
  Info as InfoIcon,
} from 'lucide-vue-next'

const activeTab = ref('profile')

const navItems = [
  { key: 'profile', label: '个人', icon: UserIcon },
  // { key: 'account', label: '账号', icon: ShieldIcon },
  // { key: 'notification', label: '通知', icon: BellIcon },
  // { key: 'privacy', label: '隐私', icon: LockIcon },
  // { key: 'appearance', label: '外观', icon: PaletteIcon },
  { key: 'storage', label: '存储', icon: HardDriveIcon },
  { key: 'about', label: '关于', icon: InfoIcon },
]
</script>

<style scoped></style>
