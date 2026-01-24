<template>
  <div class="relative inline-block">
    <div class="relative rounded-lg overflow-hidden cursor-pointer group">
      <!-- 视频播放器 -->
      <video
        ref="videoRef"
        :src="videoUrl"
        class="rounded-lg block"
        :style="videoStyle"
        :controls="isPlaying"
        preload="metadata"
        @loadedmetadata="onLoadedMetadata"
        @play="isPlaying = true"
        @pause="onPause"
        @ended="onEnded"
        @click.prevent="handleClick"
      />

      <!-- 播放按钮遮罩 -->
      <div
        v-if="!isPlaying"
        class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors pointer-events-none"
      >
        <div class="size-12 rounded-full flex items-center justify-center shadow-lg">
          <Play class="size-6 text-primary ml-1" />
        </div>
      </div>

      <!-- 视频时长 -->
      <div
        v-if="!isPlaying && videoDuration"
        class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs pointer-events-none"
      >
        {{ formatDuration(videoDuration) }}
      </div>
    </div>

    <!-- 视频信息 -->
    <div
      v-if="videoInfo.name"
      class="mt-1 text-xs text-muted-foreground truncate"
      :style="{ maxWidth: videoStyle.width }"
      :title="videoInfo.name"
    >
      {{ videoInfo.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, computed } from 'vue'
import type { BaseMessage } from '@/types/chat'
import { useCached } from '@/composable/useCached'
import { Play } from 'lucide-vue-next'
import type { VideoContent } from '@/types/file'

// 视频显示的最大尺寸限制
const MAX_WIDTH = 320
const MAX_HEIGHT = 400

const props = defineProps<{ message: BaseMessage }>()


const videoInfo = JSON.parse(props.message.content) as VideoContent

const { cachedSrc: videoUrl } = useCached(
  toRef(() => videoInfo.url),
  { prefix: 'video' },
)

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const videoDuration = ref<number>(videoInfo.duration || 0)
const videoWidth = ref<number>(0)
const videoHeight = ref<number>(0)

/** 计算视频显示尺寸 */
const videoStyle = computed(() => {
  if (!videoWidth.value || !videoHeight.value) {
    // 默认尺寸
    return { width: `${MAX_WIDTH}px`, height: 'auto' }
  }

  const aspectRatio = videoWidth.value / videoHeight.value
  let width = videoWidth.value
  let height = videoHeight.value

  // 按最大宽度缩放
  if (width > MAX_WIDTH) {
    width = MAX_WIDTH
    height = width / aspectRatio
  }

  // 按最大高度缩放
  if (height > MAX_HEIGHT) {
    height = MAX_HEIGHT
    width = height * aspectRatio
  }

  return {
    width: `${Math.round(width)}px`,
    height: `${Math.round(height)}px`,
  }
})

/** 视频元数据加载完成 */
function onLoadedMetadata() {
  const video = videoRef.value
  if (!video) return

  if (video.duration) {
    videoDuration.value = video.duration
  }
  if (video.videoWidth && video.videoHeight) {
    videoWidth.value = video.videoWidth
    videoHeight.value = video.videoHeight
  }
}

/** 格式化时长 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/** 点击视频 */
function handleClick() {
  const video = videoRef.value
  if (!video) return

  if (isPlaying.value) {
    video.pause()
  } else {
    video.play()
  }
}

/** 视频暂停 */
function onPause() {
  // 暂停时保持控制条可见
}

/** 视频结束 */
function onEnded() {
  isPlaying.value = false
}
</script>

<style scoped>
video {
  display: block;
  background: #000;
}
</style>
