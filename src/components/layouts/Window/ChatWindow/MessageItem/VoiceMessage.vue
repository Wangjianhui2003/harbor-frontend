<template>
  <audio controls :src="audioUrl" class="h-11" :style="{ width: audioWidth }" />
</template>

<script setup lang="ts">
import type { BaseMessage } from '@/types/chat'
import { useCached } from '@/composable/useCached'
import { toRef, computed } from 'vue'

const props = defineProps<{ message: BaseMessage }>()

interface VoiceContent {
  url: string
  duration: number
}

const content = JSON.parse(props.message.content) as VoiceContent

const { cachedSrc: audioUrl } = useCached(
  toRef(() => content.url),
  { prefix: 'audio' },
)

// 根据时长计算宽度
const MIN_WIDTH = 220
const MAX_WIDTH = 400
const WIDTH_PER_SECOND = 8 // 每秒增加8px

const audioWidth = computed(() => {
  const duration = content.duration || 0
  const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, MIN_WIDTH + duration * WIDTH_PER_SECOND))
  return `${width}px`
})
</script>
