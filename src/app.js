import { useLaunch } from '@tarojs/taro'
import './app.scss'

export default function App({ children }) {
  useLaunch(() => {
    console.log('App launched.')
  })

  return children
}
