<template>
  <div class="rounded-xs h-full p-0">
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
      <div ref="chatScrollContainerRef" class="w-full overflow-auto flex flex-row">
        <ScrollArea id="chat-scroll-area" class="flex-1 w-full overflow-auto">
          <component
            v-for="(message, index) in chatStore.activeChat?.messages"
            :is="messageComponentMap[message.type] || BaseMessage"
            :message="message"
            :groupMembers="groupMembers"
            :key="getMessageKey(message, index)"
            class="py-3"
          >
          </component>
          <!-- 占位 -->
          <div class="h-30"></div>
        </ScrollArea>
      </div>
      <ChatInput />
    </div>
  </div>
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import BaseMessage from './MessageItem/BaseMessage.vue'
import { CHATINFO_TYPE, MESSAGE_TYPE } from '@/utils/enums'
import ChatInput from './ChatInput/ChatInput.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserRoundSearch, ClipboardClock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
// 各类型的气泡组件
import type { Component } from 'vue'
import TipTimeMessage from './MessageItem/TipTimeMessage.vue'
import { watch, ref, computed } from 'vue'

import ChatHistorySheet from './Sheet/ChatHistorySheet.vue'
import GroupMemberSheet from './Sheet/GroupMemberSheet.vue'
import TipTextMessage from './MessageItem/TipTextMessage.vue'
import { findGroupMembers } from '@/api/group'
import type { Friend, GroupMember } from '@/types'
import { getUserInfo } from '@/api/user'
import type { ChatInfo, Chat, Message } from '@/types/chat'
import { readPrivateMessage } from '@/api/private-msg'
import { readGroupMessage } from '@/api/group-msg'
import { findFriend } from '@/api/friend'
import useFriendStore from '@/stores/friendStore'

const messageComponentMap: Record<number, Component> = {
  [MESSAGE_TYPE.TIP_TIME]: TipTimeMessage,
  [MESSAGE_TYPE.TIP_TEXT]: TipTextMessage,
}

const chatStore = useChatStore()
const friendStore = useFriendStore()

const chatKey = computed(() => {
  if (!chatStore.activeChat) {
    return ''
  }
  return `${chatStore.activeChat.type}-${chatStore.activeChat.targetId}`
})

/**
 *  group_mode
 */

// 群成员数据
const groupMembers = ref<GroupMember[]>([])
const groupMembersLoading = ref(false)
const chatScrollContainerRef = ref<HTMLElement | null>(null)
const chatSwitchToken = ref(0)

// 加载群成员
const loadGroupMembers = async (
  targetId: string | undefined = chatStore.activeChat?.targetId,
  token = chatSwitchToken.value,
) => {
  if (!targetId) {
    return
  }

  const activeChat = chatStore.activeChat
  if (
    !activeChat ||
    activeChat.type !== CHATINFO_TYPE.GROUP ||
    activeChat.targetId !== targetId
  ) {
    groupMembers.value = []
    groupMembersLoading.value = false
    return
  }

  groupMembersLoading.value = true
  try {
    const members = await findGroupMembers(targetId)
    if (token !== chatSwitchToken.value) {
      return
    }
    const latestActiveChat = chatStore.activeChat
    if (
      !latestActiveChat ||
      latestActiveChat.type !== CHATINFO_TYPE.GROUP ||
      latestActiveChat.targetId !== targetId
    ) {
      return
    }
    groupMembers.value = members
  } catch (error) {
    console.error('加载群成员失败:', error)
    if (token !== chatSwitchToken.value) {
      return
    }
    groupMembers.value = []
  } finally {
    if (token === chatSwitchToken.value) {
      groupMembersLoading.value = false
    }
  }
}

/**
 * private chat mode
 */

//更新chat用户信息
const updateUserInfo = async (
  targetId: string | undefined = chatStore.activeChat?.targetId,
  token = chatSwitchToken.value,
) => {
  if (!targetId) {
    return
  }

  const activeChat = chatStore.activeChat
  if (
    !activeChat ||
    activeChat.type !== CHATINFO_TYPE.PRIVATE ||
    activeChat.targetId !== targetId
  ) {
    return
  }

  try {
    if (friendStore.isFriend(targetId)) {
      const friend: Friend = await findFriend(targetId)
      if (token !== chatSwitchToken.value) {
        return
      }
      const latestActiveChat = chatStore.activeChat
      if (
        !latestActiveChat ||
        latestActiveChat.type !== CHATINFO_TYPE.PRIVATE ||
        latestActiveChat.targetId !== targetId
      ) {
        return
      }
      chatStore.updateChatFromFriend(friend)
      console.log('updateChatFromFriend', friend)
      return
    }
    const userInfo = await getUserInfo(targetId)
    if (token !== chatSwitchToken.value) {
      return
    }
    const latestActiveChat = chatStore.activeChat
    if (
      !latestActiveChat ||
      latestActiveChat.type !== CHATINFO_TYPE.PRIVATE ||
      latestActiveChat.targetId !== targetId
    ) {
      return
    }
    chatStore.updateChatFromUser(userInfo)
  } catch (error) {
    console.error('更新用户信息失败:', error)
  }
}

const getMessageKey = (message: Message, index: number) => {
  if ('id' in message && message.id) {
    return `id-${message.id}`
  }
  if ('tmpId' in message && message.tmpId) {
    return `tmp-${message.tmpId}`
  }
  return `fallback-${message.type}-${message.sendTime}-${index}`
}

const getActiveChatKey = (chat: Chat | null | undefined) => {
  if (!chat) {
    return ''
  }
  return `${chat.type}-${chat.targetId}`
}

const getChatViewport = () => {
  if (!chatScrollContainerRef.value) {
    return null
  }
  return chatScrollContainerRef.value.querySelector(
    '[data-slot="scroll-area-viewport"]',
  ) as HTMLElement | null
}

const scrollViewportToBottom = () => {
  const viewport = getChatViewport()
  if (!viewport) {
    return
  }
  viewport.scrollTop = viewport.scrollHeight
}

const scrollToBottomImmediately = () => {
  scrollViewportToBottom()
  requestAnimationFrame(() => {
    scrollViewportToBottom()
  })
}

watch(
  () => chatKey.value,
  (newChatKey) => {
    if (!newChatKey) {
      return
    }
    scrollToBottomImmediately()
  },
  { immediate: true, flush: 'post' },
)

watch(
  () => chatStore.activeChat,
  (newChat, oldChat) => {
    if (newChat === null) {
      return
    }
    const token = ++chatSwitchToken.value

    //标记已读
    if (newChat.unreadCount != 0) {
      const chatInfo = {
        targetId: newChat.targetId,
        type: newChat.type,
      } as ChatInfo
      chatStore.resetUnread(chatInfo)
      if (chatInfo.type == CHATINFO_TYPE.PRIVATE) {
        void readPrivateMessage(chatInfo.targetId)
      } else {
        void readGroupMessage(chatInfo.targetId)
      }
    }

    const oldChatKey = getActiveChatKey(oldChat)
    const newChatKey = getActiveChatKey(newChat)

    // 切换到群聊时加载群成员
    if (newChat.type === CHATINFO_TYPE.GROUP) {
      if (newChatKey !== oldChatKey) {
        groupMembers.value = []
      }
      void loadGroupMembers(newChat.targetId, token)
      return
    }

    // 私聊更新用户信息
    if (newChat.type === CHATINFO_TYPE.PRIVATE) {
      groupMembers.value = []
      groupMembersLoading.value = false
      void updateUserInfo(newChat.targetId, token)
    }
  },
  { immediate: true },
)
</script>

<style scoped></style>
