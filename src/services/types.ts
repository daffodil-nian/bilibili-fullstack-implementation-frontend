
export type UserBaseInfo = {
  /** 用户 UID（后端字段为 uid） */
  uid: number
  nickname: string
  sex: number
  /** 后端字段为 birthDay */
  birthDay?: string
  birthday?: string
  activeStatus: number
  avatar: string | null
  ipInfo: Record<string, unknown> | null
  createTime: string
}
