<template>
  <div class="flex flex-row h-screen">
    <div class="basis-4/24 h-screen bg-primary-100 dark:bg-primary-800">
      <chat-list :chats="chats" />
      chatlist
    </div>
    <div class="basis-20/24 h-screen bg-primary-200 dark:bg-primary-900"></div>
  </div>
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
const { chats } = useChatStore()

console.log('ChatPage chats:', chats)
</script>

<style scoped></style>
