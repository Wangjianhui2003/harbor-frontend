<template>
  <div v-if="show" ref="floatRef" class="fixed z-50" :style="floatStyle">
    <Card class="w-72 shadow-xl border-2 border-primary/20 bg-background/95 backdrop-blur">
      <!-- 拖动手柄 -->
      <CardHeader ref="dragHandle" class="cursor-move select-none pb-2">
        <div class="flex items-center gap-3">
          <BaseAvatar
            :headImage="friend?.headImage"
            :name="friend?.friendNickname"
            :size="3"
            class="border-2 border-primary/30 rounded-full"
          />
          <div class="flex-1 min-w-0">
            <CardTitle class="text-base truncate">{{ friend?.friendNickname }}</CardTitle>
            <CardDescription class="text-sm">
              {{ isCaller ? '正在呼叫...' : '语音来电...' }}
            </CardDescription>
          </div>
          <Phone class="size-6 text-primary animate-pulse" />
        </div>
      </CardHeader>

      <CardContent class="pt-0 pb-4">
        <div class="flex justify-center gap-4">
          <!-- 发起方：只有取消按钮 -->
          <template v-if="isCaller">
            <Button
              variant="destructive"
              size="lg"
              class="rounded-full size-14"
              @click="handleCancel"
            >
              <PhoneOff class="size-6" />
            </Button>
          </template>

          <!-- 接收方：接受和拒绝按钮 -->
          <template v-else>
            <Button
              variant="destructive"
              size="lg"
              class="rounded-full size-14"
              @click="handleReject"
            >
              <PhoneOff class="size-6" />
            </Button>
            <Button
              variant="default"
              size="lg"
              class="rounded-full size-14 bg-green-600 hover:bg-green-700"
              @click="handleAccept"
            >
              <Phone class="size-6" />
            </Button>
          </template>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDraggable } from '@vueuse/core'
import { Phone, PhoneOff } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import type { Friend } from '@/types'

interface Props {
  show: boolean
  isCaller: boolean
  friend: Friend | null
  offer?: RTCSessionDescriptionInit | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  accept: [offer: RTCSessionDescriptionInit | null]
  reject: []
  cancel: []
}>()

// 拖动相关
const floatRef = ref<HTMLElement | null>(null)
const dragHandle = ref<HTMLElement | null>(null)

const { x, y } = useDraggable(floatRef, {
  handle: dragHandle,
  initialValue: {
    x: window.innerWidth / 2 - 144,
    y: window.innerHeight / 4,
  },
})

const floatStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
}))

// 显示时重置位置
watch(
  () => props.show,
  (show) => {
    if (show) {
      x.value = window.innerWidth / 2 - 144
      y.value = window.innerHeight / 4
    }
  },
)

function handleAccept() {
  emit('accept', props.offer || null)
}

function handleReject() {
  emit('reject')
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped></style>
