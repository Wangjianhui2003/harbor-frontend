import { ref } from 'vue'
import { RTC_STATE, WEBRTC_MODE } from '@/utils/enums'
import { getSelfInfo } from '@/api/user'
import type { Friend, User } from '@/types/index'
import { showError } from '@/utils/message'
import { defineStore } from 'pinia'
import type { RTCStateType, WebRTCModeType } from '@/utils/enums'

// 用户信息（组合式写法）
const useUserStore = defineStore('userStore', () => {
  const userInfo = ref<User>({} as User)
  const rtcInfo = ref<{
    friend: Friend | Record<string, never> //空对象{}
    mode: WebRTCModeType
    state: RTCStateType
  }>({
    friend: {} as Friend,
    mode: WEBRTC_MODE.VIDEO,
    state: RTC_STATE.FREE,
  })

  const loadUser = async (): Promise<void> => {
    try {
      const info = await getSelfInfo()
      setUserInfo(info)
    } catch (error) {
      showError('异常', '加载用户信息失败')
      console.error('加载用户信息失败', error)
      throw error
    }
  }

  const setUserInfo = (info: User): void => {
    userInfo.value = info
  }

  const clear = (): void => {
    userInfo.value = {} as User
    rtcInfo.value = {
      friend: {},
      mode: WEBRTC_MODE.VIDEO,
      state: RTC_STATE.FREE,
    }
  }

  return { userInfo, rtcInfo, loadUser, setUserInfo, clear }
})

export default useUserStore
