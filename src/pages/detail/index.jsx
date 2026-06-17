import { useRouter } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { getUserById, USER_TYPE } from '../../mockdata'
import './index.scss'

export default function Detail() {
  const router = useRouter()
  const { id = '', type = '' } = router.params
  const user = getUserById(type, id)
  const typeLabel = type === USER_TYPE.GUEST ? '嘉宾' : '官委'

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
    </View>
  )
}
