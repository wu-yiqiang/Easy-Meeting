import './assets/main.css'
import router from '@/router/index.js'
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'
createApp(App).use(router).use(ElementPlus).mount('#app')

