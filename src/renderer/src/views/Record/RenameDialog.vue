<template>
    <el-dialog v-if="open" v-model="open" title="重命名" align-center width="300">
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
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" @click="submitRename">保存</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { reactive, watch, computed, ref, onMounted } from 'vue'
const emits = defineEmits(['update','update:value'])
const renameRef = ref()
const dialogForm = ref({
  fileName: ''
})
const props = defineProps({
  value: {
    type: Boolean,
    required: false,
    default: () => null
  },
  video: {
    type: Object,
    required: true,
    default: () => ({})
  }
})
const open = computed({
  get: () => props.value,
  set: (val) => emits('update:value', val)
})
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
        open.value = false
        return
      }
      ElMessage({ message: '文件名修改失败', type: 'error', duration: 2000 })
    } else {
      console.log('error submit!')
    }
  })
}
onMounted(() => {
  console.log("999", props?.video)
  dialogForm.value.fileName = props.video.fileName
})
</script>
<style lang="scss" scoped>
//.RnameDialog{}
</style>
