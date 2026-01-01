<template>
  <Toast />
  <div>
    <RouterView />
  </div>
  <Button @click="darkMode">Toggle Dark Mode</Button>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

function darkMode() {
  document.documentElement.classList.toggle('dark-mode')
} 
</script>

<style scoped></style>
