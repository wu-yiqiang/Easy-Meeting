<template>
  <section class="Layout">
    <div class="tabs">
      <el-radio-group v-model="tabPosition">
        <el-radio-button value="metting">会议</el-radio-button>
        <el-radio-button value="contact">通讯录</el-radio-button>
        <el-radio-button value="record">录制</el-radio-button>
        <el-radio-button value="settings">设置</el-radio-button>
      </el-radio-group>
    </div>
    <div class="contents">
      <Metting v-if="tabPosition == 'metting'" />
      <Record v-if="tabPosition == 'record'" />
      <Contact v-if="tabPosition == 'contact'" />
      <Settings v-if="tabPosition == 'settings'" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import Metting from './Metting.vue';
import Record from '@/views/Record/index.vue'
import Contact from './Contact.vue';
import Settings from '@/views/Settings/index.vue';
import { ref } from 'vue'
const tabPosition = ref('metting')
</script>

<style scoped>
.Layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  .tabs {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
  }
  .demo-tabs > .el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
  }

  .el-tabs--right .el-tabs__content,
  .el-tabs--left .el-tabs__content {
    height: 100%;
  }
  .contents {
    flex: 1;
    display: flex;
    padding: 14px;
    overflow: hidden;
  }
}
</style>
