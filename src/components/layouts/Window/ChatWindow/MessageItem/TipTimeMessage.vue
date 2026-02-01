<template>
  <div class="flex justify-center items-center">
    <Badge variant="secondary">{{ timeTipText }}</Badge>
  </div>
</template>

<script setup lang="ts">
import type { TimeTipMessage } from '@/types/chat'
import { toTimeText } from '@/utils/date'
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{ message: TimeTipMessage }>()

const timeTipText = computed(() => toTimeText(props.message.sendTime))
</script>

<style scoped></style>
