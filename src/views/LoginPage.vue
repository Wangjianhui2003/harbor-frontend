<template>
  <div class="flex flex-row h-screen">
    <div class="basis-1/5 bg-primary-700 dark:bg-primary-900 h-full">01</div>
    <div class="basis-4/5 bg-primary-50 dark:bg-primary-200 h-full">
      <Button @click="darkMode">Toggle Dark Mode</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
function darkMode() {
  document.documentElement.classList.toggle('dark-mode')
}
</script>

<style scoped></style>
