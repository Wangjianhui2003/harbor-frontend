<template>
  <div class="flex flex-row">
    <div class="basis-1/25">
      <navi-bar />
    </div>
    <div class="basis-24/25">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pullOfflineGroupMessage } from '@/api/group-msg'
import { pullOfflinePrivateMessage } from '@/api/private-msg'
import useMainStore from '@/stores'
import useChatStore from '@/stores/chatStore'
import useFriendStore from '@/stores/friendStore'
import useGroupStore from '@/stores/groupStore'
import useUserStore from '@/stores/userStore'
import type { Friend, Group, WebSocketMessage } from '@/types'
import type { ChatInfo, BaseMessage, GroupMessage, PrivateMessage } from '@/types/chat'
import checkMessageType from '@/utils/check-msgtype'
import { ACCESS_TOKEN_KEY } from '@/utils/constant'
import { CHATINFO_TYPE, CMD_TYPE, MESSAGE_TYPE, WEBSOCKET_CLOSE_CODE } from '@/utils/enums'
import { showError, showWarn } from '@/utils/message'
import { createWebSocketClient } from '@/utils/websocket-utils'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

const toast = useToast()
const wsClient = createWebSocketClient()
const chatStore = useChatStore()
const userStore = useUserStore()
const friendStore = useFriendStore()
const groupStore = useGroupStore()

const isWebSocketReconnecting = ref<boolean>(false)

onMounted(() => {
  //初始化
  initRTC()
  init()
})

const init = async () => {
  try {
    await useMainStore().loadAll()
    wsClient.connect(
      import.meta.env.VITE_WEBSOCKET_URL,
      sessionStorage.getItem(ACCESS_TOKEN_KEY) || '',
    )
    wsClient.onWebSocketLogin(handleWebSocketLogin)
    wsClient.onClose(handleWebSocketClose)
    wsClient.onMessage(handleWebSocketMessage)
  } catch (err) {
    showError(toast, '错误', '初始化失败')
    console.log('初始化失败', err)
  }
}

const initRTC = () => {}

const handleWebSocketLogin = async () => {
  try {
    if (isWebSocketReconnecting.value) {
      //第一次登录
      console.log('开始拉取离线消息')
      //重连成功
      isWebSocketReconnecting.value = false
      const promises = []
      promises.push(friendStore.loadFriend())
      promises.push(groupStore.loadGroups())
      await Promise.all(promises)
    }
    pullPrivateOfflineMsg()
    pullGroupOfflineMsg()
  } catch (err) {
    console.log('WebSocket登录处理出错', err)
    location.href = '/'
  }
}

const pullPrivateOfflineMsg = async () => {
  //设置加载标识符
  chatStore.setLoadingPrivateMsgState(true)
  console.log('max private messageId:', chatStore.privateMsgMaxId)
  try {
    //从后端拉取离线消息
    await pullOfflinePrivateMessage(chatStore.privateMsgMaxId)
  } catch (err) {
    chatStore.setLoadingPrivateMsgState(false)
    console.log('拉取私聊离线消息出错', err)
  }
}

const pullGroupOfflineMsg = async () => {
  chatStore.setLoadingGroupMsgState(true)
  console.log('max group messageId:', chatStore.groupMsgMaxId)
  try {
    //从后端拉取离线消息
    await pullOfflineGroupMessage(chatStore.groupMsgMaxId)
  } catch (err) {
    chatStore.setLoadingGroupMsgState(false)
    console.log('拉取群聊离线消息出错', err)
  }
}

const handleWebSocketClose = async () => {
  try {
    console.log('WebSocket连接关闭')
    isWebSocketReconnecting.value = true
    await userStore.loadUser()
    showError(toast, '连接已断开', '正在尝试重新连接...')
    wsClient.connect(
      import.meta.env.VITE_WEBSOCKET_URL,
      sessionStorage.getItem(ACCESS_TOKEN_KEY) || '',
    )
  } catch (err) {
    console.log('WebSocket重连处理出错', err)
    exitWeb()
  }
}

const exitWeb = () => {
  wsClient.close(WEBSOCKET_CLOSE_CODE.FORCE_LOGOUT)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  location.href = '/'
}

const handleWebSocketMessage = (msg: WebSocketMessage) => {
  switch (msg.cmd) {
    case CMD_TYPE.FORCE_LOGOUT:
      wsClient.close(WEBSOCKET_CLOSE_CODE.FORCE_LOGOUT)
      showWarn(toast, '您已被强制下线', '您的账号在其他地方登录')
      location.href = '/login'
      break
    case CMD_TYPE.PRIVATE_MESSAGE:
      handlePrivateMessage(msg.data as PrivateMessage)
      break
    case CMD_TYPE.GROUP_MESSAGE:
      handleGroupMessage(msg.data as GroupMessage)
      break
    case CMD_TYPE.SYSTEM_MESSAGE:
      handleSystemMessage(msg.data as BaseMessage)
      break
    default:
      console.log('未知消息', msg)
  }
}

