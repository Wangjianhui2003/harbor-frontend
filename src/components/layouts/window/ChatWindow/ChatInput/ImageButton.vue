<template>
  <HoverTip content="发送图片">
    <InputGroupButton @click="handleSendImage" variant="ghost" class="hover:bg-primary/10 size-7">
      <Image class="size-5" />
    </InputGroupButton>
  </HoverTip>
</template>

<script setup lang="ts">
import { Image } from 'lucide-vue-next'
import { InputGroupButton } from '@/components/ui/input-group'
import HoverTip from '@/components/common/HoverTip.vue'
import { useSendMessage } from '@/composable/useSendMessage'
import { scrollToBottom } from '@/utils/dom'
import uploadFile from '@/api/file'

const { sendImageMessage } = useSendMessage()

/** 发送图片 */
function handleSendImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadFile(formData, '/image/upload', {})
      const content = JSON.stringify({
        originUrl: result.originUrl,
        thumbUrl: result.thumbUrl,
      })
      await sendImageMessage(content)
      scrollToBottom()
    } catch (error) {
      console.error('图片上传失败', error)
    }
  }
  input.click()
}
</script>
