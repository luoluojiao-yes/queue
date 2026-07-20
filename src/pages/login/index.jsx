import { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { login, fetchUserInfo } from '../../services/user'
import { isLoggedIn, setAuth, clearAuth } from '../../utils/auth'
import './index.scss'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  useDidShow(() => {
    if (isLoggedIn()) {
      Taro.switchTab({ url: '/pages/index/index' })
    }
  })

  const handleLogin = async () => {
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    if (!trimmedUsername) {
      Taro.showToast({ title: '请输入账号', icon: 'none' })
      return
    }
    if (!trimmedPassword) {
      Taro.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const data = await login(trimmedUsername, trimmedPassword)
      const { userId, token, roleType, expireAt } = data

      if (!token) {
        throw new Error('登录响应缺少 token')
      }
      if (userId == null) {
        throw new Error('登录响应缺少 userId')
      }

      setAuth({ userId, token, roleType, expireAt })

      try {
        await fetchUserInfo(userId)
      } catch (err) {
        clearAuth()
        throw err
      }

      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' })
      }, 500)
    } catch (err) {
      Taro.showToast({
        title: err.message || '登录失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login-page">
      <View className="login-header">
        <Text className="login-title">线下活动叫号系统</Text>
        <Text className="login-subtitle">请输入账号密码登录</Text>
      </View>

      <View className="login-form">
        <View className="form-item">
          <Text className="form-label">账号</Text>
          <Input
            className="form-input"
            type="text"
            placeholder="请输入账号"
            value={username}
            onInput={(e) => setUsername(e.detail.value)}
          />
        </View>
        <View className="form-item">
          <Text className="form-label">密码</Text>
          <View className="password-input-wrap">
            <Input
              className="form-input password-input"
              password={!showPassword}
              type="text"
              placeholder="请输入密码"
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            />
            <View
              className={`password-toggle ${showPassword ? 'is-visible' : ''}`}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <View className="eye-icon">
                <View className="eye-icon__shape" />
                <View className="eye-icon__pupil" />
                <View className="eye-icon__slash" />
              </View>
            </View>
          </View>
        </View>
        <Button className="submit-btn" loading={loading} disabled={loading} onClick={handleLogin}>
          登录
        </Button>
      </View>
    </View>
  )
}
