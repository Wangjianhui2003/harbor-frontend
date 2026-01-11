<template>
  <div v-if="show" ref="floatRef" class="fixed z-50" :style="floatStyle">
    <Card
      ref="dragHandle"
      class="flex flex-col items-center cursor-move select-none p-0 gap-0 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur overflow-hidden"
    >
      <div class="flex items-center justify-between p-3 gap-2">
        <div class="flex items-center gap-2">
          <Phone class="size-4 text-green-500" />
          <span class="text-sm font-medium">语音通话</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{{ formattedDuration }}</span>
        </div>
      </div>

      <!-- 语音通话显示头像 -->
      <div class="flex flex-col items-center">
        <BaseAvatar
          :headImage="friend?.headImage"
          :name="friend?.friendNickname"
          :size="5"
          class="rounded-full"
        />
        <div class="text-center">
          <div class="font-medium">{{ friend?.friendNickname }}</div>
          <div class="text-sm text-muted-foreground">
            {{ isCalling ? '正在呼叫...' : isChatting ? '通话中' : '连接中...' }}
          </div>
        </div>
      </div>
      <Button
        variant="destructive"
        class="rounded-full size-8 m-2"
        @click="isCalling ? handleCancel() : handleHangup()"
      >
        <Phone class="size-4" />
      </Button>
    </Card>
    <!-- 隐藏的音频元素用于播放远程音频 -->
    <audio ref="audioRef" autoplay />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useDraggable } from '@vueuse/core'
import { Phone } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import type { Friend } from '@/types'

interface Props {
  show: boolean
  isCalling?: boolean
  isChatting?: boolean
  friend: Friend | null
  remoteStream?: MediaStream | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  hangup: []
  cancel: []
}>()

// 音频元素引用
const audioRef = ref<HTMLAudioElement | null>(null)

// 拖动相关
const floatRef = ref<HTMLElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)

const { x, y } = useDraggable(floatRef, {
  handle: dragHandle,
  initialValue: {
    x: window.innerWidth / 2 - 120,
    y: window.innerHeight / 4,
  },
})

const floatStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
}))

// 通话计时
const callDuration = ref(0)
let durationTimer: ReturnType<typeof setInterval> | null = null

const formattedDuration = computed(() => {
  const minutes = Math.floor(callDuration.value / 60)
  const seconds = callDuration.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function startDurationTimer() {
  callDuration.value = 0
  durationTimer = setInterval(() => {
    callDuration.value++
  }, 1000)
}

function stopDurationTimer() {
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
  callDuration.value = 0
}

// 监听显示状态，控制计时器
watch(
  () => props.show,
  (show) => {
    if (show) {
      x.value = window.innerWidth / 2 - 120
      y.value = window.innerHeight / 4
      if (props.isChatting) {
        startDurationTimer()
      }
    } else {
      stopDurationTimer()
    }
  },
)

// 监听远程音频流变化，绑定到 audio 元素
watch(
  () => props.remoteStream,
  (stream) => {
    nextTick(() => {
      if (audioRef.value && stream) {
        audioRef.value.srcObject = stream
        audioRef.value.play().catch((err) => {
          console.error('播放远程音频失败:', err)
        })
      }
    })
  },
  { immediate: true },
)

// 监听 isChatting 开始计时
watch(
  () => props.isChatting,
  (chatting) => {
    if (chatting && props.show) {
      startDurationTimer()
    }
  },
)

function handleHangup() {
  emit('hangup')
}

function handleCancel() {
  emit('cancel')
}

onUnmounted(() => {
  stopDurationTimer()
})
</script>

<style scoped></style>
