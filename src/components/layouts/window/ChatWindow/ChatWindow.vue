<template>
  <Card class="rounded-xs h-full p-0">
    <div class="h-full flex flex-col">
      <div class="border-b p-1 flex items-center justify-center">
        {{ chatStore.activeChat?.showName }}
      </div>
      <div class="overflow-auto">
        <component
          v-for="(message, index) in chatStore.activeChat?.messages"
          :is="messageComponentMap[message.type] || BaseMessage"
          :message="message"
          :key="index"
        ></component>
      </div>
    </div>
  </Card>

  <Separator />
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import BaseMessage from './MessageItem/BaseMessage.vue'
import { MESSAGE_TYPE } from '@/utils/enums'

// 各类型的气泡组件
import TextMessage from './MessageItem/TextMessage.vue'
import ImageMessage from './MessageItem/ImageMessage.vue'
import FileMessage from './MessageItem/FileMessage.vue'
import VideoMessage from './MessageItem/VideoMessage.vue'
import type { Component } from 'vue'
import AudioMessage from './MessageItem/AudioMessage.vue'
import TipTimeMessage from './MessageItem/TipTimeMessage.vue'

const chatStore = useChatStore()

const messageComponentMap: Record<number, Component> = {
  [MESSAGE_TYPE.TEXT]: TextMessage,
  [MESSAGE_TYPE.IMAGE]: ImageMessage,
  [MESSAGE_TYPE.FILE]: FileMessage,
  [MESSAGE_TYPE.VIDEO]: VideoMessage,
  [MESSAGE_TYPE.AUDIO]: AudioMessage,
  [MESSAGE_TYPE.TIP_TIME]: TipTimeMessage,
}
</script>

<style scoped></style>
