const { ipcMain, app, shell, BrowserWindow } = require("electron");
const { fetchOptions } = require("./main_models/options.js");
const { UorI } = require("./main_models/pluginApi.js");
const fetch = require("node-fetch");
const path = require("path");

let plugin_data;

app.whenReady().then(() => {
  if(!LiteLoader.plugins["protocio"]) return;
  LiteLoader.api.registerUrlHandler("plugininstaller", (rest, all) => {
    const url = `https://raw.githubusercontent.com/` + rest.join("/");
    openPluginInfoWindow(url);
  });
});

ipcMain.on("LiteLoader.plugininstaller.restart", (event) => {
  app.relaunch();
  app.exit();
});

ipcMain.on("LiteLoader.plugininstaller.installByUrl", (event, url) => openPluginInfoWindow(url));

ipcMain.on("LiteLoader.plugininstaller.installPlugin", (event, plugin) => UorI(event.sender, plugin));

ipcMain.handle("LiteLoader.plugininstaller.WindowInit", (event) => { return plugin_data; });

ipcMain.on("LiteLoader.plugininstaller.close", (event) => BrowserWindow.fromWebContents(event.sender).close());

ipcMain.on("LiteLoader.plugininstaller.openWeb", (event, url) => shell.openExternal(url));

ipcMain.on("LiteLoader.plugininstaller.log", (event, level, ...args) => console[{ 0: "debug", 1: "log", 2: "info", 3: "warn", 4: "error" }[level] || "log"](`[!Renderer:Log:${event.sender.id}]`, ...args));

ipcMain.on("LiteLoader.plugininstaller.WindowShow", (event) => BrowserWindow.fromWebContents(event.sender).show());

async function initPluginData(url) {
  try {
    plugin_data = await (await fetch(url, await fetchOptions())).json();

    const isInstall = LiteLoader.plugins[plugin_data.slug] ? true : false;
    const downloadtemp = await (await fetch(`https://api.github.com/repos/${plugin_data.repository.repo}/releases/latest`, await fetchOptions())).json();

    plugin_data.PIurl = downloadtemp.url ? downloadtemp.assets[0].browser_download_url : `https://github.com/${plugin_data.repository.repo}/archive/${plugin_data.repository.branch}.zip`;


    plugin_data.PIupdatemode = isInstall ? plugin_data.version > LiteLoader.plugins[plugin_data.slug].manifest.version : false;
    if(!plugin_data.PIinstall) plugin_data.PIinstall = isInstall ?  LiteLoader.plugins[plugin_data.slug].manifest.version != plugin_data.version : true;
    
  } catch (error) {
    console.error("[Plugininstaller initPluginData]", error);
  }
}

async function openPluginInfoWindow(url) {
  await initPluginData(url);
  const installWindow = new BrowserWindow({
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
      preload: path.join(__dirname, "window/install_preload.js"),
    },
  });
  installWindow.loadFile(path.join(__dirname, "window/install.html"));
}

LiteLoader.api.openPluginInfoWindow = (slug) => {
  const isInstall = LiteLoader.plugins[slug] ? true : false;
  if(!isInstall) {
    console.error("[Plugininstaller openPluginInfoWindow]", slug, "Plugin not found");
    return;
  }
  const plugin = LiteLoader.plugins[slug].manifest;
  const url = `https://raw.githubusercontent.com/${plugin.repository.repo}/${plugin.repository.branch}/manifest.json`;
  openPluginInfoWindow(url)
};
