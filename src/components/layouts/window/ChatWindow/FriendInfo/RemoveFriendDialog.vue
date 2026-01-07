<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>移除好友</DialogTitle>
      </DialogHeader>
      <div class="py-2 text-sm text-muted-foreground">
        确定要移除好友
        <span class="font-semibold text-foreground">
          {{ friendName || '该用户' }}
        </span>
        吗？操作完成后将无法再收到对方消息。
      </div>
      <DialogFooter>
        <div class="flex justify-end gap-2 w-full">
          <Button variant="outline" :disabled="submitting" @click="close">取消</Button>
          <Button variant="destructive" :disabled="submitting" @click="submit">
            {{ submitting ? '移除中...' : '确认移除' }}
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
import { removeFriend as removeFriendApi } from '@/api/friend'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message'
import useFriendStore from '@/stores/friendStore'

const friendStore = useFriendStore()
const props = defineProps<{
  visible: boolean
  friendId: number | null
  friendName?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'removed', friendId: number): void
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
  if (!props.friendId) {
    showError(toast, '错误', '缺少好友信息')
    return
  }

  submitting.value = true
  try {
    await removeFriendApi(props.friendId)
    emit('removed', props.friendId)
    friendStore.removeFriend(props.friendId as number)
    friendStore.loadFriend()
    close()
    showSuccess(toast, '成功', '已移除好友')
  } catch (err) {
    console.error(err)
    showError(toast, '错误', '移除好友失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped></style>
