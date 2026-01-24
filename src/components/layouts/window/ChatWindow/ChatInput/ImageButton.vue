<template>
  <HoverTip content="发送图片/视频">
    <InputGroupButton @click="handleSendMedia" variant="ghost" class="hover:bg-primary/10 size-7">
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
import type { UploadImageResp, UploadVideoResp } from '@/types/file'
import type { VideoContent } from '@/types/file'

const { sendImageMessage, sendVideoMessage } = useSendMessage()

/** 判断是否为视频文件 */
function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

/** 判断是否为图片文件 */
function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/** 发送图片或视频 */
function handleSendMedia() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,video/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      if (isVideoFile(file)) {
        // 视频文件上传
        const result = await uploadFile<UploadVideoResp>(formData, '/video/upload')
        const videoContent: VideoContent = {
          url: result.url,
          duration: result.duration,
          name: file.name,
          size: file.size,
        }
        const content = JSON.stringify(videoContent)
        await sendVideoMessage(content)
      } else if (isImageFile(file)) {
        // 图片文件上传
        const result = await uploadFile<UploadImageResp>(formData, '/image/upload')
        const content = JSON.stringify({
          originUrl: result.originUrl,
          thumbUrl: result.thumbUrl,
        })
        await sendImageMessage(content)
      }
      scrollToBottom()
    } catch (error) {
      console.error('媒体上传失败', error)
    }
  }
  input.click()
}
</script>
