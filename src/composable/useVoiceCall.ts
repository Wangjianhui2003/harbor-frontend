/**
 * useVoiceCall - 语音通话核心逻辑 Composable
 *
 * 封装完整的单人语音通话流程：
 * - 发起通话 / 接收来电
 * - 接受 / 拒绝 / 取消 / 挂断
 * - WebRTC SDP/ICE 信令处理
 */
import { ref, computed, onUnmounted } from 'vue'
import type { Friend } from '@/types'
import { WEBRTC_MODE } from '@/utils/enums'
import WebRTC from '@/utils/webrtc'
import IMCamera from '@/utils/camera'
import * as rtcApi from '@/api/rtcPrivate'
import useWebRTCStore from '@/stores/webRTCStore'
import useFriendStore from '@/stores/friendStore'
import mitter from '@/event/mitt'
import { RTC_EVENTS } from '@/event/rtc_events'
import type { PrivateMessage } from '@/types/chat'

// 语音通话状态
export type VoiceCallState = 'IDLE' | 'CALLING' | 'INCOMING' | 'CONNECTING' | 'CHATTING'

export function useVoiceCall() {
  const webRTCStore = useWebRTCStore()
  const friendStore = useFriendStore()

  // 状态
  const callState = ref<VoiceCallState>('IDLE')
  const targetFriend = ref<Friend | null>(null)

  // WebRTC 和 Camera 实例
  let webRTC: WebRTC | null = null
  let camera: IMCamera | null = null

  // 远程音频流（用于外部访问）
  const remoteStream = ref<MediaStream | null>(null)

  // 缓存的 ICE candidates
  const cachedOutgoingCandidates: RTCIceCandidate[] = []
  const cachedIncomingCandidates: RTCIceCandidateInit[] = []

  // Computed
  const isInCall = computed(() => callState.value !== 'IDLE')
  const isCaller = computed(() => callState.value === 'CALLING')
  const isCallee = computed(() => callState.value === 'INCOMING')
  const isChatting = computed(() => callState.value === 'CHATTING')

  // 初始化 WebRTC
  function initWebRTC() {
    webRTC = new WebRTC()
    camera = new IMCamera()

    const config: RTCConfiguration = {
      iceServers: webRTCStore.webRTCConfig.iceServers || [],
    }
    webRTC.init(config)

    // 设置远程流回调
    webRTC.setupPeerConnection((stream) => {
      console.log('语音通话: 收到远程音频流')
      remoteStream.value = stream
    })

    // 设置 ICE candidate 回调
    webRTC.onIceCandidate(async (candidate) => {
      if (targetFriend.value) {
        if (isChatting.value) {
          try {
            await rtcApi.sendCandidate(targetFriend.value.id, JSON.stringify(candidate))
          } catch (err) {
            console.error('发送 ICE candidate 失败', err)
          }
        } else {
          cachedOutgoingCandidates.push(candidate)
        }
      }
    })

    webRTC.onICEStateChange((state) => {
      console.log('语音 ICE 连接状态:', state)
      if (state === 'failed' || state === 'disconnected') {
        handleCallFailed('ICE 连接失败')
      }
    })
  }

  async function sendCachedCandidates() {
    if (!targetFriend.value) return
    for (const candidate of cachedOutgoingCandidates) {
      try {
        await rtcApi.sendCandidate(targetFriend.value.id, JSON.stringify(candidate))
      } catch (err) {
        console.error('发送缓存 candidate 失败', err)
      }
    }
    cachedOutgoingCandidates.length = 0
  }

  function addCachedIncomingCandidates() {
    if (!webRTC) return
    for (const candidate of cachedIncomingCandidates) {
      webRTC.addICECandidate(candidate)
    }
    cachedIncomingCandidates.length = 0
  }

  // 打开麦克风
  async function openMicrophone(): Promise<MediaStream> {
    if (!camera) {
      camera = new IMCamera()
    }
    if (!camera.isEnable()) {
      throw new Error('麦克风不可用')
    }
    const stream = await camera.openAudio()
    return stream
  }

  // 关闭麦克风
  function closeMicrophone() {
    if (camera) {
      camera.close()
    }
  }

  // 清理资源
  function cleanup() {
    closeMicrophone()
    remoteStream.value = null
    if (webRTC) {
      webRTC.close()
      webRTC = null
    }
    targetFriend.value = null
    callState.value = 'IDLE'
    cachedOutgoingCandidates.length = 0
    cachedIncomingCandidates.length = 0
  }

  /**
   * 发起语音通话
   */
  async function startCall(friend: Friend) {
    if (callState.value !== 'IDLE') {
      console.warn('当前正在通话中')
      return
    }

    try {
      targetFriend.value = friend
      callState.value = 'CALLING'

      initWebRTC()

      const stream = await openMicrophone()
      webRTC!.setStream(stream)

      const offer = await webRTC!.createOffers()
      await rtcApi.call(friend.id, WEBRTC_MODE.VOICE, JSON.stringify(offer))

      console.log('已发起语音通话请求')
    } catch (err) {
      console.error('发起语音通话失败', err)
      cleanup()
      throw err
    }
  }

  /**
   * 处理收到的来电
   */
  function handleIncomingCall(msgInfo: PrivateMessage) {
    if (callState.value !== 'IDLE') {
      rtcApi.reject(msgInfo.sendId)
      return
    }

    const friend = friendStore.findFriend(msgInfo.sendId)
    if (!friend) {
      console.error('未找到好友信息')
      return
    }

    targetFriend.value = friend
    callState.value = 'INCOMING'
    initWebRTC()
  }

  /**
   * 接受来电（带 offer）
   */
  async function acceptCallWithOffer(offer: RTCSessionDescriptionInit) {
    if (callState.value !== 'INCOMING' || !targetFriend.value) {
      return
    }

    try {
      callState.value = 'CHATTING'

      const stream = await openMicrophone()
      webRTC!.setStream(stream)

      const answer = await webRTC!.createAnswers(offer)
      if (answer) {
        await rtcApi.accept(targetFriend.value.id, JSON.stringify(answer))
      }

      // 添加缓存的 incoming candidates 并发送 outgoing candidates
      addCachedIncomingCandidates()
      await sendCachedCandidates()

      console.log('已接受语音通话')
    } catch (err) {
      console.error('接受语音通话失败', err)
      cleanup()
      throw err
    }
  }

  /**
   * 处理对方接受通话
   */
  async function handleCallAccepted(msgInfo: PrivateMessage) {
    if (callState.value !== 'CALLING') {
      return
    }

    try {
      callState.value = 'CHATTING'

      const answer = JSON.parse(msgInfo.content) as RTCSessionDescriptionInit
      await webRTC!.setRemoteSDP(answer)

      addCachedIncomingCandidates()
      await sendCachedCandidates()

      console.log('语音通话连接建立中...')
    } catch (err) {
      console.error('处理接受信令失败', err)
      handleCallFailed('信令处理失败')
    }
  }

  async function rejectCall() {
    if (callState.value !== 'INCOMING' || !targetFriend.value) return
    try {
      await rtcApi.reject(targetFriend.value.id)
      cleanup()
    } catch (err) {
      cleanup()
    }
  }

  function handleCallRejected() {
    console.log('对方已拒绝语音通话')
    cleanup()
  }

  async function cancelCall() {
    if (callState.value !== 'CALLING' || !targetFriend.value) return
    try {
      await rtcApi.cancel(targetFriend.value.id)
      cleanup()
    } catch (err) {
      cleanup()
    }
  }

  function handleCallCancelled() {
    console.log('对方已取消语音呼叫')
    cleanup()
  }

  async function hangup() {
    if (!targetFriend.value) {
      cleanup()
      return
    }
    try {
      await rtcApi.hangup(targetFriend.value.id)
    } catch (err) {
      console.error('挂断失败', err)
    } finally {
      cleanup()
    }
  }

  function handleHangup() {
    console.log('对方已挂断语音通话')
    cleanup()
  }

  function handleCandidate(msgInfo: PrivateMessage) {
    if (!webRTC) return
    try {
      const candidate = JSON.parse(msgInfo.content) as RTCIceCandidateInit
      if (isChatting.value) {
        webRTC.addICECandidate(candidate)
      } else {
        cachedIncomingCandidates.push(candidate)
      }
    } catch (err) {
      console.error('处理 ICE candidate 失败', err)
    }
  }

  async function handleCallFailed(reason: string) {
    console.error('语音通话失败:', reason)
    if (targetFriend.value) {
      try {
        await rtcApi.failed(targetFriend.value.id, reason)
      } catch (err) {
        console.error('发送失败通知出错', err)
      }
    }
    cleanup()
  }

  // 注册事件监听
  function setupEventListeners() {
    mitter.on(RTC_EVENTS.VOICE_CALL_START, (data: unknown) => {
      const { friendId } = data as { friendId: number }
      const friend = friendStore.findFriend(friendId)
      if (friend) {
        startCall(friend)
      }
    })

    mitter.on(RTC_EVENTS.VOICE_CALL_INCOMING, (data: unknown) => {
      handleIncomingCall(data as PrivateMessage)
    })

    mitter.on(RTC_EVENTS.VOICE_CALL_ACCEPTED, (data: unknown) => {
      handleCallAccepted(data as PrivateMessage)
    })

    mitter.on(RTC_EVENTS.VOICE_CALL_REJECTED, () => {
      handleCallRejected()
    })

    mitter.on(RTC_EVENTS.VOICE_CALL_CANCELLED, () => {
      handleCallCancelled()
    })

    mitter.on(RTC_EVENTS.VOICE_CALL_HANGUP, () => {
      handleHangup()
    })

    mitter.on(RTC_EVENTS.VOICE_CALL_CANDIDATE, (data: unknown) => {
      handleCandidate(data as PrivateMessage)
    })
  }

  function removeEventListeners() {
    mitter.off(RTC_EVENTS.VOICE_CALL_START)
    mitter.off(RTC_EVENTS.VOICE_CALL_INCOMING)
    mitter.off(RTC_EVENTS.VOICE_CALL_ACCEPTED)
    mitter.off(RTC_EVENTS.VOICE_CALL_REJECTED)
    mitter.off(RTC_EVENTS.VOICE_CALL_CANCELLED)
    mitter.off(RTC_EVENTS.VOICE_CALL_HANGUP)
    mitter.off(RTC_EVENTS.VOICE_CALL_CANDIDATE)
  }

  onUnmounted(() => {
    removeEventListeners()
    cleanup()
  })

  return {
    callState,
    targetFriend,
    remoteStream,
    isInCall,
    isCaller,
    isCallee,
    isChatting,

    startCall,
    acceptCallWithOffer,
    rejectCall,
    cancelCall,
    hangup,
    cleanup,

    handleIncomingCall,
    handleCallAccepted,
    handleCallRejected,
    handleCallCancelled,
    handleHangup,
    handleCandidate,

    setupEventListeners,
    removeEventListeners,
  }
}
