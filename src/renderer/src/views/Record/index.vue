<template>
  <section v-if="recordStatus == 0" class="Record">
    <div class="left-pannel">
      <div class="recorder-setting">
        <div class="title">录制设置</div>
        <MicroIcon v-model="micInfo" ref="microRef" @click="toggleMicro" />
      </div>
      <div class="start-record">
        <el-button
          type="primary"
          :disabled="!currentScreenDisplayId"
          @click="startRecord"
          >开始录制</el-button
        >
      </div>
    </div>
    <el-divider direction="vertical" />
    <div class="right-pannel">
      <ScreenCap v-model:value="currentScreenDisplayId" />
    </div>
  </section>
  <Recording v-if="recordStatus != 0" :recordTime="recordTime" :status="recordStatus" @stopRecord="stopRecord" @saveVideo="saveVideo"/>
</template>
<script lang="ts" setup>
import ScreenCap from './ScreenCap.vue'
import Recording from './Recording.vue'
import { reactive, watch, computed, ref, onMounted } from 'vue'
import MicroIcon from '../../components/MicroIcon.vue'
const currentScreenDisplayId = ref(null)
const recordTime = ref(1)
const filePath = ref()
const microRef = ref()
const micInfo = ref()
// 0 初始化 1 开始录制 2 录制中 3 停止录制中 4 停止录制
const recordStatus = ref(0)
const startRecord = async () => {
  recordStatus.value = 1
  await window.electron.ipcRenderer.invoke('startRecording', {
    displayId: currentScreenDisplayId.value,
    mic: micInfo.value?.deviceId
  })
}
const stopRecord = async () => {
  recordStatus.value = 3
  await window.electron.ipcRenderer.invoke('stopRecording')

}
const saveVideo = () => {
  recordStatus.value = 0
  recordTime.value = 0
}

const listenRecordTime = async () => {
  await window.electron.ipcRenderer.on('recordTime', (e, _recordTime) => {
    recordTime.value = _recordTime
    if (_recordTime >= 1) {
      recordStatus.value = 2
    }
  })
  await window.electron.ipcRenderer.on('finishRecording', (e, _filePath) => {
    recordStatus.value = 4
    filePath.value = _filePath
  })
}

const toggleMicro = () => {
  microRef.value.toggleMic()
}

onMounted(() => {
  listenRecordTime()
})
</script>
<style scoped>
.Record {
  flex: 1;
  display: flex;
  overflow: hidden;
  justify-content: space-between;
  .left-pannel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .recorder-setting {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      .title {
        font-size: 16px;
      }
    }

    .start-record {
      display: grid;
      place-content: center;
    }
  }
  .el-divider--vertical {
    height: 100%;
  }
  .right-pannel {
    flex: 1;
    display: flex;
    overflow: auto;
  }
}
</style>
