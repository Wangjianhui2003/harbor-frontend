<template>
  <Toast />
  <div class="font-sans">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useColorMode } from '@vueuse/core'

// 全局初始化主题模式，所有页面应用主题
useColorMode({
  storageKey: 'harbor-color-mode',
  initialValue: 'auto',
})
</script>

<style scoped></style>
