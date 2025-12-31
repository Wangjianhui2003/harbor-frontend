<template>
  <div>
    <Button label="Toggle Dark Mode" @click="toggleDarkMode()" />
  </div>
</template>

<script setup lang="ts">
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark-mode')
}
</script>

<style scoped></style>
