<template>
  <div class="flex flex-row">
    <div class="basis-1/25 bg-primary-100 dark:bg-primary-700">
      <navi-bar />
    </div>
    <div class="basis-24/25 bg-primary-100 dark:bg-primary-800">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import useMainStore from '@/stores'
import useChatStore from '@/stores/chatStore'
import useFriendStore from '@/stores/friendStore'
import useUserStore from '@/stores/userStore'
import type { Friend, WebSocketMessage } from '@/types'
import type { ChatInfo, MessageInfo } from '@/types/chat'
import checkMessageType from '@/utils/check-msgtype'
import { ACCESS_TOKEN_KEY } from '@/utils/constant'
import { CHATINFO_TYPE, CMD_TYPE, MESSAGE_TYPE, WEBSOCKET_CLOSE_CODE } from '@/utils/enums'
import { showError, showWarn } from '@/utils/message'
import { createWebSocketClient } from '@/utils/websocket-utils'
import { useToast } from 'primevue/usetoast'
import { onMounted } from 'vue'

const toast = useToast()
const wsClient = createWebSocketClient()
const chatStore = useChatStore()
const userStore = useUserStore()
const friendStore = useFriendStore()
// const groupStore = useGroupStore()

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
      localStorage.getItem(ACCESS_TOKEN_KEY) || '',
    )
    wsClient.onMessage(handleWebSocketMessage)
  } catch (err) {
    showError(toast, '错误', '初始化失败')
    console.log('初始化失败', err)
  }
}

const initRTC = () => {}

const handleWebSocketMessage = (msg: WebSocketMessage) => {
  switch (msg.cmd) {
    case CMD_TYPE.FORCE_LOGOUT:
      wsClient.close(WEBSOCKET_CLOSE_CODE.FORCE_LOGOUT)
      showWarn(toast, '您已被强制下线', '您的账号在其他地方登录')
      location.href = '/login'

      break
    case CMD_TYPE.PRIVATE_MESSAGE:
      handlePrivateMessage(msg.data as MessageInfo)
      break
    case CMD_TYPE.GROUP_MESSAGE:
      handleGroupMessage(msg.data as MessageInfo)
      break
    case CMD_TYPE.SYSTEM_MESSAGE:
      handleSystemMessage(msg.data as MessageInfo)
      break
    default:
      console.log('未知消息', msg)
  }
}

//处理消息
const handlePrivateMessage = (msgInfo: MessageInfo) => {
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

  // 已读消息
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

const handleGroupMessage = (msgInfo: MessageInfo) => {
  // 标记这条消息是不是自己发的
  msgInfo.selfSend = msgInfo.sendId === userStore.userInfo.id
  const groupId = msgInfo.recvId

  //会话信息
  const chatInfo: ChatInfo = {
    type: CHATINFO_TYPE.GROUP,
    targetId: groupId,
  } as ChatInfo

  //加载消息
  if (msgInfo.type === MESSAGE_TYPE.LOADING) {
    console.log('群聊加载标志:', msgInfo.content)
    chatStore.setLoadingGroupMsgState(JSON.parse(msgInfo.content))
    return
  }

  // 已读消息
  if (msgInfo.type === MESSAGE_TYPE.READ) {
    chatStore.resetUnread(chatInfo)
    return
  }

  // 消息撤回
  if (msgInfo.type === MESSAGE_TYPE.RECALL) {
    chatStore.recallMsg(msgInfo, chatInfo)
    return
  }

  //需要会话显示的消息
  if (
    checkMessageType.isNormal(msgInfo.type) ||
    checkMessageType.isTip(msgInfo.type) ||
    checkMessageType.isAction(msgInfo.type)
  ) {
    chatStore.openChat(chatInfo)
    chatStore.insertMessage(msgInfo, chatInfo)
  }
}

const handleSystemMessage = (msgInfo: MessageInfo) => {
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
const insertPrivateMsg = (friend: Friend, msgInfo: MessageInfo) => {
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
  //TODO:私聊接收消息提示
}
</script>

<style scoped></style>
