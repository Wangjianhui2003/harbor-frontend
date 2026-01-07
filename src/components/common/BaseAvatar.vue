<template>
  <div>
    <img
      v-if="cachedSrc"
      :src="cachedSrc"
      class="w-9 h-9 rounded-full object-cover"
      :style="`width: ${props.size}rem; height: ${props.size}rem`"
    />
    <div
      v-else
      class="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center"
      :style="`width: ${props.size}rem; height: ${props.size}rem`"
    >
      {{ fallbackName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useCached } from '@/composable/useCached.ts'

interface props {
  headImage?: string
  name?: string
  size?: number
}

const props = withDefaults(defineProps<props>(), {
  headImage: '',
  name: 'NA',
  size: 2.25,
})

//必须toRef
const { cachedSrc } = useCached(
  toRef(() => props.headImage),
  { prefix: 'avatar' },
)

const fallbackName = computed(() => {
  const name = props.name?.trim() ?? ''

  const firstChar = name.charAt(0)
  const isEnglish = /^[A-Za-z]/.test(firstChar)

  return isEnglish ? name.slice(0, 2).toUpperCase() : firstChar
})
</script>

<style scoped></style>
