"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const WebSocket = require("ws");
const icon = path.join(__dirname, "../../resources/icon.png");
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
    console.log("萨达萨达", sources);
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
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
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
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
onLoginOrRegister();
onLoginSuccess();
onGetScreenSource();
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
