<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>解散群聊</DialogTitle>
      </DialogHeader>
      <div class="py-2 text-sm text-muted-foreground">
        确定要解散群聊
        <span class="font-semibold text-foreground">
          {{ groupName || '该群组' }}
        </span>
        吗？此操作不可恢复，所有成员将被移出群聊。
      </div>
      <DialogFooter>
        <div class="flex justify-end gap-2 w-full">
          <Button variant="outline" :disabled="submitting" @click="close">取消</Button>
          <Button variant="destructive" :disabled="submitting" @click="submit">
            {{ submitting ? '解散中...' : '确认解散' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteGroup } from '@/api/group.ts'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message.ts'
import useGroupStore from '@/stores/groupStore.ts'

const groupStore = useGroupStore()
const props = defineProps<{
  visible: boolean
  groupId: number | null
  groupName?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'dissolved', groupId: number): void
}>()

const toast = useToast()
const submitting = ref(false)

const onOpenChange = (open: boolean) => {
  emit('update:visible', open)
}

const close = () => {
  emit('update:visible', false)
}

const submit = async () => {
  if (!props.groupId) {
    showError(toast, '错误', '缺少群组信息')
    return
  }

  submitting.value = true
  try {
    await deleteGroup(props.groupId)
    emit('dissolved', props.groupId)
    groupStore.loadGroups()
    close()
    showSuccess(toast, '成功', '群聊已解散')
  } catch (err) {
    console.error(err)
    showError(toast, '错误', '解散群聊失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped></style>
