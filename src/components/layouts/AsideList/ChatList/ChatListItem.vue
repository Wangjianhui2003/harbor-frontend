<template>
  <!-- <div class="rounded-xl flex flex-row items-center h-13 gap-3">
    <div class="relative">
      <img
        v-if="props.chat.headImage != ''"
        :src="props.chat.headImage"
        class="w-9 h-9 rounded-full object-cover"
      />
      <div v-else class="w-9 h-9 rounded-full bg-gray-200"></div>
      <base-badge
        v-if="props.chat.unreadCount > 0"
        :number="props.chat.unreadCount"
        class="absolute top-0 right-0"
      />
    </div>
    <div class="flex flex-col justify-around gap-1">
      <div>{{ props.chat.showName }}</div>
      <div>{{ lastContent }}</div>
    </div>
  </div> -->
  <Item class="h-18 p-1 hover:bg-primary/10" variant="outline">
    <ItemContent>
      <div class="rounded-xl flex flex-row items-center h-13 gap-3">
        <div class="relative">
          <img
            v-if="props.chat.headImage != ''"
            :src="props.chat.headImage"
            class="w-9 h-9 rounded-full object-cover"
          />
          <div v-else class="w-9 h-9 rounded-full bg-gray-200"></div>
          <base-badge
            v-if="props.chat.unreadCount > 0"
            :number="props.chat.unreadCount"
            class="absolute top-0 right-0"
          />
        </div>
        <div class="flex flex-col justify-around gap-1 font-mono text-sm">
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
const props = defineProps({
  chat: {
    required: true,
    type: Object,
  },
  active: {
    type: Boolean,
  },
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
