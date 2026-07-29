import { useState, useEffect } from 'react'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import { USER_TYPE } from '../../mockdata'
import { getGuestById } from '../../services/guest'
import { startCalling, nextCalling, passCalling } from '../../services/calling'
import { normalizeGuestDetail } from '../../utils/guestData'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import './index.scss'

const SKIP_COOLDOWN_SEC = 15

export default function Detail() {
  useAuthGuard()
  const router = useRouter()
  const { id = '', type = '' } = router.params
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [startCallVisible, setStartCallVisible] = useState(false)
  const [startCallSubmitting, setStartCallSubmitting] = useState(false)
  const [nextCallSubmitting, setNextCallSubmitting] = useState(false)
  const [skipCooldown, setSkipCooldown] = useState(0)

  const typeLabel =
    type === USER_TYPE.GUEST ? '嘉宾' : type === USER_TYPE.OFFICIAL ? '官委' : '自由行'

  const loadDetail = async () => {
    if (!id) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await getGuestById(id)
      setUser(normalizeGuestDetail(data))
    } catch (err) {
      setUser(null)
      Taro.showToast({
        title: err.message || '加载详情失败',
        icon: 'none',
      })
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    loadDetail()
  })

  useEffect(() => {
    if (skipCooldown <= 0) return undefined
    const timer = setTimeout(() => {
      setSkipCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [skipCooldown])

  const handlePrimaryAction = () => {
    if (!user) return
    if (user.status === 0 && user.guestType !== 3) {
      setStartCallVisible(true)
      return
    }
    if (user.status === 1 && user.guestType !== 3) {
      setModalVisible(true)
      setSkipCooldown((prev) => (prev > 0 ? prev : SKIP_COOLDOWN_SEC))
    }
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  const handleCloseStartCall = () => {
    if (startCallSubmitting) return
    setStartCallVisible(false)
  }

  const handleConfirmStartCall = async () => {
    if (!id || startCallSubmitting) return

    setStartCallSubmitting(true)
    try {
      await startCalling(id)
      setStartCallVisible(false)
      Taro.showToast({ title: '已开始叫号', icon: 'success' })
      await loadDetail()
    } catch (err) {
      Taro.showToast({
        title: err.message || '开始叫号失败',
        icon: 'none',
      })
    } finally {
      setStartCallSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (skipCooldown > 0 || !user || nextCallSubmitting) return
    if (user.nextQueueNo == null) {
      Taro.showToast({ title: '叫号已经全部完成', icon: 'none' })
      return
    }
    if (user.callingId == null) {
      Taro.showToast({ title: '缺少叫号记录ID', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '确认过号',
      content: `确定将 ${user.currentNo} 设为过号吗？`,
      confirmText: '确认',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) return

        setNextCallSubmitting(true)
        try {
          await passCalling({
            guestId: id,
            callingId: user.callingId,
          })
          setModalVisible(false)
          Taro.showToast({ title: '已过号', icon: 'none' })
          setSkipCooldown(SKIP_COOLDOWN_SEC)
          await loadDetail()
        } catch (err) {
          Taro.showToast({
            title: err.message || '过号失败',
            icon: 'none',
          })
        } finally {
          setNextCallSubmitting(false)
        }
      },
    })
  }

  const handleConfirm = async () => {
    if (!user || nextCallSubmitting) return
    if (user.nextQueueNo == null) {
      Taro.showToast({ title: '叫号已经全部完成', icon: 'none' })
      return
    }
    if (user.callingId == null) {
      Taro.showToast({ title: '缺少叫号记录ID', icon: 'none' })
      return
    }

    setNextCallSubmitting(true)
    try {
      await nextCalling({
        guestId: id,
        callingId: user.callingId,
      })
      setModalVisible(false)
      Taro.showToast({ title: '叫号成功', icon: 'success' })
      await loadDetail()
    } catch (err) {
      Taro.showToast({
        title: err.message || '叫号失败',
        icon: 'none',
      })
    } finally {
      setNextCallSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View className="detail-page">
        <Text className="empty">加载中...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View className="detail-page">
        <Text className="empty">未找到相关信息</Text>
      </View>
    )
  }

  const showStartCall = user.status === 0 && user.guestType !== 3
  const showCall = user.status === 1 && user.guestType !== 3
  const callBtnText = showStartCall ? '开始叫号' : showCall ? '叫号' : ''

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
          <Text className="info-label">cos的角色</Text>
          <Text className="info-value">{user.cosRole}</Text>
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

      {callBtnText ? (
        <Button className="call-btn" onClick={handlePrimaryAction}>
          {callBtnText}
        </Button>
      ) : null}

      {startCallVisible ? (
        <View
          className="modal-mask"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseStartCall()
          }}
        >
          <View className="modal-content modal-content-sm">
            <Text className="modal-title">确认开始叫号？</Text>
            <Text className="modal-warn">该操作不可逆</Text>
            <View className="modal-actions">
              <Button
                className="modal-btn modal-btn-secondary"
                disabled={startCallSubmitting}
                onClick={handleCloseStartCall}
              >
                取消
              </Button>
              <Button
                className="modal-btn modal-btn-primary"
                loading={startCallSubmitting}
                disabled={startCallSubmitting}
                onClick={handleConfirmStartCall}
              >
                确认
              </Button>
            </View>
          </View>
        </View>
      ) : null}

      {modalVisible && (
        <View className="modal-mask" onClick={handleCloseModal}>
          <View className="modal-content" catchClick={() => {}}>
            <Text className="modal-title">确认叫下一位吗</Text>
            {user.nextQueueNo == null ? (
              <Text className="modal-desc modal-desc-done">叫号已经全部完成</Text>
            ) : (
              <View className="modal-queue-info">
                <View className="modal-queue-row">
                  <Text className="modal-queue-label">当前叫号</Text>
                  <Text className="modal-queue-value">{user.currentNo || '-'}</Text>
                </View>
                <View className="modal-queue-row">
                  <Text className="modal-queue-label">下一位叫号</Text>
                  <Text className="modal-queue-value highlight">{user.nextNo || '-'}</Text>
                </View>
              </View>
            )}
            <View className="modal-actions">
              {user.nextQueueNo == null ? (
                <Button className="modal-btn modal-btn-primary" onClick={handleCloseModal}>
                  知道了
                </Button>
              ) : (
                <>
                  <Button
                    className={`modal-btn modal-btn-secondary ${skipCooldown > 0 ? 'modal-btn-disabled' : ''}`}
                    disabled={skipCooldown > 0 || nextCallSubmitting}
                    onClick={handleSkip}
                  >
                    {skipCooldown > 0 ? `过号(${skipCooldown}s)` : '过号'}
                  </Button>
                  <Button
                    className="modal-btn modal-btn-primary"
                    loading={nextCallSubmitting}
                    disabled={nextCallSubmitting}
                    onClick={handleConfirm}
                  >
                    确认
                  </Button>
                </>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
