<template>
  <HoverTip content="视频通话">
    <InputGroupButton
      @click="handleSendVideoCall"
      variant="ghost"
      class="hover:bg-primary/10 size-7"
    >
      <Video class="size-5" />
    </InputGroupButton>
  </HoverTip>
</template>

<script setup lang="ts">
import { Video } from 'lucide-vue-next'
import { InputGroupButton } from '@/components/ui/input-group'
import HoverTip from '@/components/common/HoverTip.vue'
import useChatStore from '@/stores/chatStore'
import { CHATINFO_TYPE } from '@/utils/enums'
import mitter from '@/event/mitt'
import { RTC_EVENTS } from '@/event/rtc_events'

const chatStore = useChatStore()

/** 发送视频通话 */
function handleSendVideoCall() {
  // 仅私聊支持视频通话，群聊点击无反应
  if (chatStore.activeChat?.type !== CHATINFO_TYPE.PRIVATE) {
    return
  }
  mitter.emit(RTC_EVENTS.VIDEO_CALL_START, {
    friendId: chatStore.activeChat.targetId,
  })
}
</script>
