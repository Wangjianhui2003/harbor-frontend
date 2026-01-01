import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadWebRTCConfig } from '@/api/webrtc'
import type { WebRTCConfig } from '@/types/index'
/**
 * 和webRTC相关的状态
 */

const useWebRTCStore = defineStore('WebRTCStore', () => {
  /**
   * maxChannel
   * iceServers
   */
  const webRTCConfig = ref<WebRTCConfig>({})

  //设置配置
  const setConfig = (config: WebRTCConfig): void => {
    webRTCConfig.value = config
  }

  const clear = (): void => {
    webRTCConfig.value = {}
  }

  //加载webrtc配置
  const loadConfig = async (): Promise<void> => {
    try {
      const config = await loadWebRTCConfig()
      console.log(config)
      setConfig(config)
      console.log('加载webrtc配置成功')
    } catch (err) {
      console.log('加载WebRTC配置出错', err)
    }
  }

  return { webRTCConfig, clear, setConfig, loadConfig }
})

export default useWebRTCStore
