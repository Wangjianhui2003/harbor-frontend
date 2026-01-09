<template>
  <Card class="rounded-xs h-full p-0">
    <div class="h-full flex flex-col items-center">
      <div class="border-b p-1 w-full flex items-center justify-center">
        {{ chatStore.activeChat?.showName }}
      </div>
      <div class="flex-1 w-full overflow-auto pb-30">
        <component
          v-for="(message, index) in chatStore.activeChat?.messages"
          :is="messageComponentMap[message.type] || BaseMessage"
          :message="message"
          :key="index"
          class="py-3"
        >
        </component>
      </div>
      <ChatInput />
    </div>
  </Card>
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import BaseMessage from './MessageItem/BaseMessage.vue'
import { MESSAGE_TYPE } from '@/utils/enums'
import ChatInput from './ChatInput.vue'

// 各类型的气泡组件
import type { Component } from 'vue'

import TipTimeMessage from './MessageItem/TipTimeMessage.vue'
import { scrollToBottom } from '@/utils/dom'
import { onMounted, watch } from 'vue'

const chatStore = useChatStore()

const messageComponentMap: Record<number, Component> = {
  [MESSAGE_TYPE.TIP_TIME]: TipTimeMessage,
}

watch(
  () => chatStore.activeChat,
  () => {
    scrollToBottom()
  },
)

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped></style>
