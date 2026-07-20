import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { USER_TYPE } from '../../mockdata'
import { queryGuestAll } from '../../services/guest'
import { normalizeGuestAll, setGuestAllCache, setDetailUser } from '../../utils/guestData'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import './index.scss'

const emptyGuestData = {
  guests: [],
  officials: [],
  freeTravels: [],
}

function UserGrid({ list, type }) {
  const handleClick = (user) => {
    setDetailUser(user, type)
    Taro.navigateTo({
      url: `/pages/detail/index?id=${encodeURIComponent(user.id)}&type=${type}`,
    })
  }

  if (list.length === 0) {
    return <Text className="empty">暂无数据</Text>
  }

  return (
    <View className="user-grid">
      {list.map((user) => (
        <View className="user-item" key={user.id} onClick={() => handleClick(user)}>
          {user.avatar ? (
            <Image className="avatar-img" src={user.avatar} mode="aspectFill" />
          ) : (
            <View className="avatar-placeholder">
              <Text className="avatar-text">{user.userName.slice(0, 1)}</Text>
            </View>
          )}
          <Text className="user-name">{user.userName}</Text>
        </View>
      ))}
    </View>
  )
}

function UserSection({ title, list, type }) {
  return (
    <View className="section-box">
      <Text className="section-title">{title}</Text>
      <UserGrid list={list} type={type} />
    </View>
  )
}

export default function Index() {
  useAuthGuard()
  const [guestData, setGuestData] = useState(emptyGuestData)
  const [loading, setLoading] = useState(false)

  useDidShow(async () => {
    setLoading(true)
    try {
      const data = await queryGuestAll()
      const normalized = normalizeGuestAll(data)
      setGuestAllCache(normalized)
      setGuestData(normalized)
    } catch (err) {
      Taro.showToast({
        title: err.message || '加载嘉宾数据失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  })

  return (
    <View className="page">
      <View className="header">
        <Text className="title">烬光灵契·深空光夜魔法校园</Text>
        <Text className="subtitle">选择嘉宾、官委或自由行</Text>
      </View>

      {loading ? <Text className="page-loading">加载中...</Text> : null}

      <UserSection title="嘉宾" list={guestData.guests} type={USER_TYPE.GUEST} />
      <UserSection title="官委" list={guestData.officials} type={USER_TYPE.OFFICIAL} />
      <UserSection title="自由行" list={guestData.freeTravels} type={USER_TYPE.FREE} />
    </View>
  )
}
