<template>
  <div class="flex items-center gap-2 p-3 rounded-sm min-w-48 max-w-64 bg-card">
    <Button
      variant="ghost"
      size="icon"
      class="size-8 shrink-0 rounded-full bg-card text-card-foreground hover:bg-card-foreground/10"
      @click="togglePlayback"
    >
      <component :is="isPlaying ? Pause : Play" class="size-4" />
    </Button>
    <div class="flex-1 flex flex-col gap-2">
      <Slider
        v-model="progress"
        :max="100"
        :step="1"
        class="w-full"
        @update:model-value="(v) => v && seek(v)"
      />
      <div class="flex justify-between text-xs text-primary">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Play, Pause } from 'lucide-vue-next'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import type { BaseMessage } from '@/types/chat'
import { useCached } from '@/composable/useCached'
import { toRef } from 'vue'

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

const isPlaying = ref(false)
const progress = ref([0])
const currentTime = ref(0)
const duration = ref(content.duration || 0)

let audio: HTMLAudioElement | null = null

/** 格式化时间 mm:ss */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/** 初始化音频 */
function initAudio() {
  if (!audioUrl.value) return

  audio = new Audio(audioUrl.value)

  audio.onloadedmetadata = () => {
    if (audio) {
      duration.value = audio.duration
    }
  }

  audio.ontimeupdate = () => {
    if (audio && audio.duration) {
      currentTime.value = audio.currentTime
      progress.value = [(audio.currentTime / audio.duration) * 100]
    }
  }

  audio.onended = () => {
    isPlaying.value = false
    progress.value = [0]
    currentTime.value = 0
  }
}

/** 切换播放/暂停 */
function togglePlayback() {
  if (!audio) {
    initAudio()
  }
  if (!audio) return

  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
  isPlaying.value = !isPlaying.value
}

/** 拖动进度条 */
function seek(value: number[]) {
  if (audio && audio.duration && value[0] !== undefined) {
    audio.currentTime = (value[0] / 100) * audio.duration
  }
}

onMounted(() => {
  // 延迟初始化，等待 cachedSrc 加载
  setTimeout(initAudio, 100)
})

onUnmounted(() => {
  if (audio) {
    audio.pause()
    audio = null
  }
})
</script>
