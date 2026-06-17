import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { EMPTY, emptyUserInfo, mockLoggedInUser } from '../../mockdata'
import './index.scss'

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(emptyUserInfo)

  const handleLogin = () => {
    if (isLoggedIn) {
      Taro.showToast({ title: '已登录', icon: 'none' })
      return
    }
    setIsLoggedIn(true)
    setUserInfo(mockLoggedInUser)
    Taro.showToast({ title: '登录成功', icon: 'success' })
  }

  const handleCopy = (label, value) => {
    if (value === EMPTY) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    Taro.setClipboardData({
      data: value,
      success: () => {
        Taro.showToast({ title: `${label}已复制`, icon: 'success' })
      },
    })
  }

  const infoList = [
    { key: 'username', label: '个人用户名', value: userInfo.username },
    { key: 'ticketNo', label: '票号', value: userInfo.ticketNo },
    { key: 'orderNo', label: '订单号', value: userInfo.orderNo },
    { key: 'guestName', label: '所排嘉宾', value: userInfo.guestName },
  ]

  return (
    <View className="profile-page">
      <View className="user-card">
        <View className="avatar">{isLoggedIn ? '🙂' : '👤'}</View>
        <View className="user-info">
          <Text className="nickname">{isLoggedIn ? userInfo.username : '未登录'}</Text>
          <Text className="desc">线下活动叫号系统</Text>
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
      </View>

      <Button className="login-btn" onClick={handleLogin}>
        {isLoggedIn ? '已登录' : '登录'}
      </Button>
    </View>
  )
}
