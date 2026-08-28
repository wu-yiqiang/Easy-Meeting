import { desktopCapturer, ipc, ipcMain } from 'electron'
import { getWindow } from './windowProxy'
import { initWs } from './wsClient'
import { startRecording, stopRecording } from './record.js'
export const onLoginOrRegister = () => {
  ipcMain.handle('loginOrRegister', (e, isLogin) => {
    const login_width = 375
    const login_height = 365
    const register_height = 485
    const mainWindow = getWindow('main')
    mainWindow.setResizable(true)
    mainWindow.setMinimumSize(login_width, login_height)
    if (isLogin) {
      mainWindow.setSize(login_width, login_height)
    } else {
      mainWindow.setSize(login_width, register_height)
    }
    mainWindow.setResizable(false)
  })
}

export const onLoginSuccess = () => {
  ipcMain.handle('loginSuccess', (e, { userInfo, wsUrl }) => {
    const mainWindow = getWindow('main')
    // mainWindow.setResizable(true)
    mainWindow.setMinimumSize(720, 480)
    mainWindow.setSize(720, 480)
    mainWindow.setResizable(true)
    initWs(wsUrl + userInfo.token)
  })
}

export const onGetScreenSource = () => {
  ipcMain.handle('getScreenSource', async (event, opts) => {
    const sources = await desktopCapturer.getSources(opts)
    return sources
      .filter((source) => {
        const size = source.thumbnail.getSize()
        return size.width > 10 && size.height > 10
      })
      .map((source) => ({
        id: source.id,
        name: source.name,
        displayId: source.display_id,
        thumbnail: source.thumbnail.toDataURL()
      }))
  })
}

export const onStartRecording = () => {
  ipcMain.handle('startRecording', async (event, { displayId, mic }) => {
    const sender = event?.sender
    startRecording(sender, displayId, mic)
  })
}

export const onStopRecording = () => {
  ipcMain.handle('stopRecording', async (event) => {
    stopRecording()
  })
}