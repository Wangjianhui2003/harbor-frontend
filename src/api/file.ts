import http from './http/http'
import type { UploadImageResp } from '@/types/file'

//返回url
const uploadFile = async (
  formData: FormData,
  url: string,
  header: Record<string, string>,
): Promise<UploadImageResp> => {
  const res = await http({
    url,
    method: 'POST',
    data: formData,
    headers: header,
  })
  return res.data.data
}

export default uploadFile
