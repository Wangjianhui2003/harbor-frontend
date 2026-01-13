<template>
  <div>
    <ContextMenu>
      <ContextMenuTrigger>
        <Item
          :class="[
            'h-16 p-1 hover:bg-primary/10 rounded-none',
            { 'bg-primary/10': isChosen },
            { 'bg-muted/50': props.chat.pinned && !isChosen },
          ]"
        >
          <ItemContent>
            <div class="flex flex-row items-center h-13 gap-3 relative">
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
              <div class="flex flex-col justify-around gap-1 text-sm text-40xl flex-1">
                <div>{{ props.chat.showName }}</div>
                <div class="text-[11px] text-muted-foreground">{{ lastContent }}</div>
              </div>
              <!-- 固定图标 -->
              <div v-if="props.chat.pinned" class="text-muted-foreground text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="opacity-60"
                >
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
              </div>
            </div>
          </ItemContent>
        </Item>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem v-if="!props.chat.pinned" @click="pinChat()">固定</ContextMenuItem>
        <ContextMenuItem v-else @click="unpinChat()">取消固定</ContextMenuItem>
        <ContextMenuItem @click="removeChat()">删除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Item, ItemContent } from '@/components/ui/item'
import useChatStore from '@/stores/chatStore'
import type { Chat, ChatInfo } from '@/types/chat'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { Badge } from '@/components/ui/badge'
import { CHATINFO_TYPE } from '@/utils/enums'

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

const removeChat = () => {
  if (props.chat.type == CHATINFO_TYPE.PRIVATE) {
    chatStore.removePrivateChat(props.chat.targetId)
  } else {
    chatStore.removeGroupChat(props.chat.targetId)
  }
}

const pinChat = () => {
  chatStore.pinChat({ type: props.chat.type, targetId: props.chat.targetId } as ChatInfo)
}

const unpinChat = () => {
  chatStore.unpinChat({ type: props.chat.type, targetId: props.chat.targetId } as ChatInfo)
}
</script>

<style scoped></style>
