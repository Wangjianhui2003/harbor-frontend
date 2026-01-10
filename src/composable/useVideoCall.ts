/**
 * useVideoCall - 视频通话核心逻辑 Composable
 *
 * 封装完整的单人视频通话流程：
 * - 发起通话 / 接收来电
 * - 接受 / 拒绝 / 取消 / 挂断
 * - WebRTC SDP/ICE 信令处理
 */
import { ref, computed, onUnmounted } from 'vue'
import type { Friend } from '@/types'
import { WEBRTC_MODE } from '@/utils/enums'
import type { WebRTCModeType } from '@/utils/enums'
import WebRTC from '@/utils/webrtc'
import IMCamera from '@/utils/camera'
import * as rtcApi from '@/api/rtcPrivate'
import useWebRTCStore from '@/stores/webRTCStore'
import useFriendStore from '@/stores/friendStore'
import mitter from '@/event/mitt'
import { RTC_EVENTS } from '@/event/rtc_events'
import type { PrivateMessage } from '@/types/chat'

// 视频通话状态
export type VideoCallState = 'IDLE' | 'CALLING' | 'INCOMING' | 'CONNECTING' | 'CHATTING'

export function useVideoCall() {
  const webRTCStore = useWebRTCStore()
  const friendStore = useFriendStore()

  // 状态
  const callState = ref<VideoCallState>('IDLE')
  const targetFriend = ref<Friend | null>(null)
  const localStream = ref<MediaStream | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const mode = ref<WebRTCModeType>(WEBRTC_MODE.VIDEO)

  // WebRTC 和 Camera 实例
  let webRTC: WebRTC | null = null
  let camera: IMCamera | null = null

  // 缓存的 ICE candidates (发送前缓存)
  const cachedOutgoingCandidates: RTCIceCandidate[] = []
  // 缓存的 ICE candidates (接收前缓存)
  const cachedIncomingCandidates: RTCIceCandidateInit[] = []

  // Computed
  const isInCall = computed(() => callState.value !== 'IDLE')
  const isCaller = computed(() => callState.value === 'CALLING')
  const isCallee = computed(() => callState.value === 'INCOMING')
  const isChatting = computed(() => callState.value === 'CHATTING')
  const isConnecting = computed(() => callState.value === 'CONNECTING')

  // 初始化 WebRTC
  function initWebRTC() {
    webRTC = new WebRTC()
    camera = new IMCamera()

    // 初始化配置
    const config: RTCConfiguration = {
      iceServers: webRTCStore.webRTCConfig.iceServers || [],
    }
    webRTC.init(config)

    // 设置远程流回调
    webRTC.setupPeerConnection((stream) => {
      console.log('收到远程视频流')
      remoteStream.value = stream
    })

    // 设置 ICE candidate 回调
    webRTC.onIceCandidate(async (candidate) => {
      if (targetFriend.value) {
        // 只有在 CHATTING 状态才直接发送，否则缓存
        if (isChatting.value) {
          try {
            await rtcApi.sendCandidate(targetFriend.value.id, JSON.stringify(candidate))
          } catch (err) {
            console.error('发送 ICE candidate 失败', err)
          }
        } else {
          console.log('缓存 outgoing candidate')
          cachedOutgoingCandidates.push(candidate)
        }
      }
    })

    // 设置 ICE 连接状态变化回调
    webRTC.onICEStateChange((state) => {
      console.log('ICE 连接状态:', state)
      if (state === 'connected') {
        console.log('ICE 连接成功')
      } else if (state === 'failed' || state === 'disconnected') {
        handleCallFailed('ICE 连接失败')
      }
    })
  }

  // 发送缓存的 outgoing candidates
  async function sendCachedCandidates() {
    if (!targetFriend.value) return
    console.log('发送缓存的 candidates:', cachedOutgoingCandidates.length)
    for (const candidate of cachedOutgoingCandidates) {
      try {
        await rtcApi.sendCandidate(targetFriend.value.id, JSON.stringify(candidate))
      } catch (err) {
        console.error('发送缓存 candidate 失败', err)
      }
    }
    cachedOutgoingCandidates.length = 0
  }

  // 添加缓存的 incoming candidates
  function addCachedIncomingCandidates() {
    if (!webRTC) return
    console.log('添加缓存的 incoming candidates:', cachedIncomingCandidates.length)
    for (const candidate of cachedIncomingCandidates) {
      webRTC.addICECandidate(candidate)
    }
    cachedIncomingCandidates.length = 0
  }

  // 打开摄像头
  async function openCamera(): Promise<MediaStream> {
    if (!camera) {
      camera = new IMCamera()
    }

    if (!camera.isEnable()) {
      throw new Error('摄像头不可用')
    }

    const stream = await camera.openVideo()
    localStream.value = stream
    return stream
  }

  // 关闭摄像头
  function closeCamera() {
    if (camera) {
      camera.close()
    }
    localStream.value = null
  }

  // 清理资源
  function cleanup() {
    closeCamera()
    if (webRTC) {
      webRTC.close()
      webRTC = null
    }
    remoteStream.value = null
    targetFriend.value = null
    callState.value = 'IDLE'
    cachedOutgoingCandidates.length = 0
    cachedIncomingCandidates.length = 0
  }

  /**
   * 发起视频通话
   */
  async function startCall(friend: Friend) {
    if (callState.value !== 'IDLE') {
      console.warn('当前正在通话中')
      return
    }

    try {
      targetFriend.value = friend
      callState.value = 'CALLING'

      // 初始化 WebRTC
      initWebRTC()

      // 打开摄像头
      const stream = await openCamera()
      webRTC!.setStream(stream)

      // 创建 offer
      const offer = await webRTC!.createOffers()

      // 发送呼叫请求
      await rtcApi.call(friend.id, WEBRTC_MODE.VIDEO, JSON.stringify(offer))

      console.log('已发起视频通话请求')
    } catch (err) {
      console.error('发起通话失败', err)
      cleanup()
      throw err
    }
  }

  /**
   * 处理收到的来电
   */
  function handleIncomingCall(msgInfo: PrivateMessage) {
    if (callState.value !== 'IDLE') {
      // 已在通话中，自动拒绝
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

    // 初始化 WebRTC（接收方也需要）
    initWebRTC()
  }

  /**
   * 接受来电
   */
  async function acceptCall() {
    if (callState.value !== 'INCOMING' || !targetFriend.value) {
      return
    }

    try {
      callState.value = 'CONNECTING'

      // 打开摄像头
      const stream = await openCamera()
      webRTC!.setStream(stream)

      console.log('已接受视频通话')
    } catch (err) {
      console.error('接受通话失败', err)
      cleanup()
      throw err
    }
  }

  /**
   * 接受来电（带 offer）
   */
  async function acceptCallWithOffer(offer: RTCSessionDescriptionInit) {
    if (callState.value !== 'INCOMING' || !targetFriend.value) {
      return
    }

    try {
      // 进入 CHATTING 状态
      callState.value = 'CHATTING'

      // 打开摄像头
      const stream = await openCamera()
      webRTC!.setStream(stream)

      // 创建 answer
      const answer = await webRTC!.createAnswers(offer)
      if (answer) {
        await rtcApi.accept(targetFriend.value.id, JSON.stringify(answer))
      }

      console.log('已接受视频通话，answer已发送')
    } catch (err) {
      console.error('接受通话失败', err)
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
      // 进入 CHATTING 状态
      callState.value = 'CHATTING'

      // 解析 answer
      const answer = JSON.parse(msgInfo.content) as RTCSessionDescriptionInit
      await webRTC!.setRemoteSDP(answer)

      console.log('对方已接受，设置远程 SDP 成功')

      // 添加缓存的 incoming candidates
      addCachedIncomingCandidates()

      // 发送缓存的 outgoing candidates
      await sendCachedCandidates()

      console.log('正在建立连接...')
    } catch (err) {
      console.error('处理接受信令失败', err)
      handleCallFailed('信令处理失败')
    }
  }

  /**
   * 拒绝来电
   */
  async function rejectCall() {
    if (callState.value !== 'INCOMING' || !targetFriend.value) {
      return
    }

    try {
      await rtcApi.reject(targetFriend.value.id)
      cleanup()
    } catch (err) {
      console.error('拒绝通话失败', err)
      cleanup()
    }
  }

  /**
   * 处理对方拒绝
   */
  function handleCallRejected() {
    console.log('对方已拒绝通话')
    cleanup()
  }

  /**
   * 取消呼叫（发起方）
   */
  async function cancelCall() {
    if (callState.value !== 'CALLING' || !targetFriend.value) {
      return
    }

    try {
      await rtcApi.cancel(targetFriend.value.id)
      cleanup()
    } catch (err) {
      console.error('取消呼叫失败', err)
      cleanup()
    }
  }

  /**
   * 处理对方取消
   */
  function handleCallCancelled() {
    console.log('对方已取消呼叫')
    cleanup()
  }

  /**
   * 挂断通话
   */
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

  /**
   * 处理对方挂断
   */
  function handleHangup() {
    console.log('对方已挂断')
    cleanup()
  }

  /**
   * 处理 ICE candidate
   */
  function handleCandidate(msgInfo: PrivateMessage) {
    if (!webRTC) {
      return
    }

    try {
      const candidate = JSON.parse(msgInfo.content) as RTCIceCandidateInit
      // 只有在 CHATTING 状态才添加，否则缓存
      if (isChatting.value) {
        webRTC.addICECandidate(candidate)
      } else {
        console.log('缓存 incoming candidate')
        cachedIncomingCandidates.push(candidate)
      }
    } catch (err) {
      console.error('处理 ICE candidate 失败', err)
    }
  }

  /**
   * 通话失败处理
   */
  async function handleCallFailed(reason: string) {
    console.error('通话失败:', reason)

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
    mitter.on(RTC_EVENTS.VIDEO_CALL_START, (data: unknown) => {
      const { friendId } = data as { friendId: number }
      const friend = friendStore.findFriend(friendId)
      if (friend) {
        startCall(friend)
      }
    })

    mitter.on(RTC_EVENTS.VIDEO_CALL_INCOMING, (data: unknown) => {
      handleIncomingCall(data as PrivateMessage)
    })

    mitter.on(RTC_EVENTS.VIDEO_CALL_ACCEPTED, (data: unknown) => {
      handleCallAccepted(data as PrivateMessage)
    })

    mitter.on(RTC_EVENTS.VIDEO_CALL_REJECTED, () => {
      handleCallRejected()
    })

    mitter.on(RTC_EVENTS.VIDEO_CALL_CANCELLED, () => {
      handleCallCancelled()
    })

    mitter.on(RTC_EVENTS.VIDEO_CALL_HANGUP, () => {
      handleHangup()
    })

    mitter.on(RTC_EVENTS.VIDEO_CALL_CANDIDATE, (data: unknown) => {
      handleCandidate(data as PrivateMessage)
    })
  }

  // 移除事件监听
  function removeEventListeners() {
    mitter.off(RTC_EVENTS.VIDEO_CALL_START)
    mitter.off(RTC_EVENTS.VIDEO_CALL_INCOMING)
    mitter.off(RTC_EVENTS.VIDEO_CALL_ACCEPTED)
    mitter.off(RTC_EVENTS.VIDEO_CALL_REJECTED)
    mitter.off(RTC_EVENTS.VIDEO_CALL_CANCELLED)
    mitter.off(RTC_EVENTS.VIDEO_CALL_HANGUP)
    mitter.off(RTC_EVENTS.VIDEO_CALL_CANDIDATE)
  }

  // 组件卸载时清理
  onUnmounted(() => {
    removeEventListeners()
    cleanup()
  })

  return {
    // 状态
    callState,
    targetFriend,
    localStream,
    remoteStream,
    mode,

    // Computed
    isInCall,
    isCaller,
    isCallee,
    isChatting,
    isConnecting,

    // 方法
    startCall,
    acceptCall,
    acceptCallWithOffer,
    rejectCall,
    cancelCall,
    hangup,
    cleanup,

    // 事件处理（供外部调用）
    handleIncomingCall,
    handleCallAccepted,
    handleCallRejected,
    handleCallCancelled,
    handleHangup,
    handleCandidate,

    // 事件注册
    setupEventListeners,
    removeEventListeners,
  }
}
