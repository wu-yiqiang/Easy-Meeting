<template>
  <section class="Settings">
    <GeneralSetting />
    <VideoSetting />
    <VoiceSetting />
    <RecordSetting />
  </section>
</template>
<script lang="ts" setup>
import { reactive, watch, computed, ref } from 'vue'
import GeneralSetting from './GeneralSetting.vue';
import VideoSetting from './VideoSetting.vue';
import VoiceSetting from './VoiceSetting.vue';
import RecordSetting from './RecordSetting.vue';
</script>
<style scoped>
.Settings{
  flex: 1;
  display: grid;
  row-gap: 10px;
  overflow-y: auto;
}
</style>
