<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogContent class="flex h-[42rem] max-h-[85vh] flex-col overflow-hidden sm:max-w-5xl">
      <DialogHeader>
        <DialogTitle>群聊</DialogTitle>
      </DialogHeader>

      <Tabs v-model="activeTab" class="flex min-h-0 flex-1 flex-col">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" class="mt-4 min-h-0 flex-1">
          <CreateGroupTab @created="handleCreated" />
        </TabsContent>
        <TabsContent value="search" class="mt-4 min-h-0 flex-1">
          <SearchGroupTab @switch-tab="handleSwitchTab" />
        </TabsContent>
        <TabsContent value="sent" class="mt-4 min-h-0 flex-1">
          <SentGroupRequestsTab ref="sentTabRef" />
        </TabsContent>
        <TabsContent value="group" class="mt-4 min-h-0 flex-1">
          <GroupRequestsTab ref="groupTabRef" />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CreateGroupTab from './CreateGroupTab.vue'
import SearchGroupTab from './SearchGroupTab.vue'
import SentGroupRequestsTab from './SentGroupRequestsTab.vue'
import GroupRequestsTab from './GroupRequestsTab.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const tabs = [
  { label: '创建群聊', value: 'create' },
  { label: '查找群组', value: 'search' },
  { label: '我发送的', value: 'sent' },
  { label: '群组请求', value: 'group' },
]
const activeTab = ref('create')
const sentTabRef = ref<InstanceType<typeof SentGroupRequestsTab> | null>(null)
const groupTabRef = ref<InstanceType<typeof GroupRequestsTab> | null>(null)

const onOpenChange = (open: boolean) => {
  emit('update:visible', open)
}

const handleSwitchTab = (tab: string) => {
  activeTab.value = tab
}

const handleCreated = () => {
  activeTab.value = 'create'
  emit('update:visible', false)
}

watch(activeTab, (newTab) => {
  if (newTab === 'sent') {
    sentTabRef.value?.loadSentRequests()
  } else if (newTab === 'group') {
    groupTabRef.value?.loadGroupRequests()
  }
})

// 监听对话框打开
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      return
    }

    if (activeTab.value === 'sent') {
      sentTabRef.value?.loadSentRequests()
    } else if (activeTab.value === 'group') {
      groupTabRef.value?.loadGroupRequests()
    }
  },
)
</script>

<style scoped></style>
