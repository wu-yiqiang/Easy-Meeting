<template>
  <section class="GeneralSetting">
    <el-card>
      <template #header>
        <div class="header">常规设置</div>
      </template>
      <el-form label-position="top" label-width="auto" :model="settings">
        <!-- <el-form-item label="常规" class="custom-bold-label">
          <el-checkbox v-model="settings.autoOpenCamera" label="入会自动开启摄像头" size="large" />
          <el-checkbox v-model="settings.autoOpenMicro" label="入会自动开启麦克风" size="large" />
        </el-form-item> -->
        <el-form-item label="外观" class="custom-bold-label">
          <el-radio-group v-model="settings.mode">
            <el-radio value="auto">跟随系统</el-radio>
            <el-radio value="light">亮色模式</el-radio>
            <el-radio value="dark">深色模式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="文件存储地址" class="custom-bold-label">
          <el-input v-model="settings.fileSavePath" placeholder="请输入文件保存路径" />
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>
<script lang="ts" setup>
import { reactive, watch, computed, ref } from 'vue'
const settings = ref({
  autoOpenCamera: false,
  autoOpenMicro: false,
  mode: 'auto',
  fileSavePath: '/home/sutter/download'
})
</script>
<style scoped>
.GeneralSetting {
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
