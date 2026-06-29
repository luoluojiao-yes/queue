import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { guests, officials, freeTravels, USER_TYPE } from '../../mockdata'
import './index.scss'

function UserGrid({ list, type }) {
  const handleClick = (user) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${user.id}&type=${type}`,
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

function FreeTravelSection({ categories, type }) {
  return (
    <View className="section-box">
      <Text className="section-title">自由行</Text>
      {categories.map((item) => (
        <View className="subcategory-box" key={item.category}>
          <Text className="subcategory-title">{item.category}</Text>
          <UserGrid list={item.list} type={type} />
        </View>
      ))}
    </View>
  )
}

export default function Index() {
  return (
    <View className="page">
      <View className="header">
        <Text className="title">烬光灵契·深空光夜魔法校园</Text>
        <Text className="subtitle">选择嘉宾、官委或自由行</Text>
      </View>

      <UserSection title="嘉宾" list={guests} type={USER_TYPE.GUEST} />
      <UserSection title="官委" list={officials} type={USER_TYPE.OFFICIAL} />
      <FreeTravelSection categories={freeTravels} type={USER_TYPE.FREE} />
    </View>
  )
}
