<template>
  <section class="MicroIcon">
    <div class="mic-show" :style="{ width: size + 'px', height: size + 'px' }">
      <el-icon v-if="microDeviceInfo?.open && microDeviceInfo?.enabel" class="icon-mic"
        ><Microphone
      /></el-icon>
      <el-icon v-else class="icon-mic-close"><Mute /></el-icon>
      <div class="volume" :style="{ height: volume * 1.5 + 'px' }"></div>
    </div>
    <div v-if="showLabel" :class="['mic-label', microDeviceInfo?.open ? 'active' : '']">
      {{ microDeviceInfo?.label }}
    </div>
  </section>
</template>
<script lang="ts" setup>
import { Microphone, Mute } from '@element-plus/icons-vue'
import { reactive, watch, computed, ref, onMounted } from 'vue'
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  size: {
    type: Number,
    default: 30
  },
  modelValue: {
    type: Object,
    default: {}
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  defaultOpen: {
    type: Boolean,
    default: false
  }
})
let analyser
let microphone
let stream
const volume = ref(0)
const microDeviceInfo = ref({})
const getMicroPhone = async () => {
  let devices = []
  try {
    devices = await navigator.mediaDevices.enumerateDevices()
  } catch (error) {
  } finally {
    let defaultMic = devices?.find((device) => {
      return device.kind == 'audioinput' && device.deviceId == 'default'
    })
    if (!defaultMic) {
      microDeviceInfo.value = {
        deviceId: '0',
        label: '未获取到麦克风',
        open: false,
        enabel: false
      }
      emits('update:modelValue', microDeviceInfo.value)
      return
    }
    const constraints = {
      audio: {
        deviceId: defaultMic.deviceId ? { exact: defaultMic.deviceId } : undefined
      },
      video: false
    }
    stream = await navigator.mediaDevices.getUserMedia(constraints).catch((error) => {})
    microDeviceInfo.value = {
      deviceId: defaultMic.deviceId,
      label: defaultMic.label,
      open: props.defaultOpen,
      enabel: stream != null
    }
    emits('update:modelValue', microDeviceInfo.value)
    if (!microDeviceInfo.value.enabel) return
    if (props.defaultOpen) {
      showAnimation()
    }
  }
}

const showAnimation = () => {
  if (!stream) return
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048
  microphone = audioContext.createMediaStreamSource(stream)
  microphone.connect(analyser)
  animate()
}
const animate = () => {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteTimeDomainData(dataArray)
  analyser.getByteFrequencyData(dataArray)
  calculateVolume(dataArray)
  requestAnimationFrame(() => {
    animate()
  })
}

const calculateVolume = (dataArray) => {
  let sum = 0
  for (let index = 0; index < dataArray.length; index++) {
    sum += dataArray[index]
  }
  const average = sum / dataArray.length
  volume.value = Math.min(100, Math.round((average/255) * 100))
}
const stopAnimation = () => {
  if (microphone && analyser) {
    microphone.disconnect()
  }
}

const toggleMic = () => {
  if (!microDeviceInfo.value.enabel) return
  microDeviceInfo.value.open = !microDeviceInfo.value.open
  emits('update:modelValue', microDeviceInfo.value)
  if (microDeviceInfo.value.open) {
    showAnimation()
  } else {
    stopAnimation()
  }
}

onMounted(() => {
  getMicroPhone()
})
defineExpose({
  toggleMic
})
</script>
<style lang="scss" scoped>
.MicroIcon {
  align-items: center;
  display: flex;
  .mic-show {
    background: #ddd;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    .icon-mic {
      color: var(--blue);
    }
    .icon-mic-close {
      color: #5b5b5b;
    }
    .volume {
      position: absolute;
      left: 0px;
      right: 0px;
      bottom: 0px;
      background: rgba(52, 119, 235, 0.3);
    }
  }
  .mic-label {
    margin-left: 5px;
    font-size: 14px;
    color: #8b8b8b;
    cursor: pointer;
  }
  .active {
    color: #494949;
  }
}
</style>
