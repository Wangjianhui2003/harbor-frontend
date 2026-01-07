<template>
    <Dialog :open="visible" @update:open="onOpenChange">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>修改好友备注</DialogTitle>
            </DialogHeader>
            <div class="flex flex-col gap-4 py-2">
                <label class="text-sm">好友备注:</label>
                <Input v-model="nickname" placeholder="输入备注名" class="w-full" :disabled="submitting" />
            </div>
            <DialogFooter>
                <div class="flex justify-end gap-2 w-full">
                    <Button variant="outline" :disabled="submitting" @click="close">取消</Button>
                    <Button :disabled="submitting || !nickname.trim()" @click="submit">
                        {{ submitting ? '保存中...' : '保存' }}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateFriendNickName } from '@/api/friend'
import { useToast } from 'primevue/usetoast'
import { showError, showSuccess } from '@/utils/message'
import type { Friend } from '@/types'

const props = defineProps<{
    visible: boolean
    friendId: number | null
    currentNickname?: string
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'updated', value: string): void
}>()

const toast = useToast()
const submitting = ref(false)
const nickname = ref('')

watch(
    () => props.currentNickname,
    (value) => {
        nickname.value = value ?? ''
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
    if (!props.friendId) {
        showError(toast, '错误', '缺少好友信息')
        return
    }

    submitting.value = true
    try {
        const payload = {
            id: props.friendId,
            friendNickname: nickname.value.trim(),
        } as Friend
        await updateFriendNickName(payload)
        emit('updated', payload.friendNickname ?? '')
        close()
        showSuccess(toast, '成功', '好友备注已更新')
    } catch (err) {
        console.error(err)
        showError(toast, '错误', '更新备注失败')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped></style>
