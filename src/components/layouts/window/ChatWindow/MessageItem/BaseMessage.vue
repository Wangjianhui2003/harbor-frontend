<template>
  <div>{{ props.message }}</div>
</template>

<script setup lang="ts">
import type { Message } from '@/types/chat'

const props = defineProps<{
  message: Message
}>()
</script>

<style scoped></style>
