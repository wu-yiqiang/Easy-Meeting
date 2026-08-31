<template>
  <section v-if="status == 0" class="Record">
    <div class="video-box">
      <VideoThumbnails v-for="(video, index) in videos" :key="index" :video="video" @rename="handleUpdate" @delete="handleDelete"/>
    </div>
    <div class="opt-button">
      <el-button type="primary" :icon="CirclePlus" circle size="large" @click="handleCreate" />
    </div>
  </section>
  <Recorder v-else @back="handleBack"/>
  <RenameDialog v-if="visible" v-model:value="visible" :video="video" @update="handleFileUpdate"  />
  <DelDialog v-if="delVisible"  v-model:value="delVisible" :video="video" @delete="handleFileDelete"  />
</template>
<script lang="ts" setup>
import Recorder from './Recorder.vue'
import RenameDialog from './RenameDialog.vue'
import DelDialog from './DelDialog.vue'
import VideoThumbnails from '../../components/VideoThumbnails.vue'
import { CirclePlus } from '@element-plus/icons-vue'
import { reactive, watch, computed, ref, onMounted } from 'vue'
const status = ref(0)
const videos = ref([])
const visible = ref(false)
const delVisible = ref(false)
const video = ref()
const handleCreate = () => {
  status.value = 1
}
const handleBack = () => {
  status.value = 0
  getVideos()
}
const handleUpdate = (value) => {
  visible.value = true
  video.value = value
}
const handleDelete = (value) => {
  delVisible.value = true
  video.value = value
}
const handleFileDelete = (filePath) => {
  videos.value = videos.value.filter((video) => video.fullPath !== filePath)
}
const handleFileUpdate = async ({ oldFileName, path, fileName }) => {
  const {fileExtend } = await window.electron.ipcRenderer.invoke("fileInfo", path)
  const item = videos.value.find(video => video.fullPath == oldFileName)
  item.fileName = fileName
  item.fullName = fileName+fileExtend
  item.fullPath = path
}
const getVideos = async () => {
  const datas = await window.electron.ipcRenderer.invoke('getPathVideos')
  console.log(datas)
  videos.value = datas.sort((a, b) => a.mtime - b.mtime)
}
onMounted(() => {
  getVideos()
})
</script>
<style lang="scss" scoped>
.Record {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  .video-box {
    flex: 1;
    display: grid;
    overflow: hidden;
    overflow-y: auto;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    align-content: flex-start; 
    gap: 20px;
    content-visibility: auto;
  }
  .opt-button {
    display: flex;
    padding: 10px 0;
    justify-content: center;
  }
}
</style>
