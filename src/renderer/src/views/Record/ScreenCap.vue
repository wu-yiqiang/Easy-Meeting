<template>
  <section class="ScreenCap">
   <div class="Captitle">选择录制屏幕</div>
   <div class="CapBox">
    <div v-for="(screenSource, index) in screenSources" :key="index" :class="['Cap',screenDisplayId === screenSource.displayId   ?'selectedCap' : null]" @click="selectSource(screenSource)">
      <Cover :url="screenSource?.thumbnail" />
      <div class="screenName">{{ screenSource?.name }}</div>
    </div>
   </div>
  </section>
</template>
<script lang="ts" setup>
import { reactive, watch, computed, ref, onMounted } from 'vue'
import Cover from '@/components/Cover.vue';
const emit = defineEmits(['update:value'])
// const screenDisplayId = ref()
const screenSources = ref([])
const props = defineProps({
  value: {
    type: String,
    required: false,
    default: () => null
  }
})
const screenDisplayId = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val)
})
const selectSource = (source) => {
  screenDisplayId.value = source.displayId
}
const getScreen = async () => {
  screenSources.value = await window.electron.ipcRenderer.invoke("getScreenSource",{
    types: ['screen'],
    thumbnailSize: {
      width: 600,
      height: 300
    }
  })
  if (!screenSources.value?.length) return
  screenDisplayId.value = screenSources.value[0].displayId
}
onMounted(() => {
  getScreen()
})
</script>
<style  scoped>
.ScreenCap{
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  .Captitle {
    font-size: 16px;
    margin-bottom: 8px;
  }
  .CapBox {
    flex: 1;
    display: grid;
    flex-wrap: wrap;
    gap: 20px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    align-content: start;
    &::-webkit-scrollbar {
      display: none; 
    }
    .Cap {
      border: 1px solid grey;
      border-radius: 4px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      max-width: 360px; 
      .screenName {
        font-size: 16px;
        /* display: flex; */
        text-align: center;
        width: 100%;
        overflow-x: hidden;
        text-overflow: ellipsis;
        text-wrap:nowrap;
      }
    }
    .selectedCap {
      border-color: #409EFF;
    }
  }
}
</style>
