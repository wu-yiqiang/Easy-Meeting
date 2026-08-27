<template>
  <section class="VoiceSetting">
    <el-card>
      <template #header>
        <div class="header">音频设置</div>
      </template>
      <el-form label-position="top" label-width="auto" :model="settings">
        <el-form-item label="常规" class="custom-bold-label">
          <el-checkbox v-model="settings.autoOpenMicro" label="入会自动开启麦克风" size="large" />
        </el-form-item>
        <el-form-item label="扬声器" class="custom-bold-label">
          <el-col>
            <el-row>
              <el-select
                v-model="settings.speaker"
                :options="speakerOptions"
                placeholder="Select"
              />
            </el-row>
            <el-row>
              <div class="input-volum">
                <span class="input-volum-label">输出音量</span>
                <div class="slide"><el-slider v-model="settings.outputVolum" /></div>
              </div>
            </el-row>
          </el-col>
        </el-form-item>
        <el-form-item label="麦克风" class="custom-bold-label">
          <el-col :span="24">
            <el-row>
              <el-select
                v-model="settings.microPhone"
                :options="microPhoneOptions"
                placeholder="Select"
              />
            </el-row>
            <el-row>
              <div class="input-volum">
                <span class="input-volum-label">输入音量</span>
                <div class="slide"><el-slider v-model="settings.inputVolum" /></div>
              </div>
            </el-row>
          </el-col>
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>
<script lang="ts" setup>
import { reactive, watch, computed, ref } from 'vue'
import { ElProgress } from 'element-plus'
const settings = ref({
  microPhone: null,
  speaker: null,
  autoOpenMicro: false,
  inputVolum: 20,
  outputVolum: 30
})
const microPhoneOptions = ref([])
const speakerOptions = ref([])
</script>
<style scoped>
.VoiceSetting {
  .header {
    font-size: 16px;
    font-weight: 500;
  }
  .custom-bold-label ::v-deep .el-form-item__label {
    font-size: 14px;
    font-weight: 500;
    .input-volum {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  .input-volum {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: 10px;
    .slide {
      flex: 1;
    }
  }
}
</style>
