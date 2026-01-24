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
import type { Chat } from '@/types/chat'
import ChatListItem from './ChatListItem.vue'

const props = defineProps<{
  chats: Chat[]
}>()

const chatStore = useChatStore()

const chooseChat = async (index: number) => {
  const chat = props.chats[index]
  if (!chat) {
    return
  }
  //选中
  chatStore.activateChat(index)
}
</script>

<style scoped></style>
