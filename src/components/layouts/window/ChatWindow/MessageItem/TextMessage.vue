<template>
  <Item
    :class="[
      'p-2 bg-primary/10 ',
      props.message.selfSend && 'bg-primary/90 text-primary-foreground',
      'wrap-anywhere',
    ]"
  >
    {{ props.message.content }}
  </Item>
</template>

<script setup lang="ts">
import type { BaseMessage } from '@/types/chat'
import Item from '@/components/ui/item/Item.vue'

const props = defineProps<{
  message: BaseMessage
}>()
</script>

<style scoped></style>
