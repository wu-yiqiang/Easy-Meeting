<script setup>
const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <router-view></router-view>
</template>
