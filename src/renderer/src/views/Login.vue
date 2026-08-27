<template>
  <el-form :model="form" label-width="auto" style="max-width: 600px">
    <el-form-item label="邮箱">
      <el-input v-model="form.email" />
    </el-form-item>
    <el-form-item label="密码">
      <el-col >
        <el-input v-model="form.password" />
      </el-col>
    </el-form-item>
    <!-- <el-form-item label="验证码">
       <el-col >
        <el-input v-model="form.verifyCode" />
      </el-col>
    </el-form-item> -->
    <el-form-item>
      <el-button @click="onRegister">注册</el-button>
      <el-button type="primary" @click="onLogin">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { toRaw, ref } from 'vue'
import router from '@/router';

const isLogin = ref(true)
const form = ref({
  email: 'wu_yiqiang@outlook.com',
  password: '1234@Abcd',
  wsUrl: 'https://192',
  userInfo: {name: "Sutter"},
  verifyCode: '',
})

const onRegister = async () => {
  console.log('submit!')
  isLogin.value = false
  await window.electron.ipcRenderer.invoke('loginOrRegister', isLogin.value)
  console.log("oooo")
}
const onLogin = async () => {
  await window.electron.ipcRenderer.invoke('loginSuccess', toRaw(form.value))
 router.push('/home')
}
</script>