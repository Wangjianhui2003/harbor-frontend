<template>
  <div ref="messageRef" :class="['flex w-full', props.message.selfSend && 'flex-row-reverse']">
    <BaseAvatar :headImage="headImage" :name="name" class="px-3" />
    <div class="max-w-1/2">
      <component :is="messageMap[props.message.type] || TextMessage" :message="props.message" />
    </div>
    <MessageStatusIcon
      class="self-end mx-4"
      :size="18"
      :status="props.message.status"
      @resend="handleResend"
    />
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import type { BaseMessage, ChatInfo, GroupMessage } from '@/types/chat'
import { CHATINFO_TYPE, MESSAGE_STATUS, MESSAGE_TYPE } from '@/utils/enums'
import { computed, ref, onMounted, onUnmounted, type Component } from 'vue'
import TextMessage from './TextMessage.vue'
import ImageMessage from './ImageMessage.vue'
import MessageStatusIcon from './MessageStatusIcon.vue'
import { useSendMessage } from '@/composable/useSendMessage'
import useChatStore from '@/stores/chatStore'
import { useMessageRead } from '@/composable/useMessageRead'
import useUserStore from '@/stores/userStore'
import type { User, GroupMember } from '@/types'
import useFriendStore from '@/stores/friendStore'
import FileMessage from './FileMessage.vue'
import VoiceMessage from './VoiceMessage.vue'
import VideoMessage from './VideoMessage.vue'

const props = defineProps<{
  message: BaseMessage
  groupMembers?: GroupMember[]
}>()

const messageRef = ref<HTMLElement | null>(null)
const chatStore = useChatStore()
const { resendMessage } = useSendMessage()
const userStore = useUserStore()
const friendStore = useFriendStore()

//TODO:群聊已读人数
// const readCount = computed(() => {
//   if (chatStore.activeChat?.type === CHATINFO_TYPE.GROUP) {
//     return (props.message as GroupMessage).readCount
//   }
//   return undefined
// })

// 从 groupMembers 中查找对应成员
const groupMember = computed(() => {
  if (!props.groupMembers || props.message.selfSend) return null
  return props.groupMembers.find((m) => m.userId === props.message.sendId)
})

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
  // 群聊其他成员：从 groupMembers 中获取
  return groupMember.value?.headImage || ''
})

//名称（fallback）
const name = computed(() => {
  if (props.message.selfSend) {
    return (userStore.userInfo as User).nickname
  }
  if (chatStore.activeChat?.type === CHATINFO_TYPE.PRIVATE) {
    return chatStore.activeChat.showName
  }
  // 群聊优先级：群内备注 > 好友备注 > 好友昵称 > 用户原昵称 > 发送者昵称
  const member = groupMember.value
  // 1. 群内设置的备注昵称优先
  if (member?.remarkNickname) {
    return member.remarkNickname
  }
  // 2. 好友备注 > 好友昵称
  const senderId = props.message.sendId
  const friend = friendStore.findFriend(senderId)
  if (friend) {
    return friend.remark || friend.friendNickname
  }
  // 3. 用户原昵称或发送者昵称
  return member?.userNickname || (props.message as GroupMessage).sendNickname
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
})

//清理定时器
onUnmounted(() => {
  if (resendTimer) {
    clearTimeout(resendTimer)
  }
})
</script>

<style scoped></style>
