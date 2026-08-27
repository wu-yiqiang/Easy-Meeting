<script setup>
const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
   <el-config-provider >
      <router-view></router-view>
  </el-config-provider>
</template>
