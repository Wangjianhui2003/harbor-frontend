<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" ref="floatRef" class="fixed z-50" :style="floatStyle">
      <Card
        class="gap-0 p-0 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur overflow-hidden"
      >
        <!-- 拖动手柄 Header -->
        <div
          ref="dragHandle"
          class="p-3 gap-4 cursor-move select-none flex items-center justify-center"
        >
          <div class="flex items-center gap-2">
            <BaseAvatar :headImage="friend?.headImage" :name="friend?.friendNickname" :size="2" />
            <span class="text-sm font-medium truncate max-w-32">
              {{ friend?.friendNickname }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Video class="size-5 text-green-500 animate-pulse" />
            <span>{{ formattedDuration }}</span>
          </div>
        </div>
        <!--  -->
        <div class="relative">
          <!-- 远程视频（大窗口） -->
          <div class="w-200 h-125 bg-black flex items-center justify-center">
            <video
              v-if="remoteStream"
              ref="remoteVideoRef"
              autoplay
              playsinline
              class="w-full h-full object-cover"
            />
            <div v-else class="text-white/50 flex flex-col items-center gap-2">
              <LoaderCircle class="size-8 animate-spin" />
              <span class="text-sm">{{ isCalling ? '正在呼叫...' : '等待视频连接...' }}</span>
            </div>
          </div>

          <!-- 本地视频（小窗口） -->
          <div
            class="absolute bottom-2 right-2 w-40 h-25 bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-lg"
          >
            <video
              v-if="localStream"
              ref="localVideoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-white/50">
              <LoaderCircle class="size-6 animate-spin" />
            </div>
          </div>
        </div>
        <!-- 控制按钮 -->
        <Button
          variant="destructive"
          class="absolute left-1/2 -translate-x-1/2 bottom-5 cursor-pointer rounded-full size-8"
          @click="isCalling ? handleCancel() : handleHangup()"
        >
          <PhoneOff class="size-4" />
        </Button>
      </Card>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useDraggable } from '@vueuse/core'
import { Video, PhoneOff, LoaderCircle } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import type { Friend } from '@/types'

interface Props {
  show: boolean
  isCalling?: boolean
  friend: Friend | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  hangup: []
  cancel: []
}>()

// 视频元素引用
const localVideoRef = ref<HTMLVideoElement | null>(null)
const remoteVideoRef = ref<HTMLVideoElement | null>(null)

// 拖动相关
const floatRef = ref<HTMLElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)

const { x, y } = useDraggable(floatRef, {
  handle: dragHandle,
  initialValue: {
    x: window.innerWidth / 2 - 160,
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

// 监听流变化，绑定到 video 元素
watch(
  () => props.localStream,
  (stream) => {
    nextTick(() => {
      if (localVideoRef.value && stream) {
        localVideoRef.value.srcObject = stream
        localVideoRef.value.muted = true
      }
    })
  },
  { immediate: true },
)

watch(
  () => props.remoteStream,
  (stream) => {
    nextTick(() => {
      if (remoteVideoRef.value && stream) {
        remoteVideoRef.value.srcObject = stream
      }
    })
  },
  { immediate: true },
)

// 监听显示状态，控制计时器 + 重新绑定视频流
watch(
  () => props.show,
  (show) => {
    if (show) {
      x.value = window.innerWidth / 2 - 160
      y.value = window.innerHeight / 4
      startDurationTimer()
      // 组件显示时重新绑定视频流
      nextTick(() => {
        if (localVideoRef.value && props.localStream) {
          localVideoRef.value.srcObject = props.localStream
          // 本地视频静音
          localVideoRef.value.muted = true
        }
        if (remoteVideoRef.value && props.remoteStream) {
          remoteVideoRef.value.srcObject = props.remoteStream
        }
      })
    } else {
      stopDurationTimer()
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
