<template>
  <div class="relative inline-block">
    <n-image width="250" :src="originUrl">
      <template #error>
        <ImageOff />
      </template>
    </n-image>
  </div>
</template>

<script setup lang="ts">
import type { BaseMessage } from '@/types/chat'
import { useCached } from '@/composable/useCached'
import { toRef } from 'vue'
// import { useImage } from '@vueuse/core'
import { NImage } from 'naive-ui'
import { ImageOff } from 'lucide-vue-next'

const props = defineProps<{ message: BaseMessage }>()

interface ImageContent {
  originUrl: string
  thumbUrl: string
}

const content = JSON.parse(props.message.content) as ImageContent

const { cachedSrc: originUrl } = useCached(
  toRef(() => content.originUrl),
  { prefix: 'image' },
)

// const { isLoading: originLoading } = useImage({ src: originUrl.value })
</script>
