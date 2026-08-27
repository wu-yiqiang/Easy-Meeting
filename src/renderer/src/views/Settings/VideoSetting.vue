<template>
  <section class="VideoSetting">
    <el-card>
      <template #header>
        <div class="header">视频设置</div>
      </template>
      <el-form label-position="top" label-width="auto" :model="settings">
        <el-form-item label="常规" class="custom-bold-label">
          <el-checkbox v-model="settings.autoOpenCamera" label="入会自动开启摄像头" size="large" />
        </el-form-item>
        <el-form-item label="摄像头" class="custom-bold-label">
          <el-select
    v-model="settings.camera"
    :options="cameraOptions"
    placeholder="Select"
  />
        </el-form-item>
             <el-form-item label="布局" class="custom-bold-label">
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>
<script lang="ts" setup>
import { reactive, watch, computed, ref } from 'vue'
const settings = ref({
  camera: null,
  autoOpenCamera: false
})
const cameraOptions = ref([])
</script>
<style scoped>
.VideoSetting {
  .header {
    font-size: 16px;
    font-weight: 500;
  }
  .custom-bold-label ::v-deep .el-form-item__label {
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
