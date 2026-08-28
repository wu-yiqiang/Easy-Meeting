<template>
  <section class="RecordSetting">
    <el-card>
      <template #header>
        <div class="header">录制设置</div>
      </template>
      <el-form label-position="top" label-width="auto" :model="settings">
        <!-- <el-form-item label="常规" class="custom-bold-label">
          <el-checkbox v-model="settings.autoOpenMicro" label="入会自动开启麦克风" size="large" />
        </el-form-item>
        <el-form-item label="扬声器" class="custom-bold-label">
          
        </el-form-item> -->
        <el-form-item label="文件录制保存地址" class="custom-bold-label">
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
  fileSavePath: '/Users/atlas/.easymeeting/'
})
</script>
<style scoped>
.RecordSetting {
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

