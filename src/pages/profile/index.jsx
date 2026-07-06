import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { EMPTY, emptyUserInfo } from '../../mockdata'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { clearAuth, getUserInfo } from '../../utils/auth'
import { normalizeUserProfile } from '../../utils/userProfile'
import './index.scss'

export default function Profile() {
  useAuthGuard()
  const [userInfo, setUserInfo] = useState(emptyUserInfo)

  useDidShow(() => {
    setUserInfo(normalizeUserProfile(getUserInfo()))
  })

  const handleCopy = (label, value) => {
    if (value === EMPTY) {
      Taro.showToast({ title: '暂无数据', icon: 'none' })
      return
    }
    Taro.setClipboardData({
      data: value,
      success: () => {
        Taro.showToast({ title: `${label}已复制`, icon: 'success' })
      },
    })
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          clearAuth()
          Taro.reLaunch({ url: '/pages/login/index' })
        }
      },
    })
  }

  const infoList = [
    { key: 'username', label: 'cn', value: userInfo.username },
    { key: 'ticketNo', label: '票号', value: userInfo.ticketNo },
    { key: 'orderNo', label: '订单号', value: userInfo.orderNo },
  ]

  return (
    <View className="profile-page">
      <View className="user-card">
        <View className="avatar">🙂</View>
        <View className="user-info">
          <Text className="nickname">{userInfo.username}</Text>
          <Text className="desc"></Text>
        </View>
      </View>

      <View className="info-section">
        <Text className="section-title">我的信息</Text>
        {infoList.map((item) => (
          <Button
            key={item.key}
            className="info-btn"
            onClick={() => handleCopy(item.label, item.value)}
          >
            <Text className="info-label">{item.label}</Text>
            <Text className={`info-value ${item.value === EMPTY ? 'empty' : ''}`}>
              {item.value}
            </Text>
          </Button>
        ))}

        <View className="guest-section">
          <Text className="guest-section-title">所排嘉宾</Text>
          {userInfo.guestList.length === 0 ? (
            <View className="guest-empty">
              <Text className="guest-empty-text">{EMPTY}</Text>
            </View>
          ) : (
            userInfo.guestList.map((guest) => (
              <View className="guest-item" key={guest.id}>
                <Text className="guest-name">{guest.coserName}</Text>
                <Text className="guest-queue">排号：{guest.queueNo}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <Button className="login-btn" onClick={handleLogout}>
        退出登录
      </Button>
    </View>
  )
}
