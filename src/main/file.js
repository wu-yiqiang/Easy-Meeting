const { app, BrowserWindow, ipcMain } = require('electron')
import fs from 'fs'
import path from 'path'  
import http from 'http';
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv', '.webm']

export const getPathVideos = async () => {
  const fileDir = '/Users/atlas/.easymeeting/'
  try {
    const files = await fs.promises.readdir(fileDir)
    const fileList = await Promise.all(
      files.map(async (file) => {
        const parsedPath = path.parse(file)
        const fullPath = path.join(fileDir, file)
        try {
          const stats = await fs.promises.stat(fullPath)
          return {
            fileName: parsedPath.name, // 不带扩展名的文件名
            ext: parsedPath.ext, // 扩展名（包含点，如 '.mp4'）
            fullName: file, // 完整的文件名（含扩展名）
            fullPath: fullPath, // 文件的绝对路径
            size: stats.size, // 文件大小（字节）
            mtime: stats.mtimeMs, // 修改时间戳
            birthtime: stats.birthtimeMs // 创建时间戳
          }
        } catch (err) {
          // 如果某个文件在读取期间被删除或无权限，打印警告并返回 null
          console.warn(`无法读取文件信息: ${fullPath}`, err.message)
          return null
        }
      })
    )
    // 过滤掉因为报错返回的 null 值
    return fileList.filter(Boolean)
  } catch (error) {
    console.error('读取目录失败:', error)
    return []
  }
}

export const deleteFile = (filePath) => {
  try {
    fs.unlinkSync(filePath)
    return true
  } catch (err) {
    console.error('删除文件出现错误', err)
    return false
  }
}

export const renameFile = (oldFilePath, newFilePath) => {
  try {
    const { fileDir, fileExtend } = getFileInfo(oldFilePath)
    const newPath = path.join(fileDir, `${newFilePath}${fileExtend}`)
    if (oldFilePath === newPath) return true
    fs.renameSync(oldFilePath, newPath)
    return true
  } catch (error) {
    console.error('重命名失败:', error)
    return false
  }
}

export const getFileInfo = (filePath) => {
  try {
    const dir = path.dirname(filePath)
    const ext = path.extname(filePath)
    const name = path.basename(filePath)
    const fileName = path.basename(filePath, ext)
    return { fileDir: dir, fileExtend: ext, fileName, fullName: name }
  } catch (error) {
    return
  }
}

export const mergeFilePath = (fileDir, fileName) => {
  try {
    const newPath = path.join(fileDir, fileName)
    return newPath
  } catch (error) {
    return
  }
}

export const startServer = () => {
  const videoServer = http.createServer((req, res) => {
    // 设置跨域（虽然 Electron 本地请求一般不需要，但加上更稳妥）
    res.setHeader('Access-Control-Allow-Origin', '*')
    // 解析前端传过来的本地视频路径
    const videoPath = decodeURIComponent(req.url.substring(1)) // 去掉开头的 /
    // 检查文件是否存在
    fs.stat(videoPath, (err, stats) => {
      if (err) {
        res.writeHead(404)
        return res.end('Video Not Found')
      }
      const fileSize = stats.size
      const range = req.headers.range // 获取进度条拖拽的请求头
      if (range) {
        // 处理拖拽进度条 (Seek)
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = end - start + 1
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4'
        })
        fs.createReadStream(videoPath, { start, end }).pipe(res)
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes'
        })
        fs.createReadStream(videoPath).pipe(res)
      }
    })
  })
  videoServer.listen(0, '127.0.0.1', () => {
    const port = videoServer.address().port
    console.log(`🎬 本地视频流服务器已启动: http://127.0.0.1:${port}`)
    globalThis.videoPort = port
  })
}