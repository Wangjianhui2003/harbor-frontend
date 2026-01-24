<template>
  <LoaderCircle :size="size" class="animate-spin" v-if="status === MESSAGE_STATUS.SENDING" />
  <Check :size="size" v-else-if="status === MESSAGE_STATUS.UNSENT" />
  <MailCheck :size="size" v-else-if="status === MESSAGE_STATUS.SENT" />
  <MessageCircleReply :size="size" v-else-if="status === MESSAGE_STATUS.RECALL" />
  <CircleX
    :size="size"
    class="cursor-pointer text-destructive hover:text-destructive/80"
    v-else-if="status === MESSAGE_STATUS.ERROR"
    @click="$emit('resend')"
    title="点击重发"
  />
  <CheckCheck :size="size" v-else />
</template>

<script setup lang="ts">
import { MESSAGE_STATUS } from '@/utils/enums'
import {
  LoaderCircle,
  MessageCircleReply,
  Check,
  MailCheck,
  CircleX,
  CheckCheck,
} from 'lucide-vue-next'

defineProps<{
  status: number
  size?: number
}>()

defineEmits<{
  resend: []
}>()
</script>
