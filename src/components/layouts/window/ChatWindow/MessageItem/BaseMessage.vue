<template>
  <div ref="messageRef" :class="['flex w-full', props.message.selfSend && 'flex-row-reverse']">
    <BaseAvatar :headImage="headImage" :name="name" class="px-3" />
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
    <span v-if="readCount">{{ readCount }}</span>
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import type { BaseMessage, ChatInfo, GroupMessage } from '@/types/chat'
import { CHATINFO_TYPE, MESSAGE_STATUS, MESSAGE_TYPE } from '@/utils/enums'
import { computed, ref, onMounted, onUnmounted, type Component } from 'vue'
import TextMessage from './TextMessage.vue'
import ImageMessage from './ImageMessage.vue'
import Item from '@/components/ui/item/Item.vue'
import { LoaderCircle, MessageCircleReply, Check, MailCheck, CircleX } from 'lucide-vue-next'
import { useSendMessage } from '@/composable/useSendMessage'
import useChatStore from '@/stores/chatStore'
import { useMessageRead } from '@/composable/useMessageRead'
import useUserStore from '@/stores/userStore'
import { getUserInfo } from '@/api/user'
import type { User } from '@/types'
import FileMessage from './FileMessage.vue'
import VoiceMessage from './VoiceMessage.vue'
import VideoMessage from './VideoMessage.vue'

const props = defineProps<{
  message: BaseMessage
}>()

const messageRef = ref<HTMLElement | null>(null)
const chatStore = useChatStore()
const { resendMessage } = useSendMessage()
const userStore = useUserStore()

//TODO:群聊已读人数
const readCount = computed(() => {
  if (chatStore.activeChat?.type === CHATINFO_TYPE.GROUP) {
    return (props.message as GroupMessage).readCount
  }
  return undefined
})

//群聊其他成员头像（异步获取）
const groupMemberHeadImage = ref<string>('')

//头像 - 使用 computed 确保响应式更新
const headImage = computed(() => {
  if (props.message.selfSend) {
    // 自身发送的消息
    return userStore.userInfo.headImage || ''
  }
  if (chatStore.activeChat?.type === CHATINFO_TYPE.PRIVATE) {
    // 私聊
    return chatStore.activeChat.headImage || ''
  }
  // 群聊其他成员：使用异步获取的头像
  return groupMemberHeadImage.value
})

//名称（fallback）
const name = computed(() => {
  if (chatStore.activeChat?.type === CHATINFO_TYPE.PRIVATE) {
    if (props.message.selfSend) {
      return (userStore.userInfo as User).nickname
    }
    return chatStore.activeChat.showName
  }
  return (props.message as GroupMessage).sendNickname
})

// 消息可见时自动标记已读
useMessageRead(props.message, messageRef)

//消息类型
const messageMap: Record<number, Component> = {
  [MESSAGE_TYPE.TEXT]: TextMessage,
  [MESSAGE_TYPE.IMAGE]: ImageMessage,
  [MESSAGE_TYPE.FILE]: FileMessage,
  [MESSAGE_TYPE.AUDIO]: VoiceMessage,
  [MESSAGE_TYPE.VIDEO]: VideoMessage,
}

//处理重发
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

//重发定时器
let resendTimer: ReturnType<typeof setTimeout> | null = null

//初始化
onMounted(async () => {
  // 只有未发送的消息才设置定时器
  if (props.message.status === MESSAGE_STATUS.UNSENT) {
    resendTimer = setTimeout(() => {
      // 双重检查：定时器触发时再次确认状态
      if (props.message.status === MESSAGE_STATUS.UNSENT) {
        const chatInfo = {
          targetId: chatStore.activeChat?.targetId,
          type: chatStore.activeChat?.type,
          showName: chatStore.activeChat?.showName,
          headImage: chatStore.activeChat?.headImage,
        } as ChatInfo
        resendMessage(props.message, chatInfo)
      }
    }, 10000)
  }
  // 群聊其他成员：异步获取头像
  if (chatStore.activeChat?.type === CHATINFO_TYPE.GROUP && !props.message.selfSend) {
    try {
      const userInfo = await getUserInfo(props.message.sendId)
      groupMemberHeadImage.value = userInfo.headImage || ''
    } catch (e) {
      console.error('获取群成员头像失败', e)
    }
  }
})

//清理定时器
onUnmounted(() => {
  if (resendTimer) {
    clearTimeout(resendTimer)
  }
})
</script>

<style scoped></style>
