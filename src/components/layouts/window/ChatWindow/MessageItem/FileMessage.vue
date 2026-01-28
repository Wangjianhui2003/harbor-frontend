<template>
  <div
    class="bg-primary/10 hover:bg-primary/20 flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-background/20 transition-colors min-w-52 max-w-72"
    @click="handleDownload"
  >
    <img :src="fileIcon" alt="file icon" class="size-10" />
    <div class="flex flex-col min-w-0 flex-1 gap-1">
      <span class="text-sm font-medium truncate" :title="fileInfo.name">
        {{ fileInfo.name }}
      </span>
      <span class="text-xs text-muted-background">{{ formatFileSize(fileInfo.size) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BaseMessage } from '@/types/chat'

// 导入所有文件图标
import aiIcon from '@/assets/fileicon/ai.svg'
import audioIcon from '@/assets/fileicon/audio.svg'
import csvIcon from '@/assets/fileicon/csv.svg'
import epsIcon from '@/assets/fileicon/eps.svg'
import excelIcon from '@/assets/fileicon/excel.svg'
import exeIcon from '@/assets/fileicon/exe.svg'
import htmlIcon from '@/assets/fileicon/html.svg'
import imageIcon from '@/assets/fileicon/image.svg'
import pdfIcon from '@/assets/fileicon/pdf.svg'
import pptIcon from '@/assets/fileicon/ppt.svg'
import psdIcon from '@/assets/fileicon/psd.svg'
import rtfIcon from '@/assets/fileicon/rtf.svg'
import txtIcon from '@/assets/fileicon/txt.svg'
import videoIcon from '@/assets/fileicon/video.svg'
import wordIcon from '@/assets/fileicon/word.svg'
import xmlIcon from '@/assets/fileicon/xml.svg'
import zipIcon from '@/assets/fileicon/zip.svg'
import defaultFileIcon from '@/assets/fileicon/unknown.svg'

const props = defineProps<{ message: BaseMessage }>()

interface FileContent {
  url: string
  name: string
  size: number
}

/**
 * 文件图标映射配置
 * 添加新文件类型只需在此处添加配置即可
 */
const FILE_ICON_MAP: Record<string, string> = {
  // Adobe 设计类
  ai: aiIcon,
  psd: psdIcon,
  eps: epsIcon,
  // 文档类
  doc: wordIcon,
  docx: wordIcon,
  rtf: rtfIcon,
  // 表格类
  xls: excelIcon,
  xlsx: excelIcon,
  csv: csvIcon,
  // 演示文稿类
  ppt: pptIcon,
  pptx: pptIcon,
  // 图片类
  jpg: imageIcon,
  jpeg: imageIcon,
  png: imageIcon,
  gif: imageIcon,
  webp: imageIcon,
  svg: imageIcon,
  bmp: imageIcon,
  ico: imageIcon,
  // 音频类
  mp3: audioIcon,
  wav: audioIcon,
  flac: audioIcon,
  aac: audioIcon,
  ogg: audioIcon,
  wma: audioIcon,
  // 视频类
  mp4: videoIcon,
  avi: videoIcon,
  mkv: videoIcon,
  mov: videoIcon,
  wmv: videoIcon,
  flv: videoIcon,
  webm: videoIcon,
  // 文本类
  txt: txtIcon,
  md: txtIcon,
  // 标记语言类
  html: htmlIcon,
  htm: htmlIcon,
  xml: xmlIcon,
  json: xmlIcon,
  // PDF
  pdf: pdfIcon,
  // 可执行文件
  exe: exeIcon,
  msi: exeIcon,
  dmg: exeIcon,
  app: exeIcon,
  // 压缩文件类
  zip: zipIcon,
  rar: zipIcon,
  '7z': zipIcon,
  tar: zipIcon,
  gz: zipIcon,
  bz2: zipIcon,
}

const fileInfo = JSON.parse(props.message.content) as FileContent

/**
 * 根据文件名获取扩展名
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return ''
  }
  return filename.slice(lastDotIndex + 1).toLowerCase()
}

/**
 * 获取文件对应的图标
 */
const fileIcon = computed(() => {
  const ext = getFileExtension(fileInfo.name)
  return FILE_ICON_MAP[ext] || defaultFileIcon
})

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i]
}

/**
 * 处理文件下载
 */
function handleDownload() {
  const link = document.createElement('a')
  link.href = fileInfo.url
  link.download = fileInfo.name
  link.target = '_blank'
  link.click()
}
</script>
