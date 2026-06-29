export const USER_TYPE = {
  GUEST: 'guest',
  OFFICIAL: 'official',
  FREE: 'free',
}

export const guests = [
  { id: 1, userName: '李明', avatar: '', currentNo: 'A001' },
  { id: 2, userName: '王芳', avatar: '', currentNo: 'A012' },
  { id: 3, userName: '张伟', avatar: '', currentNo: 'A025' },
  { id: 4, userName: 'llj', avatar: '', currentNo: 'A028' },
  { id: 5, userName: 'cyk', avatar: '', currentNo: 'A030' },
]

export const officials = [
  { id: 1, userName: '流川枫', avatar: '', currentNo: 'B001' },
  { id: 2, userName: '樱木花道', avatar: '', currentNo: 'B005' },
  { id: 3, userName: '赤木刚宪', avatar: '', currentNo: 'B009' },
]

export const freeTravels = [
  {
    category: '摄影区',
    list: [
      { id: 1, userName: '小林', avatar: '', currentNo: 'C001' },
      { id: 2, userName: '阿杰', avatar: '', currentNo: 'C002' },
    ],
  },
  {
    category: '手工区',
    list: [
      { id: 3, userName: '小月', avatar: '', currentNo: 'C010' },
      { id: 4, userName: '阿宁', avatar: '', currentNo: 'C011' },
      { id: 5, userName: '小北', avatar: '', currentNo: 'C012' },
    ],
  },
  {
    category: '游戏区',
    list: [
      { id: 6, userName: '阿凯', avatar: '', currentNo: 'C020' },
    ],
  },
]

export function getUserById(type, id) {
  let list = []
  if (type === USER_TYPE.GUEST) {
    list = guests
  } else if (type === USER_TYPE.OFFICIAL) {
    list = officials
  } else if (type === USER_TYPE.FREE) {
    list = freeTravels.flatMap((item) => item.list)
  }
  return list.find((item) => String(item.id) === String(id))
}
