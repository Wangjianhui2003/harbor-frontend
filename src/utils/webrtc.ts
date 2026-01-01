/**
 * webRTC实现类
 */

class WebRTC {
  private configuration: RTCConfiguration
  private stream: MediaStream | null
  private peerConnection: RTCPeerConnection | null

  constructor() {
    this.configuration = {}
    this.stream = null
    this.peerConnection = null
  }

  //是否支持webrtc接口
  isEnable(): boolean {
    return !!window.RTCPeerConnection
  }

  //初始化PeerConnection配置
  init(configuration: RTCConfiguration): void {
    this.configuration = configuration
  }

  //设置PeerConnection ontrack事件的回调
  setupPeerConnection(callback: (stream: MediaStream) => void): void {
    this.peerConnection = new RTCPeerConnection(this.configuration)
    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      callback(event.streams[0]!)
    }
  }

  //设置（重置）流和track
  setStream(stream: MediaStream | null): void {
    // 原来有流，移除
    if (this.stream && this.peerConnection) {
      console.log('移除stream')
      const senders = this.peerConnection.getSenders()
      senders.forEach((sender) => {
        this.peerConnection?.removeTrack(sender)
      })
    }
    console.log('stream:', stream)
    if (stream && this.peerConnection) {
      stream.getTracks().forEach((track) => {
        console.log('添加track')
        this.peerConnection?.addTrack(track, stream)
      })
    }
    this.stream = stream
  }

  //添加监听器
  //并设置 当Ice获取到候选地址后的 回调函数 对candidate进行操作
  onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    if (!this.peerConnection) return
    //监听器
    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        callback(event.candidate)
      }
    }
  }

  //添加监听器
  //并设置 当ICE连接发生变化事的 回调函数 传入state
  onICEStateChange(callback: (state: RTCIceConnectionState) => void): void {
    if (!this.peerConnection) return
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState
      console.log('ICE连接发生变化:' + state)
      if (state) {
        callback(state)
      }
    }
  }

  //创建本地sdp信息
  createOffers(): Promise<RTCSessionDescriptionInit> {
    return new Promise((resolve, reject) => {
      if (!this.peerConnection) {
        reject(new Error('PeerConnection not initialized'))
        return
      }
      //offer参数
      const offerParam: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      }
      // 创建本地sdp信息
      this.peerConnection
        .createOffer(offerParam)
        .then((offer) => {
          //设置
          console.log('offer:', offer)
          this.peerConnection?.setLocalDescription(offer)
          resolve(offer)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * 接收offer
   * @param offer 发起方发来的offer
   */
  async createAnswers(
    offer: RTCSessionDescriptionInit,
  ): Promise<RTCSessionDescriptionInit | undefined> {
    console.log('收到offer，生成answer,offer:offer', offer)
    //设置远端sdp
    await this.setRemoteSDP(offer)
    console.log('remote sdp', this.peerConnection?.remoteDescription)
    //创建本地sdp
    const offerParam: RTCOfferOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    }
    try {
      const answer = await this.peerConnection?.createAnswer(offerParam)
      if (answer) {
        this.peerConnection?.setLocalDescription(answer)
      }
      return answer
    } catch (err) {
      console.error(err)
    }
  }

  //设置远程SDP信息
  setRemoteSDP(sdpObject: RTCSessionDescriptionInit): Promise<void> | undefined {
    return this.peerConnection?.setRemoteDescription(sdpObject)
  }

  //添加candidate信息
  addICECandidate(candidate: RTCIceCandidateInit): void {
    this.peerConnection
      ?.addIceCandidate(new RTCIceCandidate(candidate))
      .catch((err) => console.log(err))
  }

  //关闭RTC连接
  close(): void {
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection.onicecandidate = null
      this.peerConnection.oniceconnectionstatechange = null
      this.peerConnection.ontrack = null
      this.peerConnection = null
    }
  }
}

export default WebRTC
