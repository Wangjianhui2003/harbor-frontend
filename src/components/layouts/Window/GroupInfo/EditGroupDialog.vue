<template>
  <Dialog :open="visible" @update:open="onOpenChange">
    <DialogScrollContent class="overflow-hidden p-0 sm:max-w-2xl">
      <DialogHeader class="border-b bg-muted/30 px-6 py-5">
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>

      <ScrollArea class="max-h-[75vh]">
        <div class="space-y-4 px-6 py-5">
          <div v-if="canManageBasicInfo" class="flex items-center gap-4 rounded-2xl border bg-muted/20 p-4">
            <div class="relative">
              <button
                type="button"
                class="group relative cursor-pointer overflow-hidden rounded-full"
                :disabled="submitting"
                @click="triggerAvatarUpload"
              >
                <BaseAvatar :headImage="form.headImage" :name="previewGroupName" :size="6" />
                <div
                  class="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Camera class="size-5 text-white" />
                </div>
              </button>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarChange"
              />
            </div>

            <h4 class="text-lg font-semibold">{{ previewGroupName }}</h4>
          </div>

          <div class="text-base font-semibold">我的显示信息</div>

          <div class="space-y-2">
            <label class="text-sm font-medium">群内昵称</label>
            <Input v-model="form.remarkNickname" maxlength="20" :disabled="submitting" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">群备注名</label>
            <Input v-model="form.remarkGroupName" maxlength="20" :disabled="submitting" />
          </div>

          <div v-if="canManageBasicInfo" class="pt-2 text-base font-semibold">群资料</div>

          <div v-if="canManageBasicInfo" class="space-y-2">
            <label class="text-sm font-medium">群名称</label>
            <Input
              v-model="form.name"
              maxlength="20"
              placeholder="输入群名称"
              :disabled="submitting"
            />
          </div>

          <div v-if="canManageBasicInfo" class="space-y-2">
            <label class="text-sm font-medium">加入方式</label>
            <RadioGroup
              v-model="form.joinType"
              class="grid gap-2 md:grid-cols-3"
              :disabled="submitting"
            >
              <label
                v-for="option in joinTypeOptions"
                :key="option.value"
                class="flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors"
                :class="
                  form.joinType === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                "
              >
                <RadioGroupItem :value="option.value" class="mt-0.5" />
                <div class="text-sm font-medium">{{ option.label }}</div>
              </label>
            </RadioGroup>
          </div>

          <div v-if="canManageBasicInfo" class="space-y-2">
            <label class="text-sm font-medium">群公告</label>
            <Textarea
              v-model="form.notice"
              rows="6"
              maxlength="1024"
              class="resize-none"
              :disabled="submitting"
            />
          </div>
        </div>
      </ScrollArea>

      <DialogFooter class="border-t px-6 py-4">
        <div class="flex w-full justify-end gap-2">
          <Button variant="outline" :disabled="submitting" @click="close">取消</Button>
          <Button :disabled="submitting || !canSubmit" @click="submit">
            <Loader2 v-if="submitting" class="mr-2 size-4 animate-spin" />
            {{ submitting ? '保存中...' : '保存修改' }}
          </Button>
        </div>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>

<script setup lang="ts">
import uploadFile from '@/api/file'
import { modifyGroup, type ModifyGroupData } from '@/api/group'
import BaseAvatar from '@/components/common/BaseAvatar.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import type { Group } from '@/types'
import { showError, showSuccess } from '@/utils/message'
import { Camera, Loader2 } from 'lucide-vue-next'
import { useToast } from 'primevue/usetoast'
import { computed, reactive, ref, watch } from 'vue'

interface EditableGroupForm {
  name: string
  notice: string
  joinType: string
  remarkNickname: string
  remarkGroupName: string
  headImage: string
  headImageThumb: string
}

const props = defineProps<{
  visible: boolean
  group: Group | null
  canManageBasicInfo: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'updated', group: Group): void
}>()

const joinTypeOptions = [
  {
    value: '0',
    label: '允许直接加入',
  },
  {
    value: '1',
    label: '需要管理员同意',
  },
  {
    value: '2',
    label: '禁止主动加入',
  },
] as const

const toast = useToast()
const submitting = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarFile = ref<File | null>(null)
const initialSnapshot = ref('')

const form = reactive<EditableGroupForm>({
  name: '',
  notice: '',
  joinType: '1',
  remarkNickname: '',
  remarkGroupName: '',
  headImage: '',
  headImageThumb: '',
})

const canManageBasicInfo = computed(() => props.canManageBasicInfo)
const dialogTitle = computed(() => (canManageBasicInfo.value ? '修改群信息' : '修改显示信息'))

const previewGroupName = computed(() => {
  const groupRemark = form.remarkGroupName.trim()
  const groupName = form.name.trim()

  if (groupRemark) return groupRemark
  if (groupName) return groupName
  return props.group?.showGroupName || props.group?.name || '群聊'
})

