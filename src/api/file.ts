import http from './http/http'

/**
 * 通用文件上传函数
 * @template T 响应数据类型
 */
const uploadFile = async <T>(
  formData: FormData,
  url: string,
  header: Record<string, string> = {},
): Promise<T> => {
  const res = await http({
    url,
    method: 'POST',
    data: formData,
    headers: header,
  })
  return res.data.data
}

export default uploadFile
