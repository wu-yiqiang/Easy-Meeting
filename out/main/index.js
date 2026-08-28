"use strict";
const electron = require("electron");
const path$1 = require("path");
const utils = require("@electron-toolkit/utils");
const WebSocket = require("ws");
const icon = path$1.join(__dirname, "../../resources/icon.png");
const windowManage = {};
const saveWindow = (id, window) => {
  windowManage[id] = window;
};
const getWindow = (id) => {
  return windowManage[id];
};
let ws = null;
const retryCount = 0;
const HEARTBEAT_INTERVAL = 5e3;
let heartBeatTimer = null;
let wsUrl = null;
const initWs = (_wsUrl) => {
  wsUrl = _wsUrl;
  connectWs();
};
const wsCheck = () => {
  return false;
};
const connectWs = () => {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return;
  }
  ws = new WebSocket(wsUrl);
  ws.onopen = () => {
    if (retryCount > 0 && wsCheck) {
      const mainWindow = getWindow("main");
      mainWindow.webContents.send("reconnect", true);
    }
    retryCount = 0;
    console.log("sdsd");
    startHeartBeat();
  };
  ws.onerror = () => {
    ws.close();
  };
  ws.onclose = () => {
    cleanHeatBeat();
  };
};
const startHeartBeat = () => {
  heartBeatTimer = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send("ping");
    }
  }, HEARTBEAT_INTERVAL);
};
const cleanHeatBeat = () => {
  clearInterval(heartBeatTimer);
  heartBeatTimer = null;
};
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const { app, screen, systemPreferences } = require("electron");
const getResourcePath = () => {
  if (app.isPackaged) {
    return process.resourcesPath;
  }
  return path.join(app.getAppPath(), "resources");
};
const getFFmpegPath = () => {
  const resourcesPath = getResourcePath();
  const platform = process.platform;
  let binaryFolder = "";
  let binaryName = "ffmpeg";
  if (platform === "win32") {
    binaryFolder = "win";
    binaryName = "ffmpeg.exe";
  } else if (platform === "darwin") {
    binaryFolder = "mac";
  } else {
    binaryFolder = "linux";
  }
  return path.join(resourcesPath, binaryFolder, binaryName);
};
let ffmpegProcess = null;
let currentTime = 0;
let sender = null;
const getScreenInfo = (displayId) => {
  const displays = screen.getAllDisplays();
  return displays.find((display) => display.id == displayId);
};
const startRecording = (_sender, displayId, mic) => {
  sender = _sender;
  currentTime = 0;
  const platform = process.platform;
  if (platform === "darwin") {
    const status = systemPreferences.getMediaAccessStatus("screen");
    console.log("屏幕录制权限:", status);
    if (status !== "granted") {
      sender.send("recordError", "未获得屏幕录制权限，请在系统设置中授权");
      return;
    }
  }
  let filePath = "/Users/atlas/.easymeeting/";
  filePath = filePath + (/* @__PURE__ */ new Date()).getTime() + "_temp.mp4";
  const screenInfo = getScreenInfo(displayId);
  if (!screenInfo) {
    console.error("未找到对应的屏幕信息，displayId:", displayId);
    return;
  }
  const { bounds, workArea } = screenInfo;
  const ffmpeg = getFFmpegPath();
  let inputArgs = [];
  let macCropFilter = "";
  if (platform === "win32") {
    inputArgs = [
      "-f",
      "gdigrab",
      "-draw_mouse",
      "1",
      "-framerate",
      "30",
      "-offset_x",
      `${bounds.x}`,
      "-offset_y",
      `${bounds.y}`,
      "-video_size",
      `${workArea.width}x${workArea.height}`,
      "-i",
      "desktop",
      ...mic ? ["-f", "dshow", "-i", `audio=${mic}`] : []
    ];
  } else if (platform === "darwin") {
    const displays = screen.getAllDisplays();
    const screenIndex = displays.findIndex((d) => d.id == displayId);
    const ffmpegScreenId = screenIndex !== -1 ? screenIndex + 1 : 1;
    const scaleFactor = screenInfo.scaleFactor || 1;
    const cropWidth = Math.round(workArea.width * scaleFactor);
    const cropHeight = Math.round(workArea.height * scaleFactor);
    const cropX = Math.max(0, Math.round(bounds.x * scaleFactor));
    const cropY = Math.max(0, Math.round(bounds.y * scaleFactor));
    console.log(
      `屏幕转换: Electron ID=${displayId} → FFmpeg Index=${ffmpegScreenId}, 缩放比=${scaleFactor}`
    );
    inputArgs = [
      "-f",
      "avfoundation",
      "-framerate",
      "30",
      "-pixel_format",
      "uyvy422",
      "-i",
      `${ffmpegScreenId}:${mic || "none"}`
    ];
    macCropFilter = `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`;
  } else if (platform === "linux") {
    inputArgs = [
      "-f",
      "x11grab",
      "-framerate",
      "30",
      "-video_size",
      `${workArea.width}x${workArea.height}`,
      "-i",
      `:0.0+${bounds.x},${bounds.y}`,
      ...mic ? ["-f", "pulse", "-i", "default"] : []
    ];
  }
  const otherArgs = [
    // ✅ 根据平台动态生成 crop 滤镜
    ...platform === "darwin" && macCropFilter ? ["-vf", macCropFilter] : [],
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-crf",
    "18",
    "-g",
    "60",
    "-x264-params",
    "nal-hrd=cbr:force-cfr=1",
    "-c:a",
    "aac",
    "-strict",
    "experimental",
    "-b:a",
    "192k",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "frag_keyframe+empty_moov+faststart",
    "-flush_packets",
    "1",
    "-fflags",
    "+genpts",
    "-max_interleave_delta",
    "0",
    filePath
  ];
  const args = [...inputArgs, ...otherArgs];
  console.log("FFmpeg 命令:", ffmpeg, args.join(" "));
  ffmpegProcess = spawn(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"], detached: true });
  ffmpegProcess.stderr.on("data", (data) => {
    const output = data.toString();
    console.log("FFmpeg:", output);
    const timeMatch = output.match(/time=(\S+)/);
    if (timeMatch && timeMatch[1]) {
      const seconds = parseTime(timeMatch[1]);
      if (seconds > currentTime) {
        sender.send("recordTime", seconds);
        currentTime = seconds;
      }
    }
  });
  ffmpegProcess.on("error", (err) => {
    console.error("FFmpeg 启动失败:", err);
    ffmpegProcess = null;
  });
  ffmpegProcess.on("exit", (code, signal) => {
    console.log("FFmpeg 退出, code:", code, "signal:", signal);
    ffmpegProcess = null;
    repaireVideo(filePath);
  });
};
const repaireVideo = (filePath) => {
  const ffmpeg = getFFmpegPath();
  const args = ["-i", filePath, filePath.replace("_temp", "")];
  const repairProcess = spawn(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"], detached: true });
  repairProcess.on("error", () => {
    console.log("error");
  });
  repairProcess.on("exit", (code) => {
    if (code === 0) {
      fs.unlinkSync(filePath);
      sender.send("finishRecording", filePath.replace("_temp", ""));
    }
  });
};
const stopRecording = () => {
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGINT");
  }
};
const parseTime = (timeStr) => {
  const parts = timeStr.split(":");
  let seconds = 0;
  if (parts.length === 3) {
    seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2].split(".")[0]);
  }
  return seconds;
};
const onLoginOrRegister = () => {
  electron.ipcMain.handle("loginOrRegister", (e, isLogin) => {
    const login_width = 375;
    const login_height = 365;
    const register_height = 485;
    const mainWindow = getWindow("main");
    mainWindow.setResizable(true);
    mainWindow.setMinimumSize(login_width, login_height);
    if (isLogin) {
      mainWindow.setSize(login_width, login_height);
    } else {
      mainWindow.setSize(login_width, register_height);
    }
    mainWindow.setResizable(false);
  });
};
const onLoginSuccess = () => {
  electron.ipcMain.handle("loginSuccess", (e, { userInfo, wsUrl: wsUrl2 }) => {
    const mainWindow = getWindow("main");
    mainWindow.setMinimumSize(720, 480);
    mainWindow.setSize(720, 480);
    mainWindow.setResizable(true);
    initWs(wsUrl2 + userInfo.token);
  });
};
const onGetScreenSource = () => {
  electron.ipcMain.handle("getScreenSource", async (event, opts) => {
    const sources = await electron.desktopCapturer.getSources(opts);
    return sources.filter((source) => {
      const size = source.thumbnail.getSize();
      return size.width > 10 && size.height > 10;
    }).map((source) => ({
      id: source.id,
      name: source.name,
      displayId: source.display_id,
      thumbnail: source.thumbnail.toDataURL()
    }));
  });
};
const onStartRecording = () => {
  electron.ipcMain.handle("startRecording", async (event, { displayId, mic }) => {
    const sender2 = event?.sender;
    startRecording(sender2, displayId, mic);
  });
};
const onStopRecording = () => {
  electron.ipcMain.handle("stopRecording", async (event) => {
    stopRecording();
  });
};
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 375,
    height: 365,
    show: false,
    resizable: false,
    frame: true,
    transparent: false,
    maximizable: true,
    autoHideMenuBar: true,
    backgroundThrottling: false,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path$1.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  saveWindow("main", mainWindow);
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path$1.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.webContents.openDevTools();
}
onLoginOrRegister();
onLoginSuccess();
onGetScreenSource();
onStartRecording();
onStopRecording();
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.EasyMeeting.app");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