const createSnapshot = () =>
  JSON.stringify({
    name: form.name.trim(),
    notice: form.notice.trim(),
    joinType: form.joinType,
    remarkNickname: form.remarkNickname.trim(),
    remarkGroupName: form.remarkGroupName.trim(),
    headImage: form.headImage,
    headImageThumb: form.headImageThumb,
  })

const hasChanges = computed(() => {
  if (!props.group) return false
  return avatarFile.value !== null || createSnapshot() !== initialSnapshot.value
})

const canSubmit = computed(() => {
  if (!hasChanges.value) return false
  if (canManageBasicInfo.value) {
    return form.name.trim().length > 0
  }
  return true
})

const syncForm = (group: Group) => {
  form.name = group.name || ''
  form.notice = group.notice || ''
  form.joinType = String(group.joinType ?? 1)
  form.remarkNickname = group.remarkNickname || ''
  form.remarkGroupName = group.remarkGroupName || ''
  form.headImage = group.headImage || group.headImageThumb || ''
  form.headImageThumb = group.headImageThumb || group.headImage || ''
  avatarFile.value = null
  initialSnapshot.value = createSnapshot()
}

watch(
  () => [props.group, props.visible] as const,
  ([group, visible]) => {
    if (group && visible) {
      syncForm(group)
    }
  },
  { immediate: true },
)

const onOpenChange = (open: boolean) => {
  if (open && props.group) {
    syncForm(props.group)
  }
  emit('update:visible', open)
}

const close = () => {
  emit('update:visible', false)
}

const triggerAvatarUpload = () => {
  if (!canManageBasicInfo.value || submitting.value) return
  avatarInput.value?.click()
}

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = (loadEvent) => {
    form.headImage = String(loadEvent.target?.result || '')
  }
  reader.readAsDataURL(file)
  input.value = ''
}

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }
  return fallback
}

const submit = async () => {
  if (!props.group) {
    showError(toast, '错误', '缺少群组信息')
    return
  }

  const trimmedName = form.name.trim()
  if (canManageBasicInfo.value && !trimmedName) {
    showError(toast, '错误', '群名称不能为空')
    return
  }

  submitting.value = true
  try {
    if (avatarFile.value && canManageBasicInfo.value) {
      const formData = new FormData()
      formData.append('file', avatarFile.value)
      const uploadResp = await uploadFile<{ originUrl: string; thumbUrl: string }>(
        formData,
        '/image/upload',
      )
      form.headImage = uploadResp.originUrl
      form.headImageThumb = uploadResp.thumbUrl
      avatarFile.value = null
    }

    const payload: ModifyGroupData = {
      id: props.group.id,
      name: trimmedName || props.group.name,
      remarkNickname: form.remarkNickname.trim() || undefined,
      remarkGroupName: form.remarkGroupName.trim() || undefined,
    }

    if (canManageBasicInfo.value) {
      payload.name = trimmedName
      payload.notice = form.notice.trim() || undefined
      payload.joinType = Number(form.joinType)
      payload.headImage = form.headImage || undefined
      payload.headImageThumb = form.headImageThumb || undefined
    }

    const updatedGroup = await modifyGroup(payload)
    const mergedGroup: Group = {
      ...props.group,
      ...updatedGroup,
      name: updatedGroup.name || trimmedName || props.group.name,
      notice:
        updatedGroup.notice !== undefined ? updatedGroup.notice : form.notice.trim() || undefined,
      joinType: updatedGroup.joinType !== undefined ? updatedGroup.joinType : Number(form.joinType),
      headImage: updatedGroup.headImage || form.headImage || props.group.headImage,
      headImageThumb:
        updatedGroup.headImageThumb || form.headImageThumb || props.group.headImageThumb,
      remarkNickname:
        updatedGroup.remarkNickname !== undefined
          ? updatedGroup.remarkNickname
          : form.remarkNickname.trim() || undefined,
      remarkGroupName:
        updatedGroup.remarkGroupName !== undefined
          ? updatedGroup.remarkGroupName
          : form.remarkGroupName.trim() || undefined,
      showNickname:
        updatedGroup.showNickname || form.remarkNickname.trim() || props.group.showNickname,
      showGroupName:
        updatedGroup.showGroupName ||
        form.remarkGroupName.trim() ||
        updatedGroup.name ||
        trimmedName ||
        props.group.name,
    }

    emit('updated', mergedGroup)
    syncForm(mergedGroup)
    close()
    showSuccess(toast, '成功', '群信息已更新')
  } catch (error) {
    console.error(error)
    showError(toast, '错误', resolveErrorMessage(error, '更新群信息失败'))
  } finally {
    submitting.value = false
  }
}
</script>
