<template>
  <div>
    <img v-if="cachedSrc" :src="cachedSrc" class="w-9 h-9 rounded-full object-cover" />
    <div
      v-else
      class="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center"
    >
      {{ fallbackName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCached } from '@/composables/useCached'

const props = defineProps({
  headImage: {
    type: String,
  },
  name: {
    type: String,
  },
})

const headImage = computed(() => props.headImage ?? '')
const { cachedSrc } = useCached(headImage, { prefix: 'avatar' })

const fallbackName = computed(() => {
  const name = props.name?.trim() ?? ''
  if (name.length === 0) {
    return 'O'
  }

  const firstChar = name.charAt(0)
  const isEnglish = /^[A-Za-z]/.test(firstChar)

  return isEnglish ? name.slice(0, 2).toUpperCase() : firstChar
})
</script>

<style scoped></style>
