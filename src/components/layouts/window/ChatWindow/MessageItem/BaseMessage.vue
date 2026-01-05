<template>
  <div>
    <BaseAvatar />
    <div>

    </div>
    {{ props.message.content }}
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import type { BaseMessage } from '@/types/chat'

const props = defineProps<{
  message: BaseMessage
}>()
</script>

<style scoped></style>
