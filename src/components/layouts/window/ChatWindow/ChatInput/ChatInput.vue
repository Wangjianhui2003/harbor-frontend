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
        <ImageButton />
        <FileButton />
        <VoiceButton />
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
import { computed, ref, watch } from 'vue'
import { PhoneOutgoing, Video, ArrowUpIcon, CircleArrowDown } from 'lucide-vue-next'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import HoverTip from '@/components/common/HoverTip.vue'
import { useSendMessage } from '@/composable/useSendMessage'
import { scrollToBottom } from '@/utils/dom'
import useChatStore from '@/stores/chatStore'

// 导入拆分的组件
import ImageButton from './ImageButton.vue'
import FileButton from './FileButton.vue'
import VoiceButton from './VoiceButton.vue'

const chatStore = useChatStore()
const messageContent = ref('')
const { sendTextMessage, isSending } = useSendMessage()

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
