import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
   server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080', // 你的SpringBoot后端地址
        changeOrigin: true,
        // 后端接口本身带/api前缀就不用rewrite
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // 头像等静态资源：/user/1/avatar/xxx.jpg
      '/user': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    }
  }
})
