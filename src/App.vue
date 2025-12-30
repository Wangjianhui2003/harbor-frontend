<template>
  <NaviBar />
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import NaviBar from '@/components/layouts/Navigator/NaviBar.vue'
</script>

<style scoped></style>
