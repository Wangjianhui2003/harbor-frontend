<template>
  <div>
    <img
      v-if="props.headImage != ''"
      :src="props.headImage"
      class="w-9 h-9 rounded-full object-cover"
    />
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

const props = defineProps({
  headImage: {
    type: String,
  },
  name: {
    type: String,
  },
})

const fallbackName = computed(() => {
  const name = props.name?.trim() ?? ''
  if (name.length === 0) {
    return 'DFS'
  }

  const firstChar = name.charAt(0)
  const isEnglish = /^[A-Za-z]/.test(firstChar)

  return isEnglish ? name.slice(0, 2).toUpperCase() : firstChar
})
</script>

<style scoped></style>
