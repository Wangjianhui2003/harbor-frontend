<template>
  <div class="fixed bottom-2 w-5/7 flex flex-col items-center">
    <div v-if="unreadCount" class="animate-bounce flex flex-row justify-center items-center gap-1">
      <Button variant="ghost" class="rounded-full w-10 h-10" @click="scrollToBottom()">
        <CircleArrowDown class="size-6" />
      </Button>
      <span>{{ unreadCount }} 条未读</span>
    </div>
    <InputGroup class="w-full bg-secondary">
      <InputGroupTextarea
        v-model="messageContent"
        placeholder="输入消息 shift+enter 换行"
        @keydown="handleKeydown"
      />
      <InputGroupAddon align="block-end">
        <HoverTip content="发送图片">
          <InputGroupButton
            @click="handleSendImage"
            variant="ghost"
            class="hover:bg-primary/10 size-7"
          >
            <Image class="size-5" />
          </InputGroupButton>
        </HoverTip>
        <HoverTip content="发送文件">
          <InputGroupButton
            @click="handleSendFile"
            variant="ghost"
            class="hover:bg-primary/10 size-7"
          >
            <FilePlus class="size-5" />
          </InputGroupButton>
        </HoverTip>
        <!-- 录音中 UI-->
        <div
          v-if="voiceState === 'RECORDING'"
          class="flex items-center gap-2 bg-card rounded-sm p-1"
        >
          <InputGroupButton variant="destructive" @click="stopRecording" class="size-5">
          </InputGroupButton>
          <InputGroupText class="flex items-center gap-2">
            <span class="animate-pulse text-destructive">●</span>
            <span>{{ formatDuration(recordingDuration) }}</span>
          </InputGroupText>
          <InputGroupButton variant="ghost" size="icon-xs" @click="cancelRecording" class="size-5">
            <X class="size-4" />
          </InputGroupButton>
        </div>
        <!-- 预览模式 UI-->
        <div
          v-else-if="voiceState === 'PREVIEW'"
          class="flex items-center gap-2 bg-card rounded-sm p-1"
        >
          <InputGroupButton variant="ghost" @click="togglePreviewPlayback" class="size-5">
            <component :is="isPreviewPlaying ? Pause : Play" class="size-4" />
          </InputGroupButton>
          <div class="flex items-center gap-2 px-1 min-w-32">
            <Slider
              v-model="previewProgress"
              :max="100"
              :step="1"
              class="w-24"
              @update:model-value="(v) => v && seekPreview(v)"
            />
            <span class="text-xs text-muted-foreground">
              {{ formatDuration(recordingDuration) }}
            </span>
          </div>
          <InputGroupButton variant="default" class="rounded-full size-5" @click="sendVoiceMessage">
            <ArrowUpIcon class="size-4" />
          </InputGroupButton>
          <InputGroupButton variant="ghost" class="size-5" @click="cancelRecording">
            <X class="size-4" />
          </InputGroupButton>
        </div>
        <!-- 正常状态的麦克风按钮 -->
        <HoverTip v-else content="发送语音">
          <InputGroupButton
            @click="startRecording"
            variant="ghost"
            class="hover:bg-primary/10 size-7"
          >
            <Mic class="size-5" />
          </InputGroupButton>
        </HoverTip>

        <HoverTip content="语言通话">
          <InputGroupButton
            @click="handleSendVoiceCall"
            variant="ghost"
            class="hover:bg-primary/10 size-7"
          >
            <PhoneOutgoing class="size-5" />
          </InputGroupButton>
        </HoverTip>
        <HoverTip content="视频通话">
          <InputGroupButton
            @click="handleSendVideoCall"
            variant="ghost"
            class="hover:bg-primary/10 size-7"
          >
            <Video class="size-5" />
          </InputGroupButton>
        </HoverTip>
        <InputGroupText class="ml-auto"> 发送 </InputGroupText>
        <Separator orientation="vertical" class="h-4!" />
        <InputGroupButton
          variant="default"
          class="rounded-full cursor-pointer size-7"
          :disabled="isSending"
          @click="handleSend"
        >
          <ArrowUpIcon class="size-5" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import {
  Image,
  Mic,
  PhoneOutgoing,
  FilePlus,
  Video,
  ArrowUpIcon,
  CircleArrowDown,
  X,
  Play,
  Pause,
} from 'lucide-vue-next'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import HoverTip from '@/components/common/HoverTip.vue'
import { useSendMessage } from '@/composable/useSendMessage'
import { scrollToBottom } from '@/utils/dom'
import useChatStore from '@/stores/chatStore'
import uploadFile from '@/api/file'

const chatStore = useChatStore()
const messageContent = ref('')
const { sendTextMessage, sendImageMessage, sendFileMessage, sendAudioMessage, isSending } =
  useSendMessage()

