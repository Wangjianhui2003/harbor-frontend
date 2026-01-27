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
    meta: { requiresAuth: false },
  },
  {
    name: 'Register',
    path: '/register',
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
  {
    name: 'Home',
    path: '/home',
    component: HomePage,
    redirect: '/home/chat',
    meta: { requiresAuth: true },
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

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = sessionStorage.getItem('accessToken')
  const isAuthenticated = !!token

  // 需要登录但未登录 -> 跳转登录页
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
    return
  }

  // 已登录但访问登录/注册页 -> 跳转首页
  if (isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
