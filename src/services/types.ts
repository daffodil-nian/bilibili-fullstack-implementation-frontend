
// 用户登录注册相关的类
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


// 修改用户信息
// 1. 修改签名请求体
export type UpdateSignatureReq = {
  signature: string
}

// 2. 修改头像请求体
export type UpdateAvatarReq = {
  avatar: string
}

// 3. 修改昵称请求体
export type UpdateNicknameReq = {
  nickname: string
}