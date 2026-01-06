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
import ChatListItem from './ChatListItem.vue';

const props = defineProps<{
  chats: Chat[]
}>()

const chatStore = useChatStore()

const chooseChat = (index: number) => {
  const chat = props.chats[index]
  if (!chat) {
    return
  }
  chatStore.activateChat(index)
  const chatInfo = {
    targetId: chat.targetId,
    type: chat.type,
  } as ChatInfo
  chatStore.resetUnread(chatInfo)
}
</script>

<style scoped></style>
