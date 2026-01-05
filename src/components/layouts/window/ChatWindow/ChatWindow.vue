<template>
  <Card class="rounded-xs h-full p-0">
    <div class="border-b p-1 flex items-center justify-center">
      {{ chatStore.activeChat?.showName }}
    </div>
    <div class="overflow-auto">
      <component
        v-for="(message, index) in chatStore.activeChat?.messages"
        :is="BaseMessage"
        :message="message"
        :key="index"
      ></component>
    </div>
  </Card>

  <Separator />
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import BaseMessage from './MessageItem/BaseMessage.vue'

const chatStore = useChatStore()
</script>

<style scoped></style>
