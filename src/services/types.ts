

export type UserBaseInfo = {
    //用户的UID
    UID: number
    nickname:string
    sex:number
    birthday:string
    activeStatus:number
    avatar:string
    ipInfo: Record<string, unknown>
    createTime:string //先这么写
}