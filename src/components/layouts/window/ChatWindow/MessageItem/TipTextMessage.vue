<template>
  <div class="wrap-anywhere text-center select-none py-8 text-muted-foreground">
    {{ props.message.content }}
  </div>
</template>

<script setup lang="ts">
import type { BaseMessage } from '@/types/chat'

const props = defineProps<{ message: BaseMessage }>()
</script>

<style scoped></style>
