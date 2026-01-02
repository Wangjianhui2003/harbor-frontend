<template>
  <div
    class="text-primary-400 dark:text-primary-500 h-screen bg-primary-200 flex flex-col justify-start items-center dark:bg-primary-900"
  >
    <component
      v-for="item in navItems"
      :key="item.label"
      :is="item.icon"
      :class="[baseIconClass, isActive(item.to) && 'text-primary-900 dark:text-primary-100']"
      :aria-label="item.label"
      @click="navigate(item.to)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fa6Message as Chat } from 'vue-icons-plus/fa6'
import { FaUserFriends as Friend } from 'vue-icons-plus/fa'
import { Fa6Users as Group } from 'vue-icons-plus/fa6'
import { Fa6Gear as Setting } from 'vue-icons-plus/fa6'
import { Fa6Robot as ChatBot } from 'vue-icons-plus/fa6'

type NavItem = {
  label: string
  icon: Component
  to: string
}

const router = useRouter()
const route = useRoute()

const baseIconClass =
  'mt-4 cursor-pointer hover:text-primary-900 dark:hover:text-primary-100 transition-colors duration-200'

const navItems: NavItem[] = [
  { label: 'Chat', icon: Chat, to: 'Chat' },
  { label: 'Friend', icon: Friend, to: 'Friend' },
  { label: 'Group', icon: Group, to: 'Group' },
  { label: 'Setting', icon: Setting, to: 'Setting' },
  { label: 'ChatBot', icon: ChatBot, to: 'ChatBot' },
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
