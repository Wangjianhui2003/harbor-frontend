<template>
  <div class="flex flex-row h-screen">
    <div class="basis-4/24">
      <Card class="h-full flex flex-col rounded-xs">
        <CardHeader class="gap-0">
          <Input />
        </CardHeader>
        <CardContent class="flex-1 min-h-0 p-0">
          <ScrollArea class="h-full w-full"> <ChatList :chats="chatStore.chats" /></ScrollArea>
        </CardContent>
      </Card>
    </div>
    <div class="basis-20/24 h-screen flex flex-col"><ChatWindow /></div>
  </div>
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import ChatList from '@/components/layouts/AsideList/ChatList/ChatList.vue'
import ChatWindow from '@/components/layouts/Window/ChatWindow/ChatWindow.vue'

const chatStore = useChatStore()
</script>

<style scoped></style>
