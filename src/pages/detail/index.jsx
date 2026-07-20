import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import { USER_TYPE } from '../../mockdata'
import { getDetailUser, getUserById } from '../../utils/guestData'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import './index.scss'

const SKIP_COOLDOWN_SEC = 15

function resolveUser(id, type) {
  const passed = getDetailUser()
  if (passed && String(passed.id) === String(id) && (!type || passed.type === type)) {
    return passed
  }
  return getUserById(type, id)
}

export default function Detail() {
  useAuthGuard()
  const router = useRouter()
  const { id = '', type = '' } = router.params
  const user = resolveUser(id, type)
  const userType = user?.type || type
  const typeLabel =
    userType === USER_TYPE.GUEST
      ? '嘉宾'
      : userType === USER_TYPE.OFFICIAL
        ? '官委'
        : '自由行'
  const [modalVisible, setModalVisible] = useState(false)
  const [skipCooldown, setSkipCooldown] = useState(0)

  useEffect(() => {
    if (skipCooldown <= 0) return undefined
    const timer = setTimeout(() => {
      setSkipCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [skipCooldown])

  const handleCall = () => {
    setModalVisible(true)
    setSkipCooldown((prev) => (prev > 0 ? prev : SKIP_COOLDOWN_SEC))
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  const handleSkip = () => {
    if (skipCooldown > 0) return
    Taro.showModal({
      title: '确认过号',
      content: `确定将 ${user.currentNo} 设为过号吗？`,
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已过号', icon: 'none' })
          setSkipCooldown(SKIP_COOLDOWN_SEC)
        }
      },
    })
  }
  const handleConfirm = () => {
    Taro.showModal({
      title: '确认叫号',
      content: `确定叫号 ${user.currentNo} 吗？`,
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '叫号成功', icon: 'success' })
        }
      },
    })
  }

  if (!user) {
    return (
      <View className="detail-page">
        <Text className="empty">未找到相关信息</Text>
      </View>
    )
  }

  return (
    <View className="detail-page">
      <View className="detail-card">
        {user.avatar ? (
          <Image className="avatar-img" src={user.avatar} mode="aspectFill" />
        ) : (
          <View className="avatar-placeholder">
            <Text className="avatar-text">{user.userName.slice(0, 1)}</Text>
          </View>
        )}
        <Text className="user-name">{user.userName}</Text>
        <Text className="type-tag">{typeLabel}</Text>
        <View className="current-no-box">
          <Text className="current-no-label">目前叫号</Text>
          <Text className="current-no-value">{user.currentNo}</Text>
        </View>
      </View>

      <View className="info-list">
        <View className="info-row">
          <Text className="info-label">目前叫号</Text>
          <Text className="info-value highlight">{user.currentNo}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">ID</Text>
          <Text className="info-value">{user.id}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">类型</Text>
          <Text className="info-value">{typeLabel}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">用户名</Text>
          <Text className="info-value">{user.userName}</Text>
        </View>
      </View>

      <Button className="call-btn" onClick={handleCall}>
        叫号
      </Button>

      {modalVisible && (
        <View className="modal-mask" onClick={handleCloseModal}>
          <View className="modal-content" catchClick={() => {}}>
            <Text className="modal-title">确认叫下一位吗？</Text>
            <Text className="modal-no">{user.currentNo}</Text>
            <Text className="modal-desc">
              请 {user.userName} 准备前往{typeLabel}互动环节
            </Text>
            <View className="modal-actions">
              <Button
                className={`modal-btn modal-btn-secondary ${skipCooldown > 0 ? 'modal-btn-disabled' : ''}`}
                disabled={skipCooldown > 0}
                onClick={handleSkip}
              >
                {skipCooldown > 0 ? `过号(${skipCooldown}s)` : '过号'}
              </Button>
              <Button className="modal-btn modal-btn-primary" onClick={handleConfirm}>
                确认
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
