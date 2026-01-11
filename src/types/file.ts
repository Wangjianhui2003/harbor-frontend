export interface UploadImageResp {
  originUrl: string
  thumbUrl: string
}

export interface UploadVideoResp {
  url: string
  coverUrl: string
  duration: number
}

export interface UploadFileResp {
  url: string
  name: string
  size: number
}

export type fileUrl = string
