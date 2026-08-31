const fs = require('fs')
const { spawn } = require('child_process')
const path = require('path')
const { app, screen, systemPreferences } = require('electron')

const getResourcePath = () => {
  if (app.isPackaged) {
    return process.resourcesPath
  }
  return path.join(app.getAppPath(), 'resources')
}

const getFFmpegPath = () => {
  const resourcesPath = getResourcePath()
  const platform = process.platform
  let binaryFolder = ''
  let binaryName = 'ffmpeg'
  if (platform === 'win32') {
    binaryFolder = 'win'
    binaryName = 'ffmpeg.exe'
  } else if (platform === 'darwin') {
    binaryFolder = 'mac'
  } else {
    binaryFolder = 'linux'
  }
  return path.join(resourcesPath, binaryFolder, binaryName)
}

let ffmpegProcess = null
let currentTime = 0
let sender = null

const getScreenInfo = (displayId) => {
  const displays = screen.getAllDisplays()
  return displays.find((display) => display.id == displayId)
}

export const startRecording = (_sender, displayId, mic) => {
  sender = _sender
  currentTime = 0
  const platform = process.platform
  // ✅ macOS 屏幕录制权限检查
  if (platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus('screen')
    console.log('屏幕录制权限:', status)
    if (status !== 'granted') {
      sender.send('recordError', '未获得屏幕录制权限，请在系统设置中授权')
      return
    }
  }

  let filePath = '/Users/atlas/.easymeeting/'
  filePath = filePath + new Date().getTime() + '_temp.mp4'

  const screenInfo = getScreenInfo(displayId)
  if (!screenInfo) {
    console.error('未找到对应的屏幕信息，displayId:', displayId)
    return
  }
  const { bounds, workArea } = screenInfo
  const ffmpeg = getFFmpegPath()

  let inputArgs = []
  // 用于暂存 macOS 下的 crop 滤镜参数
  let macCropFilter = ''

  if (platform === 'win32') {
    inputArgs = [
      '-f',
      'gdigrab',
      '-draw_mouse',
      '1',
      '-framerate',
      '30',
      '-offset_x',
      `${bounds.x}`,
      '-offset_y',
      `${bounds.y}`,
      '-video_size',
      `${workArea.width}x${workArea.height}`,
      '-i',
      'desktop',
      ...(mic ? ['-f', 'dshow', '-i', `audio=${mic}`] : [])
    ]
  } else if (platform === 'darwin') {
    const displays = screen.getAllDisplays()
    const screenIndex = displays.findIndex((d) => d.id == displayId)
    // ⚠️ 核心修复1：macOS 的 avfoundation 视频设备列表中，摄像头通常是 0，屏幕从 1 开始
    const ffmpegScreenId = screenIndex !== -1 ? screenIndex + 1 : 1
    // ⚠️ 核心修复2：获取屏幕的真实物理缩放比例（Retina 屏幕通常为 2）
    const scaleFactor = screenInfo.scaleFactor || 1
    // 将逻辑坐标和尺寸转换为 FFmpeg 需要的物理像素坐标
    const cropWidth = Math.round(workArea.width * scaleFactor)
    const cropHeight = Math.round(workArea.height * scaleFactor)
    // 限制坐标最小为 0，防止多显示器副屏在左侧时出现负数导致 FFmpeg 报错
    const cropX = Math.max(0, Math.round(bounds.x * scaleFactor))
    const cropY = Math.max(0, Math.round(bounds.y * scaleFactor))

    console.log(
      `屏幕转换: Electron ID=${displayId} → FFmpeg Index=${ffmpegScreenId}, 缩放比=${scaleFactor}`
    )

    inputArgs = [
      '-f',
      'avfoundation',
      '-framerate',
      '30',
      '-pixel_format',
      'uyvy422',
      '-i',
      `${ffmpegScreenId}:${mic || 'none'}`
    ]

    // 生成物理像素级别的 crop 滤镜
    macCropFilter = `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`
  } else if (platform === 'linux') {
    inputArgs = [
      '-f',
      'x11grab',
      '-framerate',
      '30',
      '-video_size',
      `${workArea.width}x${workArea.height}`,
      '-i',
      `:0.0+${bounds.x},${bounds.y}`,
      ...(mic ? ['-f', 'pulse', '-i', 'default'] : [])
    ]
  }

  const otherArgs = [
    // ✅ 根据平台动态生成 crop 滤镜
    ...(platform === 'darwin' && macCropFilter ? ['-vf', macCropFilter] : []),
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '18',
    '-g',
    '60',
    '-x264-params',
    'nal-hrd=cbr:force-cfr=1',
    '-c:a',
    'aac',
    '-strict',
    'experimental',
    '-b:a',
    '192k',
    '-ar',
    '44100',
    '-ac',
    '2',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    'frag_keyframe+empty_moov+faststart',
    '-flush_packets',
    '1',
    '-fflags',
    '+genpts',
    '-max_interleave_delta',
    '0',
    filePath
  ]

  const args = [...inputArgs, ...otherArgs]
  console.log('FFmpeg 命令:', ffmpeg, args.join(' '))

  ffmpegProcess = spawn(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'], detached: true })

  ffmpegProcess.stderr.on('data', (data) => {
    const output = data.toString()
    console.log('FFmpeg:', output)
    const timeMatch = output.match(/time=(\S+)/)
    if (timeMatch && timeMatch[1]) {
      const seconds = parseTime(timeMatch[1])
      if (seconds > currentTime) {
        sender.send('recordTime', seconds)
        currentTime = seconds
      }
    }
  })

  ffmpegProcess.on('error', (err) => {
    console.error('FFmpeg 启动失败:', err)
    ffmpegProcess = null
  })

  ffmpegProcess.on('exit', (code, signal) => {
    console.log('FFmpeg 退出, code:', code, 'signal:', signal)
    ffmpegProcess = null
    repaireVideo(filePath)
  })
}

const repaireVideo = (filePath) => {
  const ffmpeg = getFFmpegPath()
  const args = ['-i', filePath, filePath.replace('_temp', '')]
  const repairProcess = spawn(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'], detached: true })

  repairProcess.on('error', () => {
    console.log('error')
  })

  repairProcess.on('exit', (code) => {
    if (code === 0) {
      fs.unlinkSync(filePath)
      sender.send('finishRecording', filePath.replace('_temp', ''))
    }
  })
}

export const stopRecording = () => {
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGINT')
  }
}

const parseTime = (timeStr) => {
  const parts = timeStr.split(':')
  let seconds = 0
  if (parts.length === 3) {
    seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2].split('.')[0])
  }
  return seconds
}

export const getVideoThumbnail = (videoPath) => {
  return new Promise((resolve) => {
    const ffmpeg = getFFmpegPath()
    const thumbnailPath = videoPath.replace(/\.[^/.]+$/, '') + '_cover.jpg'
    const args = [
      '-i',
      videoPath, // 输入视频路径
      '-ss',
      '00:00:00.1', // 截取 0.1 秒处的画面（避免 0 秒是黑屏）
      '-vframes',
      '1', // 只提取 1 帧
      '-q:v',
      '2', // 图片质量（2-31，数字越小质量越高）
      '-y', // 覆盖已存在的同名文件
      thumbnailPath
    ]
    const thumbProcess = spawn(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    thumbProcess.on('error', (err) => {
      console.error('FFmpeg 截帧启动失败:', err)
      resolve({ success: false, error: err.message })
    })
    thumbProcess.on('close', (code) => {
      if (code === 0) {
        console.log('封面图生成成功:', thumbnailPath)
        resolve({ success: true, thumbnailPath })
      } else {
        console.error('FFmpeg 截帧失败，退出码:', code)
        resolve({ success: false, error: '截帧失败' })
      }
    })
  })
}