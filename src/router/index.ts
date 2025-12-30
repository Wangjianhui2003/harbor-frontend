import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import RegisterPage from '../views/RegisterPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    name: 'Login',
    path: '/login',
    component: LoginPage,
  },
  {
    name: 'Register',
    path: '/register',
    component: RegisterPage,
  },
  {
    name: 'Home',
    path: '/home',
    component: HomePage,
    redirect: '/home/chat',
    children: [
      {
        name: 'Chat',
        path: 'chat',
        component: () => import('../views/ChatPage.vue'),
      },
      {
        name: 'ChatBot',
        path: 'chatbot',
        component: () => import('../views/ChatBotPage.vue'),
      },
      {
        name: 'Friend',
        path: 'friend',
        component: () => import('../views/FriendPage.vue'),
      },
      {
        name: 'Group',
        path: 'group',
        component: () => import('../views/GroupPage.vue'),
      },
      {
        name: 'Setting',
        path: 'setting',
        component: () => import('../views/SettingPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
