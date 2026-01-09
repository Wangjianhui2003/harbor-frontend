<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: string
  placeholder?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: '',
})

function handleKeydown(event: KeyboardEvent) {
  emits('keydown', event)
}
</script>

<template>
  <Textarea
    v-model="modelValue"
    :placeholder="props.placeholder"
    data-slot="input-group-control"
    :class="
      cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
        props.class,
      )
    "
    @keydown="handleKeydown"
  />
</template>
