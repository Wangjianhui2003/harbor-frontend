<template>
  <div class="h-screen flex flex-col justify-start items-center">
    <component
      v-for="item in navItems"
      :key="item.label"
      :is="item.icon"
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
