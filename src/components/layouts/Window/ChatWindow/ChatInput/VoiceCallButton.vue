<template>
  <HoverTip content="语音通话">
    <InputGroupButton
      @click="handleSendVoiceCall"
      variant="ghost"
      class="hover:bg-primary/10 size-7"
    >
      <PhoneOutgoing class="size-5" />
    </InputGroupButton>
  </HoverTip>
</template>

<script setup lang="ts">
import { PhoneOutgoing } from 'lucide-vue-next'
import { InputGroupButton } from '@/components/ui/input-group'
import HoverTip from '@/components/common/HoverTip.vue'
import useChatStore from '@/stores/chatStore'
import { CHATINFO_TYPE } from '@/utils/enums'
import mitter from '@/event/mitt'
import { RTC_EVENTS } from '@/event/rtc_events'

const chatStore = useChatStore()

/** 发送语音通话 */
function handleSendVoiceCall() {
  // 仅私聊支持语音通话，群聊点击无反应
  if (chatStore.activeChat?.type !== CHATINFO_TYPE.PRIVATE) {
    return
  }
  mitter.emit(RTC_EVENTS.VOICE_CALL_START, {
    friendId: chatStore.activeChat.targetId,
  })
}
</script>