// ========== 语音录制相关 ==========
type VoiceState = 'IDLE' | 'RECORDING' | 'PREVIEW'
const voiceState = ref<VoiceState>('IDLE')
const recordingDuration = ref(0)
const isPreviewPlaying = ref(false)
const previewProgress = ref([0])

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingTimer: ReturnType<typeof setInterval> | null = null
let audioBlob: Blob | null = null
let previewAudio: HTMLAudioElement | null = null
let isCancelled = false // 标记是否取消录音

/** 格式化时长 mm:ss */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/** 开始录音 */
async function startRecording() {
  try {
    isCancelled = false // 重置取消标记
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      stream.getTracks().forEach((track) => track.stop())
      // 只有非取消状态下才进入预览模式
      if (!isCancelled) {
        voiceState.value = 'PREVIEW'
        createPreviewAudio()
      }
    }

    mediaRecorder.start()
    voiceState.value = 'RECORDING'
    recordingDuration.value = 0

    recordingTimer = setInterval(() => {
      recordingDuration.value++
    }, 1000)
  } catch (error) {
    console.error('无法访问麦克风', error)
  }
}

/** 停止录音 */
function stopRecording() {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
}

/** 取消录音 */
function cancelRecording() {
  isCancelled = true // 标记为取消操作
  stopRecording()
  cleanupRecording()
  voiceState.value = 'IDLE'
}

/** 清理录音资源 */
function cleanupRecording() {
  if (previewAudio) {
    previewAudio.pause()
    previewAudio = null
  }
  audioBlob = null
  audioChunks = []
  recordingDuration.value = 0
  previewProgress.value = [0]
  isPreviewPlaying.value = false
}

/** 创建预览音频 */
function createPreviewAudio() {
  if (!audioBlob) return
  previewAudio = new Audio(URL.createObjectURL(audioBlob))
  previewAudio.ontimeupdate = () => {
    if (previewAudio && previewAudio.duration) {
      previewProgress.value = [(previewAudio.currentTime / previewAudio.duration) * 100]
    }
  }
  previewAudio.onended = () => {
    isPreviewPlaying.value = false
    previewProgress.value = [0]
  }
}

/** 切换预览播放 */
function togglePreviewPlayback() {
  if (!previewAudio) return
  if (isPreviewPlaying.value) {
    previewAudio.pause()
  } else {
    previewAudio.play()
  }
  isPreviewPlaying.value = !isPreviewPlaying.value
}

/** 拖动进度条 */
function seekPreview(value: number[]) {
  if (previewAudio && previewAudio.duration && value[0] !== undefined) {
    previewAudio.currentTime = (value[0] / 100) * previewAudio.duration
  }
}

/** 发送语音消息 */
async function sendVoiceMessage() {
  if (!audioBlob) return

  const formData = new FormData()
  formData.append('file', audioBlob, `voice_${Date.now()}.webm`)

  try {
    const url = await uploadFile(formData, '/file/upload', {})
    const content = JSON.stringify({
      url,
      duration: recordingDuration.value,
    })
    await sendAudioMessage(content)
    scrollToBottom()
  } catch (error) {
    console.error('语音上传失败', error)
  } finally {
    cleanupRecording()
    voiceState.value = 'IDLE'
  }
}

// 组件卸载时清理
onUnmounted(() => {
  cancelRecording()
})

// ========== 原有功能 ==========

/** 处理键盘事件 - Enter 发送，Ctrl+Enter 换行 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

/** 发送消息 */
async function handleSend() {
  const message = messageContent.value
  messageContent.value = ''
  scrollToBottom()
  const success = await sendTextMessage(message)
  if (success) {
  }
}

/** 发送图片 */
function handleSendImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadFile(formData, '/image/upload', {})
      const content = JSON.stringify({
        originUrl: result.originUrl,
        thumbUrl: result.thumbUrl,
      })
      await sendImageMessage(content)
      scrollToBottom()
    } catch (error) {
      console.error('图片上传失败', error)
    }
  }
  input.click()
}

/** 发送文件 */
function handleSendFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadFile(formData, '/file/upload', {})
      const content = JSON.stringify({
        url: result,
        name: file.name,
        size: file.size,
      })
      await sendFileMessage(content)
      scrollToBottom()
    } catch (error) {
      console.error('文件上传失败', error)
    }
  }
  input.click()
}

/** 发送语言通话 */
function handleSendVoiceCall() {}

/** 发送视频通话 */
function handleSendVideoCall() {}

const unreadCount = computed(() => {
  return chatStore.activeChat?.unreadCount || 0
})

watch(
  () => chatStore.activeChat,
  () => {
    messageContent.value = ''
  },
)
</script>

<style scoped></style>
