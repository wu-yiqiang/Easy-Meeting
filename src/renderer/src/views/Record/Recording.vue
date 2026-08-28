<template>
  <section class="Recording">
    <div class="caputer">12121221212</div>
    <div class="opts" v-if="status == 1 || status == 2">
      <span v-if="status == 1"  class="status">开始录制</span>
      <span v-if="status == 2"  class="status">录制中</span>
      <span class="time">{{
        dayjs.duration(recordTime, 'seconds').format('HH:mm:ss')
      }}</span>
      <el-button
        :icon="VideoPause"
        type="danger"
        :disabled="status == 1"
        size="large"
        circle
        @click="handleStopRecord"
      />
    </div>
    <div class="opts" v-if="status == 3">
      <span class="status">停止录制中</span>
    </div>
    <div class="opts" v-if="status == 4">
      <span class="status">已停止录制</span>
      <span class="time">{{
        dayjs.duration(recordTime, 'seconds').format('HH:mm:ss')
      }}</span>
      <el-button :icon="Check" size="large" circle @click="handleSaveVideo" />
    </div>
  </section>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { VideoPlay, VideoPause, Check } from '@element-plus/icons-vue'
import { reactive, watch, computed, ref } from 'vue'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
const emits = defineEmits(['stopRecord', 'saveVideo'])
const props = defineProps({
  status: {
    type: Number,
    required: true,
    default: null
  },
  recordTime: {
    type: Number,
    required: true,
    default: null
  }
})
const handleStopRecord = () => {
  emits('stopRecord')
}
const handleSaveVideo = () => {
  emits('saveVideo')
}
</script>
<style scoped>
.Recording {
  flex: 1;
  display: flex;
  flex-direction: column;
  .caputer {
    flex: 1;
  }
  .opts {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    justify-content: center;
    align-items: center;
    padding: 12px 0;
    column-gap: 10px;
    .status {
      font-size: 16px;
      font-weight: 600;
    }
    .time {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
