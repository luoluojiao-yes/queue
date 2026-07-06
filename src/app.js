import { useLaunch } from '@tarojs/taro'
import { ensureLoggedIn } from './utils/auth'
import './app.scss'

export default function App({ children }) {
  useLaunch(() => {
    ensureLoggedIn()
  })

  return children
}
