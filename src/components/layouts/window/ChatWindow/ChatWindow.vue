<template>
  <Card class="rounded-xs h-full p-0">
    <div class="h-full flex flex-col items-center">
      <div class="border-b p-1 w-full flex items-center justify-center">
        {{ chatStore.activeChat?.showName }}
      </div>
      <div class="flex-1 w-full overflow-auto pb-20">
        <component
          v-for="(message, index) in chatStore.activeChat?.messages"
          :is="messageComponentMap[message.type] || BaseMessage"
          :message="message"
          :key="index"
          class="py-3"
        >
        </component>
      </div>
      <Textarea placeholder="输入消息" class="w-5/7 resize-none fixed bottom-2 bg-secondary" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import BaseMessage from './MessageItem/BaseMessage.vue'
import { MESSAGE_TYPE } from '@/utils/enums'
import { Textarea } from '@/components/ui/textarea'

// 各类型的气泡组件
import type { Component } from 'vue'

import TipTimeMessage from './MessageItem/TipTimeMessage.vue'

const chatStore = useChatStore()

const messageComponentMap: Record<number, Component> = {
  [MESSAGE_TYPE.TIP_TIME]: TipTimeMessage,
}
</script>

<style scoped></style>
