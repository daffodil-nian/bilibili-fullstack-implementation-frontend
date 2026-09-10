import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css';
import Antd from 'ant-design-vue';
import '@ant-design/icons-vue'
import router from './router/index.ts'
import {createPinia } from 'pinia'

const pinia = createPinia();
const app = createApp(App);

app.use(Antd)
.use(router)
.use(pinia)
.mount('#app');