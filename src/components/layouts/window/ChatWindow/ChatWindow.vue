<template>
  <Card class="rounded-xs h-full p-0">
    <div class="h-full flex flex-col items-center">
      <div class="border-b p-1 w-full flex items-center justify-between px-3">
        <div></div>
        <div>{{ chatStore.activeChat?.showName }}</div>
        <div class="flex flex-row gap-2">
          <group-member-sheet
            v-if="chatStore.activeChat?.type === CHATINFO_TYPE.GROUP"
            :groupId="chatStore.activeChat.targetId"
            :members="groupMembers"
            :loading="groupMembersLoading"
            @refresh="loadGroupMembers"
          >
            <Button variant="ghost" class="size-7 cursor-pointer">
              <UserRoundSearch class="size-5" />
            </Button>
          </group-member-sheet>
          <chat-history-sheet>
            <Button variant="ghost" class="size-7 cursor-pointer">
              <ClipboardClock class="size-5" />
            </Button>
          </chat-history-sheet>
        </div>
      </div>
      <div class="w-full overflow-auto flex flex-row">
        <ScrollArea id="chat-scroll-area" class="flex-1 w-full overflow-auto">
          <component
            v-for="(message, index) in chatStore.activeChat?.messages"
            :is="messageComponentMap[message.type] || BaseMessage"
            :message="message"
            :groupMembers="groupMembers"
            :key="index"
            class="py-3"
          >
          </component>
          <!-- 占位 -->
          <div class="h-30"></div>
        </ScrollArea>
      </div>
      <ChatInput />
    </div>
  </Card>
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import BaseMessage from './MessageItem/BaseMessage.vue'
import { CHATINFO_TYPE, MESSAGE_TYPE } from '@/utils/enums'
import ChatInput from './ChatInput/ChatInput.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { scrollToBottom } from '@/utils/dom'
import { UserRoundSearch, ClipboardClock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
// 各类型的气泡组件
import type { Component } from 'vue'
import TipTimeMessage from './MessageItem/TipTimeMessage.vue'
import { onMounted, watch, ref, computed } from 'vue'

import ChatHistorySheet from './Sheet/ChatHistorySheet.vue'
import GroupMemberSheet from './Sheet/GroupMemberSheet.vue'
import TipTextMessage from './MessageItem/TipTextMessage.vue'
import { findGroupMembers } from '@/api/group'
import type { GroupMember } from '@/types'
import { getUserInfo } from '@/api/user'

const chatStore = useChatStore()
const messageComponentMap: Record<number, Component> = {
  [MESSAGE_TYPE.TIP_TIME]: TipTimeMessage,
  [MESSAGE_TYPE.TIP_TEXT]: TipTextMessage,
}

//群聊/私聊
const mode = computed(() => {
  return chatStore.activeChat?.type
})

// 群成员数据
const groupMembers = ref<GroupMember[]>([])
const groupMembersLoading = ref(false)

// 加载群成员
const loadGroupMembers = async () => {
  if (!chatStore.activeChat) {
    return
  }
  if (mode.value !== CHATINFO_TYPE.GROUP) {
    groupMembers.value = []
    return
  }
  groupMembersLoading.value = true
  try {
    groupMembers.value = await findGroupMembers(chatStore.activeChat.targetId)
  } catch (error) {
    console.error('加载群成员失败:', error)
    groupMembers.value = []
  } finally {
    groupMembersLoading.value = false
  }
}

//更新chat用户信息
const updateUserInfo = async () => {
  if (!chatStore.activeChat) {
    return
  }
  if (mode.value !== CHATINFO_TYPE.PRIVATE) {
    return
  }
  const userInfo = await getUserInfo(chatStore.activeChat.targetId)
  chatStore.updateChatFromUser(userInfo)
}

// 监听聊天切换
watch(
  () => chatStore.activeChat,
  (newChat, oldChat) => {
    scrollToBottom()
    // 切换到群聊时加载群成员
    if (mode.value === CHATINFO_TYPE.GROUP && newChat?.targetId !== oldChat?.targetId) {
      loadGroupMembers()
    } else if (mode.value !== CHATINFO_TYPE.GROUP) {
      groupMembers.value = []
      updateUserInfo()
    }
  },
  { immediate: true },
)

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped></style>
