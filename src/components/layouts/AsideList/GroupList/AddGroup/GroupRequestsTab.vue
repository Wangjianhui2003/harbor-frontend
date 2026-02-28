<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <span class="text-sm text-muted-foreground">加群申请</span>
      <Button variant="outline" size="sm" @click="loadGroupRequests" :disabled="loadingGroup">
        <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loadingGroup }" />
        刷新
      </Button>
    </div>

    <ScrollArea class="flex-1 min-h-0">
      <div v-if="loadingGroup" class="text-center py-8 text-muted-foreground">加载中...</div>
      <div v-else-if="managedGroupIds.length === 0" class="text-center py-8 text-muted-foreground">
        您不是任何群组的群主或管理员
      </div>
      <div v-else-if="groupRequests.length === 0" class="text-center py-8 text-muted-foreground">
        暂无加群请求
      </div>
      <div v-else class="space-y-2">
        <div v-for="request in groupRequests" :key="request.id" class="p-3 rounded-lg border">
          <div class="flex items-center justify-between mb-2">
            <div class="flex-1 min-w-0">
              <div class="font-medium">用户ID: {{ request.requestUserId }}</div>
              <div class="text-sm text-muted-foreground">
                {{ request.requestNote || '无留言' }}
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                {{ formatTime(request.createdTime) }}
              </div>
            </div>
            <Badge :variant="getStatusVariant(request.status)">
              {{ getStatusText(request.status) }}
            </Badge>
          </div>
          <div v-if="request.status === 0" class="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              :disabled="isProcessing[request.id]"
              @click="handleDealRequest(request, 2)"
            >
              拒绝
            </Button>
            <Button
              size="sm"
              :disabled="isProcessing[request.id]"
              @click="handleDealRequest(request, 1)"
            >
              同意
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-vue-next'
import { getManagedGroupIds } from '@/api/group.ts'
import {
  findRequestsByGroupIds,
  dealAddGroupRequest,
  type AddGroupRequestRecord,
  type DealAddGroupReq,
} from '@/api/add_api.ts'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message.ts'

const toast = useToast()
const groupRequests = ref<AddGroupRequestRecord[]>([])
const loadingGroup = ref(false)
const managedGroupIds = ref<string[]>([])
const isProcessing = ref<Record<string, boolean>>({})

const loadGroupRequests = async () => {
  loadingGroup.value = true
  try {
    const groupIds = await getManagedGroupIds()
    managedGroupIds.value = groupIds

    if (groupIds.length === 0) {
      groupRequests.value = []
      return
    }

    const requests = await findRequestsByGroupIds(groupIds)
    groupRequests.value = requests
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '加载请求列表失败')
    groupRequests.value = []
    managedGroupIds.value = []
  } finally {
    loadingGroup.value = false
  }
}

const handleDealRequest = async (request: AddGroupRequestRecord, status: number) => {
  if (isProcessing.value[request.id]) return

  isProcessing.value[request.id] = true
  try {
    const dealReq: DealAddGroupReq = {
      id: request.id,
      groupId: request.groupId,
      requestUserId: request.requestUserId,
      dealUserId: '',
      status,
      comment: status === 1 ? '已同意' : '已拒绝',
    }
    await dealAddGroupRequest(dealReq)
    showSuccess(toast, '成功', status === 1 ? '已同意群组请求' : '已拒绝群组请求')
    await loadGroupRequests()
  } catch (err: unknown) {
    console.error(err)
    const error = err as { response?: { data?: { message?: string } } }
    showError(toast, '错误', error.response?.data?.message || '处理请求失败')
  } finally {
    isProcessing.value[request.id] = false
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '待处理'
    case 1:
      return '已同意'
    case 2:
      return '已拒绝'
    default:
      return '未知'
  }
}

const getStatusVariant = (status: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 0:
      return 'secondary'
    case 1:
      return 'default'
    case 2:
      return 'destructive'
    default:
      return 'outline'
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

defineExpose({ loadGroupRequests })
</script>
