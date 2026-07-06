import { useDidShow } from '@tarojs/taro'
import { ensureLoggedIn } from '../utils/auth'

export function useAuthGuard() {
  useDidShow(() => {
    ensureLoggedIn()
  })
}
