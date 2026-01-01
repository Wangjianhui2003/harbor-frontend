import http from './http/http'

const loadWebRTCConfig = async () => {
  const res = await http({
    url: '/webrtc/config',
    method: 'get',
  })
  return res.data.data
}

export { loadWebRTCConfig }
