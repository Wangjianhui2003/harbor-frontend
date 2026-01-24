<template>
  <chat-list-item
    v-for="(chat, index) in props.chats"
    :key="index"
    :chat="chat"
    @click="chooseChat(index)"
  />
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import type { Chat, ChatInfo } from '@/types/chat'
import ChatListItem from './ChatListItem.vue'
import { readPrivateMessage } from '@/api/private-msg'
import { CHATINFO_TYPE } from '@/utils/enums'
import { readGroupMessage } from '@/api/group-msg'
import { findFriend } from '@/api/friend'

const props = defineProps<{
  chats: Chat[]
}>()

const chatStore = useChatStore()

const chooseChat = async (index: number) => {
  const chat = props.chats[index]
  if (!chat) {
    return
  }
  chatStore.activateChat(index)
  
  const friend = await findFriend(chat.targetId)
  console.log(friend)
  chatStore.updateChatFromFriend(friend)
  if (chat.unreadCount == 0) return
  const chatInfo = {
    targetId: chat.targetId,
    type: chat.type,
  } as ChatInfo
  //已读
  chatStore.resetUnread(chatInfo)
  if (chatInfo.type == CHATINFO_TYPE.PRIVATE) {
    readPrivateMessage(chatInfo.targetId)
  } else {
    readGroupMessage(chatInfo.targetId)
  }
}
</script>

<style scoped></style>
