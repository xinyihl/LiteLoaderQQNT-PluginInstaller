const { ipcMain, app, shell, BrowserWindow } = require("electron");
const { request, install } = require("./api.js");
const path = require("path");
let plugin_url = "";

app.whenReady().then(() => {
  LiteLoader.api.registerUrlHandler("plugininstaller", (rest, url) => {
    plugin_url = "https://ghproxy.net/https://raw.githubusercontent.com/";
    plugin_url += rest.join("/");
    openInstallWindow();
  });
});

function openInstallWindow() {
  const newWindow = new BrowserWindow({
    frame: false,
    resizable: false,
    show: false,
    width: 600,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      plugins: true,
      sandbox: true,
      webviewTag: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js")
    }
  });
  newWindow.loadFile(path.join(__dirname, "window/install.html"));
}

ipcMain.on("LiteLoader.plugininstaller.installPlugin", (event, url, slug) => {
  console.log("开始安装插件:", slug, url);
  if(install(url, slug)){
    BrowserWindow.fromWebContents(event.sender).close()
    console.log("安装成功");
  }
});

ipcMain.handle("LiteLoader.plugininstaller.WindowInit", (event) => request(plugin_url));

ipcMain.handle("LiteLoader.plugininstaller.getWebRequest", (event, url) => request(url));

ipcMain.on("LiteLoader.plugininstaller.close", (event) => BrowserWindow.fromWebContents(event.sender).close());

ipcMain.on("LiteLoader.plugininstaller.openWeb", (event, url) => shell.openExternal(url));

ipcMain.on("LiteLoader.plugininstaller.log", (event, level, ...args) => console[{ 0: "debug", 1: "log", 2: "info", 3: "warn", 4: "error" }[level] || "log"](`[!Renderer:Log:${event.sender.id}]`, ...args));

ipcMain.on("LiteLoader.plugininstaller.WindowShow", (event) => BrowserWindow.fromWebContents(event.sender).show());
