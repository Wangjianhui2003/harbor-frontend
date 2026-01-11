<template>
  <Card class="rounded-xs h-full p-0">
    <div class="h-full flex flex-col items-center">
      <div class="border-b p-1 w-full flex items-center justify-center">
        {{ chatStore.activeChat?.showName }}
      </div>
      <ScrollArea ref="scrollAreaRef" class="flex-1 w-full overflow-auto pb-30">
        <component
          v-for="(message, index) in chatStore.activeChat?.messages"
          :is="messageComponentMap[message.type] || BaseMessage"
          :message="message"
          :key="index"
          class="py-3"
        >
        </component>
      </ScrollArea>
      <ChatInput />
    </div>
  </Card>
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import BaseMessage from './MessageItem/BaseMessage.vue'
import { MESSAGE_TYPE } from '@/utils/enums'
import ChatInput from './ChatInput/ChatInput.vue'

// 各类型的气泡组件
import type { Component } from 'vue'

import TipTimeMessage from './MessageItem/TipTimeMessage.vue'
import { ref, nextTick, onMounted, watch } from 'vue'

const chatStore = useChatStore()
const scrollAreaRef = ref<InstanceType<
  typeof import('@/components/ui/scroll-area/ScrollArea.vue').default
> | null>(null)

const messageComponentMap: Record<number, Component> = {
  [MESSAGE_TYPE.TIP_TIME]: TipTimeMessage,
}

/** 滚动到底部 */
function scrollToBottom() {
  nextTick(() => {
    const viewport = scrollAreaRef.value?.$el?.querySelector('[data-slot="scroll-area-viewport"]')
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  })
}

// 监听消息变化
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
