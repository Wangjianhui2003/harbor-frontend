<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogContent class="h-180 flex flex-col">
      <DialogHeader>
        <DialogTitle>添加好友</DialogTitle>
      </DialogHeader>

      <div class="flex flex-col flex-1 min-h-0">
        <!-- 标签切换 -->
        <div class="flex border-b mb-4">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <!-- 查找用户 -->
        <SearchFriendTab v-if="activeTab === 'search'" @switch-tab="handleSwitchTab" />
        <!-- 我发送的请求 -->
        <SentFriendRequestsTab v-if="activeTab === 'sent'" ref="sentTabRef" />
        <!-- 我接收的请求 -->
        <ReceivedFriendRequestsTab v-if="activeTab === 'received'" ref="receivedTabRef" />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import SearchFriendTab from './SearchFriendTab.vue'
import SentFriendRequestsTab from './SentFriendRequestsTab.vue'
import ReceivedFriendRequestsTab from './ReceivedFriendRequestsTab.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const tabs = [
  { label: '查找用户', value: 'search' },
  { label: '已发送', value: 'sent' },
  { label: '好友请求', value: 'received' },
]
const activeTab = ref('search')
const sentTabRef = ref<InstanceType<typeof SentFriendRequestsTab> | null>(null)
const receivedTabRef = ref<InstanceType<typeof ReceivedFriendRequestsTab> | null>(null)

const onOpenChange = (open: boolean) => {
  emit('update:visible', open)
}

const handleSwitchTab = (tab: string) => {
  activeTab.value = tab
}

// 监听标签页切换，自动加载数据
watch(activeTab, (newTab) => {
  if (newTab === 'sent') {
    sentTabRef.value?.loadSentRequests()
  } else if (newTab === 'received') {
    receivedTabRef.value?.loadReceivedRequests()
  }
})

// 监听对话框打开，加载接收的请求
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && activeTab.value === 'received') {
      receivedTabRef.value?.loadReceivedRequests()
    }
  },
)
</script>

<style scoped></style>
