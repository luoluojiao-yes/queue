import { useState } from 'react'
import { View, Text, Input, Textarea } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { EMPTY, emptyUserInfo } from '../../mockdata'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { clearAuth, getUserId, getUserInfo } from '../../utils/auth'
import { fetchUserInfo, getUserByTicketCode, updateUserInfo } from '../../services/user'
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
  const [editVisible, setEditVisible] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    userName: '',
    address: '',
    phone: '',
  })
  const [expandedInfo, setExpandedInfo] = useState({
    address: false,
    phone: false,
  })
  const [addressHeight, setAddressHeight] = useState(80)

  const toEditValue = (value) => (value === EMPTY ? '' : value || '')
  const ADDRESS_LINE_HEIGHT = 40
  const ADDRESS_MIN_HEIGHT = 80
  const ADDRESS_MAX_HEIGHT = 240

  const handleAddressLineChange = (e) => {
    const lineCount = Math.max(1, e.detail?.lineCount || 1)
    const nextHeight = Math.min(
      ADDRESS_MAX_HEIGHT,
      ADDRESS_MIN_HEIGHT + (lineCount - 1) * ADDRESS_LINE_HEIGHT
    )
    setAddressHeight(nextHeight)
  }

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

  const handleInfoClick = (item) => {
    if (item.collapsible) {
      setExpandedInfo((prev) => {
        const nextExpanded = !prev[item.key]
        return { ...prev, [item.key]: nextExpanded }
      })
      return
    }
    handleCopy(item.label, item.value)
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

  const handleOpenEdit = () => {
    setEditForm({
      userName: toEditValue(userInfo.username),
      address: toEditValue(userInfo.address),
      phone: toEditValue(userInfo.phone),
    })
    setAddressHeight(ADDRESS_MIN_HEIGHT)
    setEditVisible(true)
  }

  const handleCloseEdit = () => {
    if (editSubmitting) return
    setEditVisible(false)
  }

  const handleEditFieldChange = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveEdit = () => {
    const userName = editForm.userName.trim()
    const address = editForm.address.trim()
    const phone = editForm.phone.trim()

    if (!userName) {
      Taro.showToast({ title: '请输入cn', icon: 'none' })
      return
    }

    const userId = getUserId()
    if (userId == null) {
      Taro.showToast({ title: '未获取到用户信息', icon: 'none' })
      return
    }

    if (editSubmitting) return

    Taro.showModal({
      title: '确认修改',
      content: '确定要保存个人信息吗？',
      confirmText: '确认',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) return

        setEditSubmitting(true)
        try {
          await updateUserInfo({
            id: userId,
            userName,
            address,
            phone,
          })
          Taro.showToast({ title: '修改成功', icon: 'success' })
          setEditVisible(false)
          await reloadUserInfo()
        } catch (err) {
          Taro.showToast({
            title: err.message || '修改失败',
            icon: 'none',
          })
        } finally {
          setEditSubmitting(false)
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

  const handleConfirmGiftToUser = () => {
    if (!targetUser || !giftGuest?.raw || giftSubmitting) return

    const cachedUser = getUserInfo()
    const presentedBy = cachedUser?.ticketCode
    if (!presentedBy) {
      Taro.showToast({ title: '未获取到当前用户票号', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '确认赠票',
      content: `确定将「${giftGuest.coserName}」赠票给 ${targetUser.userName || targetUser.ticketCode} 吗？一旦赠送不可撤回。`,
      confirmText: '确认',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) return

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
      },
    })
  }

  const infoList = [
    { key: 'username', label: 'cn', value: userInfo.username },
    { key: 'ticketNo', label: '票号', value: userInfo.ticketNo },
    { key: 'address', label: '地址', value: userInfo.address, collapsible: true },
    { key: 'phone', label: '手机号', value: userInfo.phone, collapsible: true },
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
        <View className="section-header">
          <Text className="section-title">我的信息</Text>
          <View className="edit-profile-btn" onClick={handleOpenEdit}>
            修改个人信息
          </View>
        </View>
        {infoList.map((item) => {
          const isExpanded = !item.collapsible || expandedInfo[item.key]
          const displayValue = item.collapsible && !isExpanded ? '点击查看' : item.value
          const isEmptyDisplay =
            isExpanded && item.value === EMPTY
              ? true
              : !item.collapsible && item.value === EMPTY

          return (
            <View
              key={item.key}
              className={`info-btn ${
                item.key === 'address' && isExpanded ? 'info-btn-multiline' : ''
              } ${item.collapsible ? 'info-btn-fold' : ''}`}
              onClick={() => handleInfoClick(item)}
            >
              <Text className="info-label">{item.label}</Text>
              <View className="info-value-wrap">
                <Text
                  className={`info-value ${isEmptyDisplay ? 'empty' : ''} ${
                    item.collapsible && !isExpanded ? 'info-value-hint' : ''
                  } ${item.key === 'address' && isExpanded ? 'info-value-multiline' : ''}`}
                >
                  {displayValue}
                </Text>
                {item.collapsible ? (
                  <Text className="info-fold-icon">{isExpanded ? '收起' : '展开'}</Text>
                ) : null}
              </View>
            </View>
          )
        })}

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

      <View className="login-btn" onClick={handleLogout}>
        退出登录
      </View>

      {editVisible ? (
        <View className="modal-mask" catchMove>
          <View className="modal-backdrop" onClick={handleCloseEdit} />
          <View className="modal-content modal-content-edit">
            <Text className="modal-title">修改个人信息</Text>
            <Text className="modal-label">cn</Text>
            <View className="modal-input-wrap">
              <Input
                className="modal-input"
                type="text"
                focus
                adjustPosition
                holdKeyboard
                placeholder="请输入cn"
                value={editForm.userName}
                onInput={(e) => handleEditFieldChange('userName', e.detail.value)}
              />
            </View>
            <Text className="modal-label">地址</Text>
            <View className="modal-input-wrap modal-textarea-wrap">
              <Textarea
                className="modal-textarea"
                style={{ width: '100%', height: `${addressHeight}rpx` }}
                maxlength={200}
                showConfirmBar={false}
                adjustPosition
                holdKeyboard
                placeholder="请输入地址"
                value={editForm.address}
                onInput={(e) => handleEditFieldChange('address', e.detail.value)}
                onLineChange={handleAddressLineChange}
              />
            </View>
            <Text className="modal-label">手机号</Text>
            <View className="modal-input-wrap">
              <Input
                className="modal-input"
                type="number"
                maxlength={11}
                adjustPosition
                holdKeyboard
                placeholder="请输入手机号"
                value={editForm.phone}
                onInput={(e) => handleEditFieldChange('phone', e.detail.value)}
              />
            </View>
            <View className="modal-actions">
              <View
                className={`modal-btn modal-btn-secondary ${editSubmitting ? 'modal-btn-disabled' : ''}`}
                onClick={handleCloseEdit}
              >
                取消
              </View>
              <View
                className={`modal-btn modal-btn-primary ${editSubmitting ? 'modal-btn-disabled' : ''}`}
                onClick={handleSaveEdit}
              >
                {editSubmitting ? '保存中...' : '保存'}
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {giftVisible ? (
        <View className="modal-mask" catchMove>
          <View className="modal-backdrop" onClick={handleCloseGiftModal} />
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
                  <View
                    className={`modal-btn modal-btn-secondary ${giftSubmitting ? 'modal-btn-disabled' : ''}`}
                    onClick={handleCloseGiftModal}
                  >
                    取消
                  </View>
                  <View
                    className={`modal-btn modal-btn-primary ${giftSubmitting ? 'modal-btn-disabled' : ''}`}
                    onClick={handleSearchTargetUser}
                  >
                    {giftSubmitting ? '查询中...' : '确认'}
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text className="modal-title">确认赠票</Text>
                <Text className="modal-desc">
                  确认是否赠票给该用户？一旦赠送不可撤回。所有权益归属对方
                </Text>
                <View className="modal-info-list">
                  <View className="modal-info-row">
                    <Text className="modal-info-label">cn</Text>
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
                  <View
                    className={`modal-btn modal-btn-secondary ${giftSubmitting ? 'modal-btn-disabled' : ''}`}
                    onClick={handleCloseGiftModal}
                  >
                    取消
                  </View>
                  <View
                    className={`modal-btn modal-btn-primary ${giftSubmitting ? 'modal-btn-disabled' : ''}`}
                    onClick={handleConfirmGiftToUser}
                  >
                    {giftSubmitting ? '提交中...' : '确认'}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      ) : null}
    </View>
  )
}
