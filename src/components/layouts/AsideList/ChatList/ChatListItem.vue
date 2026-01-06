<template>
  <Item
    :class="['h-16 p-1 hover:bg-primary/10', { 'bg-primary/10 border-primary': isChosen }]"
    variant="outline"
  >
    <ItemContent>
      <div class="rounded-xl flex flex-row items-center h-13 gap-3">
        <div class="relative">
          <!-- <img
            v-if="props.chat.headImage != ''"
            :src="props.chat.headImage"
            class="w-9 h-9 rounded-full object-cover"
          />
          <div v-else class="w-9 h-9 rounded-full bg-gray-200"></div> -->
          <base-avatar :headImage="props.chat.headImage" :name="props.chat.showName" />
          <base-badge
            v-if="props.chat.unreadCount > 0"
            :number="props.chat.unreadCount"
            class="absolute top-0 right-0"
          />
        </div>
        <div class="flex flex-col justify-around gap-1 text-sm text-40xl">
          <div>{{ props.chat.showName }}</div>
          <div>{{ lastContent }}</div>
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
