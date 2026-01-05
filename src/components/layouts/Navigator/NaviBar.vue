<template>
  <Card class="h-screen flex flex-col items-center gap-3 py-3 rounded-xs">
    <Button
      v-for="item in navButtons"
      :key="item.label"
      :variant="isActive(item.to) ? 'default' : 'ghost'"
      :aria-label="item.label"
      class="h-10 w-10 p-0"
      @click="navigate(item.to)"
    >
      <component :is="item.icon" class="h-5 w-5" />
    </Button>
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

type NavItem = {
  label: string
  icon: Component
  to: string
}

const router = useRouter()
const route = useRoute()

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
