<template>
  <div class="flex flex-row items-center bg-primary-100">
    <Avatar label="" :image="props.chat.headImage" size="large" shape="circle" />
    <div class="">
      <div class="">{{ props.chat.showName }}</div>
      <div class="">{{ lastContent }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
