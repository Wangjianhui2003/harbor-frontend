<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <div class="flex gap-2 mb-4">
      <Input v-model="searchGroupId" placeholder="输入群组ID" @keyup.enter="handleSearch" />
      <Button @click="handleSearch" :disabled="searching">
        <Search class="w-4 h-4 mr-2" />
        搜索
      </Button>
    </div>

    <ScrollArea class="flex-1 min-h-0">
      <div v-if="searching" class="text-center py-8 text-muted-foreground">搜索中...</div>
      <div v-else-if="searchedGroup && !searching" class="space-y-2">
        <div class="p-3 rounded-lg border">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0"
            >
              <img
                v-if="searchedGroup.headImageThumb || searchedGroup.headImage"
                :src="searchedGroup.headImageThumb || searchedGroup.headImage"
                :alt="searchedGroup.name"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-sm font-medium">{{ searchedGroup.name?.[0] || 'G' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ searchedGroup.name }}</div>
              <div class="text-sm text-muted-foreground">群ID: {{ searchedGroup.id }}</div>
              <div v-if="searchedGroup.notice" class="text-sm text-muted-foreground mt-1">
                {{ searchedGroup.notice }}
              </div>
            </div>
            <Button
              size="sm"
              :disabled="isSendingRequest || searchedGroup?.joinType === 2"
              @click="handleSendRequest(searchedGroup)"
            >
              {{
                searchedGroup?.joinType === 2
                  ? '禁止加入'
                  : isSendingRequest
                    ? '发送中...'
                    : '发送请求'
              }}
            </Button>
          </div>
        </div>
      </div>
      <div
        v-else-if="searchGroupId && !searchedGroup && !searching"
        class="text-center py-8 text-muted-foreground"
      >
        未找到群组
      </div>
      <div v-else-if="!searchGroupId" class="text-center py-8 text-muted-foreground">
        请输入群组ID进行搜索
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-vue-next'
import { searchGroup, type GroupResult } from '@/api/group.ts'
import { addGroupRequest } from '@/api/add_api.ts'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message.ts'

const emit = defineEmits<{
  (e: 'switch-tab', tab: string): void
}>()

const toast = useToast()
const searchGroupId = ref('')
const searchedGroup = ref<GroupResult | null>(null)
const searching = ref(false)
const isSendingRequest = ref(false)

// 搜索群组
const handleSearch = async () => {
  if (!searchGroupId.value) {
    showError(toast, '提示', '请输入群组ID')
    return
  }

  const groupId = searchGroupId.value.trim()
  if (!/^\d+$/.test(groupId)) {
    showError(toast, '提示', '请输入有效的群组ID')
    return
  }

  searching.value = true
  searchedGroup.value = null
  try {
    const group = await searchGroup(groupId)
    searchedGroup.value = group
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '搜索群组失败')
    searchedGroup.value = null
  } finally {
    searching.value = false
  }
}

// 发送群组请求
const handleSendRequest = async (group: GroupResult) => {
  if (isSendingRequest.value) return

  isSendingRequest.value = true
  try {
    await addGroupRequest({
      groupId: group.id,
      requestUserId: '',
      requestNote: '',
    })
    showSuccess(toast, '成功', '群组请求已发送')
    emit('switch-tab', 'sent')
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '发送请求失败')
  } finally {
    isSendingRequest.value = false
  }
}
</script>
