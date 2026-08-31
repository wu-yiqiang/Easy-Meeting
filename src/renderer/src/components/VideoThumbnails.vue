<template>
  <section class="VideoThumbnails">
    <video ref="videoRef" playsinline controls poster>
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
              <el-button text type="danger" @click="delVisible = true">删除</el-button>
            </el-space>
          </template>
          <el-icon><More /></el-icon>
        </el-tooltip>
      </div>
    </div>
  </section>

  <el-dialog v-model="visible" title="重命名" align-center width="300">
    <el-form
      ref="renameRef"
      :rules="rules"
      :model="dialogForm"
      label-width="auto"
      style="max-width: 600px"
    >
      <el-form-item label="视频名" prop="fileName">
        <el-input v-model="dialogForm.fileName" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-space>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitRename">保存</el-button>
      </el-space>
    </template>
  </el-dialog>
  <el-dialog
    v-model="delVisible"
    width="260"
    align-center
    title="删除确认"
  >
    <span>确认删除 {{ video?.fileName }} 视频吗？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="delVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDelete(video?.fullPath)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import { ElMessage } from 'element-plus'
import { More } from '@element-plus/icons-vue'
import { reactive, watch, onUnmounted, ref, onMounted, nextTick, computed } from 'vue'
const visible = ref(false)
const renameRef = ref()
let player: Plyr | null = null
const videoRef = ref<HTMLVideoElement>()
const delVisible = ref(false)
const dialogForm = ref({
  fileName: ''
})
const emits = defineEmits(['update', 'delete'])
const props = defineProps({
  video: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
const videoPort = ref<number | null>(null);
const initPlayer = () => {
  if (videoRef.value) {
    // 如果已经初始化过，先销毁旧的实例
    if (player) player.destroy()
    player = new Plyr(videoRef.value, {
      controls: [
        // 'play-large', // 居中大播放按钮
        'play',
        'progress',   // 进度条
        'current-time', 
        'mute',       
        'fullscreen'
      ],
      preload: 'metadata',
    })
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

onUnmounted(() => {
  if (player) {
    player.destroy()
    player = null
  }
})

// ================= 业务逻辑保持不变 =================
const rules = reactive({
  fileName: [{ required: true, message: '视频名必填', trigger: 'blur' }]
})

const submitRename = () => {
  renameRef.value.validate(async (valid) => {
    if (valid) {
      const oldPath = props.video.fullPath
      const success = await window.electron.ipcRenderer.invoke('renameFile', {
        oldPath: oldPath,
        newPath: dialogForm.value.fileName
      })
      if (success) {
        ElMessage({ message: '文件名修改成功', type: 'success', duration: 2000 })
        visible.value = false
        const { fileDir, fileExtend } = await window.electron.ipcRenderer.invoke(
          'fileInfo',
          oldPath
        )
        const newPath = await window.electron.ipcRenderer.invoke('mergeFilePath', {
          fileDir,
          fileName: `${dialogForm.value.fileName}${fileExtend}`
        })
        emits('update', {
          oldFileName: oldPath,
          path: newPath,
          fileName: dialogForm.value.fileName
        })
        return
      }
      ElMessage({ message: '文件名修改失败', type: 'error', duration: 2000 })
    } else {
      console.log('error submit!')
    }
  })
}

const handleDelete = async (filePath) => {
  const success = await window.electron.ipcRenderer.invoke('deleteFile', filePath)
  if (success) {
    ElMessage({ message: '文件删除成功', type: 'success', duration: 2000 })
    delVisible.value = false
    emits('delete', filePath)
  } else {
    ElMessage({ message: '文件删除失败', type: 'error', duration: 2000 })
  }
}

const handleRname = () => {
  dialogForm.value.fileName = props.video.fileName
  visible.value = true
}
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
