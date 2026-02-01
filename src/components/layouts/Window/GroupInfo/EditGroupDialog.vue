<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>修改群信息</DialogTitle>
      </DialogHeader>
      <div class="flex flex-col gap-4 py-2">
        <div>
          <label class="text-sm mb-2 block">群名称:</label>
          <Input
            v-model="groupName"
            placeholder="输入群名称"
            class="w-full"
            :disabled="submitting"
          />
        </div>
        <div>
          <label class="text-sm mb-2 block">群公告:</label>
          <Textarea
            v-model="notice"
            placeholder="输入群公告"
            class="w-full"
            :disabled="submitting"
            rows="4"
          />
        </div>
      </div>
      <DialogFooter>
        <div class="flex justify-end gap-2 w-full">
          <Button variant="outline" :disabled="submitting" @click="close">取消</Button>
          <Button :disabled="submitting || !groupName.trim()" @click="submit">
            {{ submitting ? '保存中...' : '保存' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { modifyGroup } from '@/api/group.ts'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message.ts'
import type { Group } from '@/types'

const props = defineProps<{
  visible: boolean
  group: Group | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'updated', group: Group): void
}>()

const toast = useToast()
const submitting = ref(false)
const groupName = ref('')
const notice = ref('')

watch(
  () => props.group,
  (group) => {
    if (group) {
      groupName.value = group.name || ''
      notice.value = group.notice || ''
    }
  },
  { immediate: true },
)

const onOpenChange = (open: boolean) => {
  emit('update:visible', open)
}

const close = () => {
  emit('update:visible', false)
}

const submit = async () => {
  if (!props.group) {
    showError(toast, '错误', '缺少群组信息')
    return
  }

  submitting.value = true
  try {
    await modifyGroup({
      id: props.group.id,
      name: groupName.value.trim(),
      notice: notice.value.trim() || undefined,
    })
    const updatedGroup: Group = {
      ...props.group,
      name: groupName.value.trim(),
      notice: notice.value.trim() || undefined,
    }
    emit('updated', updatedGroup)
    close()
    showSuccess(toast, '成功', '群信息已更新')
  } catch (err) {
    console.error(err)
    showError(toast, '错误', '更新群信息失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped></style>
