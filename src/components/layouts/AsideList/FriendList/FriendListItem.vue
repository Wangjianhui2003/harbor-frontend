<template>
  <Item
    :class="['h-16 p-1 hover:bg-primary/10', { 'bg-primary/10 border-primary': isChosen }]"
    variant="outline"
  >
    <ItemContent>
      <div class="rounded-xl flex flex-row items-center h-13 gap-3">
        <div class="relative">
          <img
            v-if="props.friend.headImage != ''"
            :src="props.friend.headImage"
            class="w-9 h-9 rounded-full object-cover"
          />
          <div v-else class="w-9 h-9 rounded-full bg-gray-200"></div>
        </div>
        <div class="flex flex-col justify-around gap-1 text-sm text-40xl">
          <div>{{ props.friend.friendNickname }}</div>
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
