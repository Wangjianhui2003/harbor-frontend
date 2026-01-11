<template>
  <HoverTip content="发送文件">
    <InputGroupButton @click="handleSendFile" variant="ghost" class="hover:bg-primary/10 size-7">
      <FilePlus class="size-5" />
    </InputGroupButton>
  </HoverTip>
</template>

<script setup lang="ts">
import { FilePlus } from 'lucide-vue-next'
import { InputGroupButton } from '@/components/ui/input-group'
import HoverTip from '@/components/common/HoverTip.vue'
import { useSendMessage } from '@/composable/useSendMessage'
import { scrollToBottom } from '@/utils/dom'
import uploadFile from '@/api/file'
import type { UploadFileResp } from '@/types/file'

const { sendFileMessage } = useSendMessage()

/** 发送文件 */
function handleSendFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadFile<UploadFileResp>(formData, '/file/upload', {})
      const content = JSON.stringify({
        url: result,
        name: file.name,
        size: file.size,
      })
      await sendFileMessage(content)
      scrollToBottom()
    } catch (error) {
      console.error('文件上传失败', error)
    }
  }
  input.click()
}
</script>
