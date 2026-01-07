import { useRouter } from 'vue-router'
import useUserStore from '@/stores/userStore'

export function useAuth() {
  const router = useRouter()
  const userStore = useUserStore()

  const logout = () => {
    userStore.clear()
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    router.push('/login')
  }

  return {
    logout,
  }
}
