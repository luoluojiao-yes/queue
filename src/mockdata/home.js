export const USER_TYPE = {
  GUEST: 'guest',
  OFFICIAL: 'official',
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

export function getUserById(type, id) {
  const list = type === USER_TYPE.GUEST ? guests : officials
  return list.find((item) => String(item.id) === String(id))
}
