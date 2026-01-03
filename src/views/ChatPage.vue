<template>
  <div class="flex flex-row h-screen">
    <div class="basis-4/24">
      <Card class="h-full flex flex-col">
        <CardHeader>
          <Input  />
        </CardHeader>
        <CardContent class="flex-1 min-h-0 p-0">
          <ScrollArea class="h-full w-full"> <ChatList :chats="chatStore.chats" /></ScrollArea>
        </CardContent>
      </Card>
    </div>
    <div class="basis-20/24 h-screen">
      <Card class="h-full flex flex-col">
        <CardContent class="flex-1 min-h-0 p-0">
          <ScrollArea class="h-full w-full"> Chat Content Area </ScrollArea>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import useChatStore from '@/stores/chatStore'
const chatStore = useChatStore()
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import ChatList from '@/components/layouts/AsideList/ChatList/ChatList.vue'
</script>

<style scoped></style>
