const { ipcMain, app, shell, BrowserWindow } = require("electron");
const { UorI } = require("./main_models/pluginApi.js");
const { urlheader, fetchOptions, initurlheader } = require("./main_models/options.js");
const fetch = require("node-fetch");
const path = require("path");

initurlheader();

let plugin_data;

app.whenReady().then(() => {
  LiteLoader.api.registerUrlHandler("plugininstaller", (rest, all) => {
    const url =
      `${urlheader}https://raw.githubusercontent.com/` + rest.join("/");
    openPluginInfoWindow(url);
  });
});

ipcMain.on("LiteLoader.plugininstaller.installByUrl", (event, url) =>
  openPluginInfoWindow(urlheader + url)
);

ipcMain.on("LiteLoader.plugininstaller.installPlugin", (event, plugin) =>
  UorI(event.sender, plugin)
);

ipcMain.handle("LiteLoader.plugininstaller.WindowInit", (event) => {
  return plugin_data;
});

ipcMain.on("LiteLoader.plugininstaller.close", (event) =>
  BrowserWindow.fromWebContents(event.sender).close()
);

ipcMain.on("LiteLoader.plugininstaller.openWeb", (event, url) =>
  shell.openExternal(url)
);

ipcMain.on("LiteLoader.plugininstaller.log", (event, level, ...args) =>
  console[
    { 0: "debug", 1: "log", 2: "info", 3: "warn", 4: "error" }[level] || "log"
  ](`[!Renderer:Log:${event.sender.id}]`, ...args)
);

ipcMain.on("LiteLoader.plugininstaller.WindowShow", (event) =>
  BrowserWindow.fromWebContents(event.sender).show()
);

async function initPluginData(url, updatemode) {
  try {
    plugin_data = await (await fetch(url, fetchOptions)).json();
    const downloadtemp = await (
      await fetch(
        `https://api.github.com/repos/${plugin_data.repository.repo}/releases/latest`,
        fetchOptions
      )
    ).json();

    plugin_data.PIurl = downloadtemp.url
      ? urlheader + downloadtemp.assets[0].browser_download_url
      : `${urlheader}https://github.com/${plugin.repository.repo}/archive/refs/heads/${plugin.repository.branch}.zip`;
    plugin_data.PIupdatemode = updatemode;
  } catch (error) {
    console.error("[Plugininstaller initPluginData]", error);
  }
}

async function openPluginInfoWindow(url, updatemode = false) {
  await initPluginData(url, updatemode);
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
