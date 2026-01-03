<template>
  <chat-list-item v-for="(chat, index) in props.chats" :key="index" :chat="chat" />
</template>

<script setup lang="ts">
const props = defineProps({
  chats: {
    required: true,
    type: Array,
  },
})
</script>

<style scoped></style>
