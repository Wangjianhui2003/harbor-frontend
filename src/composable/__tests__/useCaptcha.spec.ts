import type { ToastServiceMethods } from 'primevue/toastservice'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCaptchaMock, showErrorMock } = vi.hoisted(() => ({
  getCaptchaMock: vi.fn(),
  showErrorMock: vi.fn(),
}))

vi.mock('@/api/user', () => ({
  getCaptcha: getCaptchaMock,
}))

vi.mock('@/utils/message', () => ({
  showError: showErrorMock,
}))

import { useCaptcha } from '@/composable/useCaptcha'

describe('useCaptcha', () => {
  beforeEach(() => {
    getCaptchaMock.mockReset()
    showErrorMock.mockReset()
  })

  it('loads the captcha image and key while tracking loading state', async () => {
    getCaptchaMock.mockResolvedValue({
      captchaPic: 'data:image/png;base64,test',
      captchaKey: 'captcha-key',
    })

    const { captchaPic, captchaKey, loading, loadCaptcha } = useCaptcha()

    const pending = loadCaptcha()
    expect(loading.value).toBe(true)

    await pending

    expect(getCaptchaMock).toHaveBeenCalledOnce()
    expect(captchaPic.value).toBe('data:image/png;base64,test')
    expect(captchaKey.value).toBe('captcha-key')
    expect(loading.value).toBe(false)
    expect(showErrorMock).not.toHaveBeenCalled()
  })

  it('shows a toast error when loading fails and a toast service was provided', async () => {
    const toast = { add: vi.fn() } as unknown as ToastServiceMethods
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    getCaptchaMock.mockRejectedValue(new Error('network error'))

    const { captchaPic, captchaKey, loading, loadCaptcha } = useCaptcha(toast)
    await loadCaptcha()

    expect(showErrorMock).toHaveBeenCalledWith(toast, '错误', '验证码加载失败')
    expect(captchaPic.value).toBe('')
    expect(captchaKey.value).toBe('')
    expect(loading.value).toBe(false)
    expect(consoleInfoSpy).toHaveBeenCalled()
  })

  it('fails quietly when no toast service is provided', async () => {
    const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    getCaptchaMock.mockRejectedValue(new Error('network error'))

    const { loadCaptcha } = useCaptcha()
    await loadCaptcha()

    expect(showErrorMock).not.toHaveBeenCalled()
    expect(consoleInfoSpy).toHaveBeenCalled()
  })
})
