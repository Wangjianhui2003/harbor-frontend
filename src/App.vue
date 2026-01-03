<template>
  <Toast />
  <div>
    <router-view></router-view>
  </div>
  <Button @click="switchMode">Toggle Dark Mode</Button>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useColorMode } from '@vueuse/core'

const mode = useColorMode()
const switchMode = () => {
  mode.value = mode.value === 'light' ? 'dark' : 'light'
}
</script>

<style scoped></style>
