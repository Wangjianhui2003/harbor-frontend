<template>
  <div ref="messageRef" :class="['flex w-full', props.message.selfSend && 'flex-row-reverse']">
    <BaseAvatar :headImage="props.headImage" :name="props.name" class="px-3" />
    <Item
      :class="[
        'p-2 bg-primary/10 ',
        props.message.selfSend && 'bg-primary/90 text-primary-foreground',
        'max-w-1/2',
      ]"
    >
      <component :is="messageMap[props.message.type] || TextMessage" :message="props.message">
      </component>
    </Item>
    <LoaderCircle class="animate-spin" v-if="props.message.status === MESSAGE_STATUS.UNSENT" />
    <MailCheck v-else-if="props.message.status === MESSAGE_STATUS.SENT" />
    <MessageCircleReply v-else-if="props.message.status === MESSAGE_STATUS.RECALL" />
    <CircleX
      class="cursor-pointer text-destructive hover:text-destructive/80"
      v-else-if="props.message.status === MESSAGE_STATUS.ERROR"
      @click="handleResend"
      title="点击重发"
    />
    <Check v-else />
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import type { BaseMessage } from '@/types/chat'
import { MESSAGE_STATUS, MESSAGE_TYPE } from '@/utils/enums'
import { ref, type Component } from 'vue'
import TextMessage from './TextMessage.vue'
import ImageMessage from './ImageMessage.vue'
import Item from '@/components/ui/item/Item.vue'
import { LoaderCircle, MessageCircleReply, Check, MailCheck, CircleX } from 'lucide-vue-next'
import { useSendMessage } from '@/composable/useSendMessage'
import useChatStore from '@/stores/chatStore'
import { useMessageRead } from '@/composable/useMessageRead'

const props = defineProps<{
  message: BaseMessage
  headImage: string
  name: string
}>()

const messageRef = ref<HTMLElement | null>(null)
const chatStore = useChatStore()
const { resendMessage } = useSendMessage()

// 消息可见时自动标记已读
useMessageRead(props.message, messageRef)

const messageMap: Record<number, Component> = {
  [MESSAGE_TYPE.TEXT]: TextMessage,
  [MESSAGE_TYPE.IMAGE]: ImageMessage,
}

/** 处理重发 */
async function handleResend() {
  if (!chatStore.activeChat) return

  const chatInfo = {
    targetId: chatStore.activeChat.targetId,
    type: chatStore.activeChat.type,
    showName: chatStore.activeChat.showName,
    headImage: chatStore.activeChat.headImage,
  }

  await resendMessage(props.message, chatInfo)
}
</script>

<style scoped></style>
