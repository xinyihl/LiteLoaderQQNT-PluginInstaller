const { ipcMain, app, shell, BrowserWindow } = require("electron");
const { install } = require("./api.js");
const fetch = require("node-fetch");
const path = require("path");

let plugin_data;
const urlheader = "https://ghproxy.net/";

const fetchOptions = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
  },
};

app.whenReady().then(() => {
  LiteLoader.api.registerUrlHandler("plugininstaller", (rest, all) => {
    const url = `${urlheader}https://raw.githubusercontent.com/` + rest.join("/");
    openInstallWindow(url);
  });
});

ipcMain.on("LiteLoader.plugininstaller.installByUrl", (event, url) => openInstallWindow(urlheader + url));

async function openInstallWindow(url) {
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
        preload: path.join(__dirname, "preload.js"),
      },
    });

    installWindow.loadFile(path.join(__dirname, "window/install.html"));
  } catch (error) {
    console.error("[Plugininstaller doUrlHandler]", error);
  }
}

ipcMain.on("LiteLoader.plugininstaller.installPlugin", (event) => install(event.sender, plugin_data));

ipcMain.handle("LiteLoader.plugininstaller.WindowInit", (event) => {return plugin_data});

ipcMain.on("LiteLoader.plugininstaller.close", (event) => BrowserWindow.fromWebContents(event.sender).close());

ipcMain.on("LiteLoader.plugininstaller.openWeb", (event, url) => shell.openExternal(url));

ipcMain.on("LiteLoader.plugininstaller.log", (event, level, ...args) => console[{ 0: "debug", 1: "log", 2: "info", 3: "warn", 4: "error" }[level] || "log"](`[!Renderer:Log:${event.sender.id}]`, ...args));

ipcMain.on("LiteLoader.plugininstaller.WindowShow", (event) => BrowserWindow.fromWebContents(event.sender).show());
