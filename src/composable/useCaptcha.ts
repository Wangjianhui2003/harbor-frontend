import { ref } from 'vue'
import type { ToastServiceMethods } from 'primevue/toastservice'
import { getCaptcha } from '@/api/user'
import type { CaptchaResp } from '@/types'
import { showError } from '@/utils/message'

//复用验证码逻辑
export function useCaptcha(toast?: ToastServiceMethods) {
  const captchaPic = ref<string>('')
  const captchaKey = ref<string>('')
  const loading = ref(false)

  const loadCaptcha = async () => {
    loading.value = true
    try {
      const res: CaptchaResp = await getCaptcha()
      captchaPic.value = res.captchaPic
      captchaKey.value = res.captchaKey
    } catch (error) {
      if (toast) {
        showError(toast, '错误', '验证码加载失败')
      }
      console.info('验证码加载失败', error)
    } finally {
      loading.value = false
    }
  }

  return { captchaPic, captchaKey, loading, loadCaptcha }
}
