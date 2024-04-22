const { ipcMain, app, shell, BrowserWindow } = require("electron");
const { install } = require("./api.js");
const fetch = require("node-fetch");
const path = require("path");

let plugin_data;
let installWindow;

const fetchOptions = {
  headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
  }
};

app.whenReady().then(() => LiteLoader.api.registerUrlHandler("plugininstaller", (rest, url) => doUrlHandler(rest)));

async function doUrlHandler(rest){
  try {
    const url = "https://ghproxy.net/https://raw.githubusercontent.com/" + rest.join("/");

    plugin_data = await (await fetch(url, fetchOptions)).json();
    const downloadtemp = await (await fetch(`https://api.github.com/repos/${plugin_data.repository.repo}/releases/latest`, fetchOptions)).json();
  
    plugin_data.PIurl = downloadtemp.url
      ? "https://ghproxy.net/" + downloadtemp.assets[0].browser_download_url   
      : `https://ghproxy.net/https://github.com/${plugin.repository.repo}/archive/refs/heads/${plugin.repository.branch}.zip`;
  
    openInstallWindow();
  } catch (error) {
    console.error("[Plugininstaller doUrlHandler]", error);
  }
}

function openInstallWindow() {
  installWindow = new BrowserWindow({
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
  installWindow.loadFile(path.join(__dirname, "window/install.html"));
}

ipcMain.on("LiteLoader.plugininstaller.installPlugin", (event) => {
  install(event.sender, plugin_data);
  // console.log("开始安装插件:", plugin_data.slug, plugin_data.PIurl);
  // if(install(plugin_data.PIurl, plugin_data.slug)){
  //   BrowserWindow.fromWebContents(event.sender).close()
  //   console.log("安装成功");
  // }
});

ipcMain.handle("LiteLoader.plugininstaller.WindowInit", (event) => {return plugin_data});

ipcMain.on("LiteLoader.plugininstaller.close", (event) => BrowserWindow.fromWebContents(event.sender).close());

ipcMain.on("LiteLoader.plugininstaller.openWeb", (event, url) => shell.openExternal(url));

ipcMain.on("LiteLoader.plugininstaller.log", (event, level, ...args) => console[{ 0: "debug", 1: "log", 2: "info", 3: "warn", 4: "error" }[level] || "log"](`[!Renderer:Log:${event.sender.id}]`, ...args));

ipcMain.on("LiteLoader.plugininstaller.WindowShow", (event) => BrowserWindow.fromWebContents(event.sender).show());
