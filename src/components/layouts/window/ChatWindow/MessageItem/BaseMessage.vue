<template>
  <div :class="['flex w-full', props.message.selfSend && 'flex-row-reverse']">
    <BaseAvatar :headImage="props.headImage" :name="props.name" class="px-3" />
    <Item
      :class="[
        'p-2 bg-primary/10 ',
        props.message.selfSend && 'bg-primary/90 text-primary-foreground',
        'max-w-1/2',
      ]"
    >
      <component
        :is="messageMap[props.message.type] || TextMessage"
        :message="props.message"
      ></component>
    </Item>
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import type { BaseMessage } from '@/types/chat'
import { MESSAGE_TYPE } from '@/utils/enums'
import type { Component } from 'vue'
import TextMessage from './TextMessage.vue'
import Item from '@/components/ui/item/Item.vue'

const props = defineProps<{
  message: BaseMessage
  headImage: string
  name: string
}>()

const messageMap: Record<number, Component> = {
  [MESSAGE_TYPE.TEXT]: TextMessage,
}
</script>

<style scoped></style>
