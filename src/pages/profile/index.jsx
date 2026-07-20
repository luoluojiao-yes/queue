import { useState } from 'react'
import { View, Text, Button, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { EMPTY, emptyUserInfo } from '../../mockdata'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { clearAuth, getUserId, getUserInfo } from '../../utils/auth'
import { fetchUserInfo, getUserByTicketCode } from '../../services/user'
import { presentInteraction } from '../../services/interaction'
import { normalizeUserProfile } from '../../utils/userProfile'
import './index.scss'

const GIFT_STEP = {
  INPUT: 'input',
  CONFIRM: 'confirm',
}

export default function Profile() {
  useAuthGuard()
  const [userInfo, setUserInfo] = useState(emptyUserInfo)
  const [loading, setLoading] = useState(false)
  const [giftVisible, setGiftVisible] = useState(false)
  const [giftStep, setGiftStep] = useState(GIFT_STEP.INPUT)
  const [giftGuest, setGiftGuest] = useState(null)
  const [targetUser, setTargetUser] = useState(null)
  const [ticketCode, setTicketCode] = useState('')
  const [giftSubmitting, setGiftSubmitting] = useState(false)

  const reloadUserInfo = async () => {
    const userId = getUserId()
    if (userId == null) return
    const data = await fetchUserInfo(userId)
    setUserInfo(normalizeUserProfile(data))
  }

  useDidShow(async () => {
    setLoading(true)
    try {
      await reloadUserInfo()
    } catch (err) {
      Taro.showToast({
        title: err.message || '加载用户信息失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
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

  const resetGiftModal = () => {
    setGiftVisible(false)
    setGiftStep(GIFT_STEP.INPUT)
    setGiftGuest(null)
    setTargetUser(null)
    setTicketCode('')
  }

  const handleGiftTicket = (guest) => {
    setGiftGuest(guest)
    setTargetUser(null)
    setTicketCode('')
    setGiftStep(GIFT_STEP.INPUT)
    setGiftVisible(true)
  }

  const handleCloseGiftModal = () => {
    if (giftSubmitting) return
    resetGiftModal()
  }

  const handleSearchTargetUser = async () => {
    const code = ticketCode.trim()
    if (!code) {
      Taro.showToast({ title: '请输入对方的票号', icon: 'none' })
      return
    }

    setGiftSubmitting(true)
    try {
      const user = await getUserByTicketCode(code)
      setTargetUser({
        userName: user?.userName || '',
        ticketCode: user?.ticketCode || code,
      })
      setGiftStep(GIFT_STEP.CONFIRM)
    } catch (err) {
      Taro.showToast({
        title: err.message || '查询失败',
        icon: 'none',
      })
    } finally {
      setGiftSubmitting(false)
    }
  }

  const handleConfirmGiftToUser = async () => {
    if (!targetUser || !giftGuest?.raw) return

    const cachedUser = getUserInfo()
    const presentedBy = cachedUser?.ticketCode
    if (!presentedBy) {
      Taro.showToast({ title: '未获取到当前用户票号', icon: 'none' })
      return
    }

    setGiftSubmitting(true)
    try {
      await presentInteraction({
        ...giftGuest.raw,
        ticketCodeTo: targetUser.ticketCode,
        presentedBy,
      })
      Taro.showToast({ title: '赠票成功', icon: 'success' })
      resetGiftModal()
      await reloadUserInfo()
    } catch (err) {
      Taro.showToast({
        title: err.message || '赠票失败',
        icon: 'none',
      })
    } finally {
      setGiftSubmitting(false)
    }
  }

  const infoList = [
    { key: 'username', label: 'cn', value: userInfo.username },
    { key: 'ticketNo', label: '票号', value: userInfo.ticketNo },
    { key: 'orderNo', label: '订单号', value: userInfo.orderNo },
  ]

  return (
    <View className="profile-page">
      {loading ? <Text className="page-loading">加载中...</Text> : null}

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
                <View className="guest-main">
                  <Text className="guest-name">{guest.coserName}</Text>
                  <Text className="guest-queue">排号：{guest.queueNo}</Text>
                </View>
                {guest.status === 0 && guest.isPresented === 0 ? (
                  <View className="gift-btn" onClick={() => handleGiftTicket(guest)}>
                    赠票
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      </View>

      <Button className="login-btn" onClick={handleLogout}>
        退出登录
      </Button>

      {giftVisible ? (
        <View
          className="modal-mask"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseGiftModal()
            }
          }}
        >
          <View className="modal-content">
            {giftStep === GIFT_STEP.INPUT ? (
              <>
                <Text className="modal-title">赠票</Text>
                {giftGuest ? (
                  <Text className="modal-desc">将「{giftGuest.coserName}」赠送给对方</Text>
                ) : null}
                <Text className="modal-label">请输入对方的票号</Text>
                <View className="modal-input-wrap">
                  <Input
                    className="modal-input"
                    type="text"
                    focus
                    adjustPosition
                    holdKeyboard
                    placeholder="请输入对方的票号"
                    value={ticketCode}
                    onInput={(e) => setTicketCode(e.detail.value)}
                  />
                </View>
                <View className="modal-actions">
                  <Button
                    className="modal-btn modal-btn-secondary"
                    disabled={giftSubmitting}
                    onClick={handleCloseGiftModal}
                  >
                    取消
                  </Button>
                  <Button
                    className="modal-btn modal-btn-primary"
                    loading={giftSubmitting}
                    disabled={giftSubmitting}
                    onClick={handleSearchTargetUser}
                  >
                    确认
                  </Button>
                </View>
              </>
            ) : (
              <>
                <Text className="modal-title">确认赠票</Text>
                <Text className="modal-desc">确认是否赠票给该用户？一旦赠送不可撤回。所有权益归属对方</Text>
                <View className="modal-info-list">
                  <View className="modal-info-row">
                    <Text className="modal-info-label">用户名</Text>
                    <Text className="modal-info-value">{targetUser?.userName || EMPTY}</Text>
                  </View>
                  <View className="modal-info-row">
                    <Text className="modal-info-label">票号</Text>
                    <Text className="modal-info-value">{targetUser?.ticketCode || EMPTY}</Text>
                  </View>
                  {giftGuest ? (
                    <View className="modal-info-row">
                      <Text className="modal-info-label">赠送嘉宾</Text>
                      <Text className="modal-info-value">{giftGuest.coserName}</Text>
                    </View>
                  ) : null}
                </View>
                <View className="modal-actions">
                  <Button
                    className="modal-btn modal-btn-secondary"
                    disabled={giftSubmitting}
                    onClick={handleCloseGiftModal}
                  >
                    取消
                  </Button>
                  <Button
                    className="modal-btn modal-btn-primary"
                    loading={giftSubmitting}
                    disabled={giftSubmitting}
                    onClick={handleConfirmGiftToUser}
                  >
                    确认
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      ) : null}
    </View>
  )
}
