
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
  signature: string
  createTime: string
  userFollowInfo:UserFollowInfo
  userLvInfo:UserLvInfo
  userWalletResp:UserWalletInfo
}

type UserFollowInfo={
  followCount:number,
  fansCount:number
}
type UserLvInfo={
  level:number,
  needAddExp:number,
  totalExp:number,
  levelName:string 
}
type UserWalletInfo={
  coin:number,
  bcoin:number
}