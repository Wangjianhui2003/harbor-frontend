<template>
  <Item :class="['h-16 p-1 hover:bg-primary/10 rounded-none', { 'bg-primary/10': isChosen }]">
    <ItemContent>
      <div class="flex flex-row items-center h-13 gap-3">
        <!-- 头像和在线状态 -->
        <div class="relative">
          <BaseAvatar :headImage="props.friend.headImage" :name="props.friend.friendNickname" />
          <!-- 在线状态指示器 -->
          <span
            v-if="props.friend.onlineWeb || props.friend.onlineApp"
            class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"
          />
        </div>
        <div class="flex flex-col justify-around gap-1 text-sm text-40xl">
          <div>{{ props.friend.friendNickname }}</div>
        </div>
        <div class="flex flex-col gap-1">
          <Monitor v-if="props.friend.onlineWeb" class="w-4 h-4 text-green-500" />
          <Smartphone v-if="props.friend.onlineApp" class="w-4 h-4 text-green-500" />
        </div>
      </div>
    </ItemContent>
  </Item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Item, ItemContent } from '@/components/ui/item'
import useFriendStore from '@/stores/friendStore'
import type { Friend } from '@/types'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { Monitor, Smartphone } from 'lucide-vue-next'

const props = defineProps<{
  friend: Friend
}>()

const friendStore = useFriendStore()

const isChosen = computed(() => {
  const index = friendStore.activeFriendIndex
  if (index === null) {
    return false
  }
  return friendStore.friends[index]?.id === props.friend.id
})
</script>

<style scoped></style>
