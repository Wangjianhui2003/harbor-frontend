<template>
  <Item :class="['h-16 p-1 hover:bg-primary/10 rounded-none', { 'bg-primary/10': isChosen }]">
    <ItemContent>
      <div class="flex flex-row items-center h-13 gap-3">
        <div class="relative">
          <BaseAvatar :headImage="props.chat.headImage" :name="props.chat.showName" />
          <Badge
            variant="destructive"
            v-if="props.chat.unreadCount > 0"
            class="absolute top-0 left-7 size-4 rounded-full"
          >
            {{ props.chat.unreadCount }}
          </Badge>
        </div>
        <div class="flex flex-col justify-around gap-1 text-sm text-40xl">
          <div>{{ props.chat.showName }}</div>
          <div class="text-[11px] text-muted-foreground">{{ lastContent }}</div>
        </div>
      </div>
    </ItemContent>
  </Item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Item, ItemContent } from '@/components/ui/item'
import useChatStore from '@/stores/chatStore'
import type { Chat } from '@/types/chat'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{ chat: Chat }>()

const chatStore = useChatStore()

const isChosen = computed(() => {
  if (!chatStore.activeChat) {
    return false
  }
  return (
    chatStore.activeChat.targetId == props.chat.targetId &&
    chatStore.activeChat.type == props.chat.type
  )
})

//显示最近一条消息
const lastContent = computed(() => {
  if (!props.chat) {
    return ''
  }
  const str = props.chat.lastContent
  if (str.length > 14) {
    return str.substring(0, 14) + '...'
  }
  return str
})
</script>

<style scoped></style>
