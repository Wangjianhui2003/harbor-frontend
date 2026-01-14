<template>
  <Card class="h-screen flex flex-col items-center gap-3 rounded-xs justify-between">
    <div class="flex flex-col items-center gap-3">
      <Button
        v-for="item in navButtons"
        :key="item.label"
        :variant="isActive(item.to) ? 'default' : 'ghost'"
        :aria-label="item.label"
        class="size-10 p-0"
        @click="navigate(item.to)"
      >
        <component :is="item.icon" class="size-5" />
      </Button>
    </div>
    <UserDropdownMenu>
      <BaseAvatar
        :headImage="userStore.userInfo.headImage"
        :name="userStore.userInfo.nickname"
        class="cursor-pointer"
      />
    </UserDropdownMenu>
  </Card>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessageSquareMore } from 'lucide-vue-next'
import { User } from 'lucide-vue-next'
import { Users } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import UserDropdownMenu from './UserDropdownMenu.vue'
import useUserStore from '@/stores/userStore'

type NavItem = {
  label: string
  icon: Component
  to: string
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const navButtons: NavItem[] = [
  { label: 'Chat', icon: MessageSquareMore, to: 'Chat' },
  { label: 'Friend', icon: User, to: 'Friend' },
  { label: 'Group', icon: Users, to: 'Group' },
  { label: 'ChatBot', icon: Bot, to: 'ChatBot' },
]

const isActive = (name: string) => route.name === name

const navigate = (name: string) => {
  if (!isActive(name)) {
    router.push({ name })
  }
}
</script>
<style></style>

<style scoped></style>
