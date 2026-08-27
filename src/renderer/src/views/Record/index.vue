<template>
  <section class="Record">
    <div class="left-pannel">
      <div class="recorder-setting"><div class="title">录制设置</div></div>
      <div class="start-record">
        <el-button type="primary" :disabled="!currentScreenDisplayId" @click="startRecord">开始录制</el-button>
      </div>
    </div>
    <el-divider direction="vertical" />
    <div class="right-pannel">
      <ScreenCap v-model:value="currentScreenDisplayId" />
    </div>
  </section>
</template>
<script lang="ts" setup>
import ScreenCap from './ScreenCap.vue'
import { reactive, watch, computed, ref } from 'vue'
const currentScreenDisplayId = ref(null)
// 0 初始化 1 开始录制 2 录制中 3 停止录制中 4 停止录制
const recordStatus = ref(0)
const startRecord = async () => {
  recordStatus.value = 1
  await window.electron.ipcRenderer.invoke('startRecording', {
    displayId: currentScreenDisplayId.value,
    mic: ""
  })

}
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
