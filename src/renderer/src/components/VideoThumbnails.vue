<template>
  <section class="VideoThumbnails">
    <video ref="videoRef" playsinline controls>
      <source :src="videoStreamUrl" type="video/mp4" />
      您的浏览器不支持 HTML5 视频标签。
    </video>
    <div class="bottom-box">
      <div class="title">{{ video?.fileName }}</div>
      <div class="opts">
        <el-tooltip effect="light" placement="bottom">
          <template #content>
            <el-space direction="vertical" @click.stop>
              <el-button text @click="handleRname">重命名</el-button>
              <el-button text type="danger" @click="handleDelete">删除</el-button>
            </el-space>
          </template>
          <el-icon><More /></el-icon>
        </el-tooltip>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import { More } from '@element-plus/icons-vue'
import { reactive, watch, onUnmounted, ref, onMounted, nextTick, computed, watchEffect } from 'vue'
const player = ref()
const videoRef = ref<HTMLVideoElement>()
const emits = defineEmits(['update', 'delete', 'rename', 'play'])
const props = defineProps({
  video: {
    type: Object,
    required: true,
    default: () => ({})
  },
  playFileFullPath: {
    type: String,
    required: true,
    default: ""
  }
})
const videoPort = ref<number | null>(null);
const initPlayer = () => {
  if (videoRef.value) {
    // 如果已经初始化过，先销毁旧的实例
    if (player.value) player.value.destroy()
    player.value = new Plyr(videoRef.value, {
      controls: [
        // 'play-large', // 居中大播放按钮
        'play',
        'progress',   // 进度条
        'current-time', 
        'mute',       
        'fullscreen'
      ],
    })
    player.value.on('play', (event) => {
      emits('play', props.video?.fullPath)
    });
  }
}

onMounted(async () => {
   try {
     videoPort.value = await window.electron.ipcRenderer.invoke('getVideoPort');
    nextTick(() => initPlayer())
  } catch (error) {
    console.error('获取视频端口失败:', error);
  }
})

const videoStreamUrl = computed(() => {
  if (!videoPort.value || !props.video?.fullPath) return '';
  const encodedPath = encodeURIComponent(props.video.fullPath);
  return `http://127.0.0.1:${videoPort.value}/${encodedPath}`;
});
const videoPause = () => {
  if (player.value) {
    player.value.pause()
  }
}
watchEffect(() => {
  if (props.playFileFullPath === props.video?.fullPath) return
  videoPause()
})
const handleRname = () => {
  emits('rename', props?.video)
}
const handleDelete = () => {
  emits('delete', props?.video)
}
onUnmounted(() => {
  if (player.value) {
    player.value.destroy()
    player.value = null
  }
})
</script>

<style lang="scss" scoped>
.VideoThumbnails {
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border: 1px solid #409eff;
  height: max-content;
  max-width: 280px; 
  video {
    aspect-ratio: 16 / 9;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    // background-color: #000; // 添加黑色背景，避免未加载时显示空白
  }
  .bottom-box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-radius: 0 0 4px 4px;
    padding: 2px 8px;
    .title {
      flex: 1;
      padding: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap; // 修正 text-wrap: nowrap 为标准的 white-space
      text-align: center;
    }

    .opts {
      cursor: pointer;
    }
  }
}
</style>
