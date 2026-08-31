<template>
  <el-dialog
   v-if="open"
    v-model="open"
    width="260"
    align-center
    title="删除确认"
  >
    <span>确认删除 {{ video?.fileName }} 视频吗？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="open = false">取消</el-button>
        <el-button type="danger" @click="handleDelete(video?.fullPath)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { reactive, watch, computed, ref } from 'vue'
const emits = defineEmits(['update:value', 'delete'])
const props = defineProps({
  value: {
    type: Boolean,
    required: false,
    default: () => null
  },
  video: {
    type: Object,
    required: true,
    default: () => {}
  }
})
const open = computed({
  get: () => props.value,
  set: (val) => emits('update:value', val)
})
const handleDelete = async (filePath) => {
  const success = await window.electron.ipcRenderer.invoke('deleteFile', filePath)
  if (success) {
    ElMessage({ message: '文件删除成功', type: 'success', duration: 2000 })
    open.value = false
    emits('delete', filePath)
  } else {
    ElMessage({ message: '文件删除失败', type: 'error', duration: 2000 })
  }
}
</script>
<style lang="scss" scoped>
//.DelDialog{}
</style>