//处理消息
const handlePrivateMessage = (msgInfo: PrivateMessage) => {
  // 标记这条消息是不是自己发的
  msgInfo.selfSend = msgInfo.sendId === userStore.userInfo.id
  const friendId = msgInfo.selfSend ? msgInfo.recvId : msgInfo.sendId

  //会话信息
  const chatInfo = {
    type: CHATINFO_TYPE.PRIVATE,
    targetId: friendId,
  } as ChatInfo

  //加载消息
  if (msgInfo.type === MESSAGE_TYPE.LOADING) {
    console.log('私聊加载标志:', msgInfo.content)
    chatStore.setLoadingPrivateMsgState(JSON.parse(msgInfo.content))
    return
  }

  // 收到已读信号
  if (msgInfo.type === MESSAGE_TYPE.READ) {
    chatStore.resetUnread(chatInfo)
    return
  }

  // 消息回执处理,改消息状态为已读
  if (msgInfo.type === MESSAGE_TYPE.RECEIPT) {
    chatStore.markReadMessage(friendId, null)
    return
  }

  // 消息撤回
  if (msgInfo.type === MESSAGE_TYPE.RECALL) {
    chatStore.recallMsg(msgInfo, chatInfo)
    return
  }

  // 新增好友
  if (msgInfo.type === MESSAGE_TYPE.FRIEND_NEW) {
    friendStore.addFriend(JSON.parse(msgInfo.content))
    return
  }

  // (被)删除好友
  if (msgInfo.type === MESSAGE_TYPE.FRIEND_DEL) {
    friendStore.removeFriend(friendId)
    return
  }

  // //单人RTC信令
  // if (checkMsgType.isRtcPrivate(msgInfo.type)) {
  //   rtcPrivateVideo.value.onRTCPrivateMsg(msgInfo)
  //   return
  // }

  //需要会话显示的消息
  if (
    checkMessageType.isNormal(msgInfo.type) ||
    checkMessageType.isTip(msgInfo.type) ||
    checkMessageType.isAction(msgInfo.type)
  ) {
    const friend = loadFriendInfo(friendId)
    insertPrivateMsg(friend, msgInfo)
  }
}

//TODO:处理群聊消息
const handleGroupMessage = (msgInfo: GroupMessage) => {
  //表示是否是自己发的(其他终端或其他功能)
  msgInfo.selfSend = msgInfo.sendId === userStore.userInfo.id
  const chatInfo = {
    type: CHATINFO_TYPE.GROUP,
    targetId: msgInfo.groupId,
  } as ChatInfo
  //更改加载标记
  if (msgInfo.type === MESSAGE_TYPE.LOADING) {
    chatStore.setLoadingGroupMsgState(JSON.parse(msgInfo.content))
    return
  }
  //收到已读信号
  if (msgInfo.type === MESSAGE_TYPE.READ) {
    chatStore.resetUnread(chatInfo)
    return
  }
  //回执消息
  if (msgInfo.type === MESSAGE_TYPE.RECEIPT) {
    // 更新消息已读人数
    const newMsgInfo = {
      id: msgInfo.id,
      groupId: msgInfo.groupId,
      readCount: msgInfo.readCount,
      receiptOk: msgInfo.receiptOk,
    } as GroupMessage
    chatStore.updateMessage(newMsgInfo, chatInfo)
    return
  }
  //撤回消息信号
  if (msgInfo.type === MESSAGE_TYPE.RECALL) {
    chatStore.recallMsg(msgInfo, chatInfo)
    return
  }
  //新增群聊
  if (msgInfo.type === MESSAGE_TYPE.GROUP_NEW) {
    groupStore.addGroup(JSON.parse(msgInfo.content))
    return
  }
  // 删除群
  if (msgInfo.type === MESSAGE_TYPE.GROUP_DEL) {
    groupStore.removeGroup(msgInfo.groupId)
    return
  }
  //插入群聊消息
  if (
    checkMessageType.isNormal(msgInfo.type) ||
    checkMessageType.isTip(msgInfo.type) ||
    checkMessageType.isAction(msgInfo.type)
  ) {
    const group: Group = loadGroupInfo(msgInfo.groupId)
    insertGroupMsg(group, msgInfo)
  }
  // TODO:群视频
}

const handleSystemMessage = (msgInfo: BaseMessage) => {
  //TODO:系统消息处理
  console.log('系统消息:', msgInfo)
}

//加载好友信息(好友给你发消息)
const loadFriendInfo = (friendId: number): Friend => {
  const friend = friendStore.findFriend(friendId)
  if (!friend) {
    return {
      id: friendId,
      friendNickname: '未知用户',
      headImage: '',
      online: false,
      onlineWeb: false,
      onlineApp: false,
      deleted: false,
    }
  }
  return friend
}

//插入私聊消息(有人发消息)
const insertPrivateMsg = (friend: Friend, msgInfo: PrivateMessage) => {
  const chatInfo: ChatInfo = {
    type: CHATINFO_TYPE.PRIVATE,
    targetId: friend.id,
    showName: friend.friendNickname,
    headImage: friend.headImage,
  }
  //打开会话
  chatStore.openChat(chatInfo)
  //插入信息
  chatStore.insertMessage(msgInfo, chatInfo)
}

const loadGroupInfo = (groupId: number): Group => {
  const group = groupStore.findGroup(groupId)
  if (!group) {
    return {
      id: groupId,
      showGroupName: '未知群聊',
      headImageThumb: '',
    } as Group
  }
  return group
}

const insertGroupMsg = (group: Group, msgInfo: GroupMessage) => {
  const chatInfo: ChatInfo = {
    type: CHATINFO_TYPE.GROUP,
    targetId: group.id,
    showName: group.showGroupName || '未知',
    headImage: group.headImageThumb,
  }
  //打开会话
  chatStore.openChat(chatInfo)
  //插入信息
  chatStore.insertMessage(msgInfo, chatInfo)
}
</script>

<style scoped></style>
