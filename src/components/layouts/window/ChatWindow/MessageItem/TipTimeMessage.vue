<template>
  <div class="flex justify-center items-center p-2">
    <Badge variant="secondary">{{ timeTipText }}</Badge>
  </div>
</template>

<script setup lang="ts">
import type { TimeTipMessage } from '@/types/chat'
import { toTimeText } from '@/utils/date'
import { computed } from 'vue'

const props = defineProps<{ message: TimeTipMessage }>()

const timeTipText = computed(() => toTimeText(props.message.sendTime))
</script>

<style scoped></style>
