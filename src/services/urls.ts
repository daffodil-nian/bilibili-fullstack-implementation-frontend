// 这是一个负责封装很多url的接口的文件
const prefix = ''

export default {
  // 和用户相关的接口
  userLogin: `${prefix}/api/auth/login`,
  userRegister: `${prefix}/api/auth/register`,
  userLogout: `${prefix}/api/auth/logout`,
}