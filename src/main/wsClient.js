import WebSocket from "ws";
import { getWindow, getWindowmanage } from './windowProxy'
let ws = null
const maxRetries = 5
const retryCount = 0
const HEARTBEAT_INTERVAL = 5000
let heartBeatTimer = null
let neetReconnect = null
let wsUrl = null
export const initWs = (_wsUrl) => {
  wsUrl = _wsUrl
  neetReconnect = true
  connectWs()
}
const wsCheck = () => {
  return import.meta.env.VITE_WS_CHECK === 'true'
}
const connectWs = () => {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN))
  {
    return
  }
  ws = new WebSocket(wsUrl)
  ws.onopen = () => {
    if (retryCount > 0 && wsCheck) {
      const mainWindow = getWindow('main')
      mainWindow.webContents.send('reconnect', true)

    }
    retryCount = 0
    console.log("sdsd")
    startHeartBeat()
  }
  ws.onerror = () => {
    ws.close()
  }
  ws.onclose = () => {
    cleanHeatBeat()
    handleReconnect()
  }
}
const startHeartBeat = () => {
  heartBeatTimer = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send('ping')
    }
  }, HEARTBEAT_INTERVAL)
}

const handleReconnect = () => {
  
}
 
export const cleanHeatBeat = () => {
  clearInterval(heartBeatTimer)
  heartBeatTimer = null 
}