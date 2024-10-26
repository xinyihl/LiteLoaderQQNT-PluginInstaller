const { ipcMain, app, shell, BrowserWindow } = require("electron");
const { fetchOptions } = require("./main_modules/options.js");
const { UorI } = require("./main_modules/pluginApi.js");
const fetch = require("node-fetch");
const path = require("path");

let plugin_data; // 插件信息缓存
let plugin_update_data; // 插件更新信息缓存
let apiLimit = false; // github API调用是否被限制

app.whenReady().then(() => {
  if(!LiteLoader.plugins["protocio"]) return;
  LiteLoader.api.registerUrlHandler("plugininstaller", async (rest, all) => {
    const url = `https://raw.githubusercontent.com/` + rest.join("/");
    await initPluginData(url); 
    openPluginInfoWindow();
  });
});

ipcMain.on("LiteLoader.plugininstaller.restart", (event) => { app.relaunch(); app.exit(); });

ipcMain.handle("LiteLoader.plugininstaller.chackPluginUpdate", (event, slug) => chackPluginUpdate(slug));

ipcMain.on("LiteLoader.plugininstaller.installByUrl", async (event, url) => { await initPluginData(url); openPluginInfoWindow();});

ipcMain.on("LiteLoader.plugininstaller.updateBySlug", (event, slug) => openPluginInfoWindowBySlug(slug));

ipcMain.on("LiteLoader.plugininstaller.installPlugin", (event, plugin) => UorI(event.sender, plugin));

ipcMain.handle("LiteLoader.plugininstaller.WindowInit", (event) => { return plugin_data; });

ipcMain.on("LiteLoader.plugininstaller.close", (event) => BrowserWindow.fromWebContents(event.sender).close());

ipcMain.on("LiteLoader.plugininstaller.openWeb", (event, url) => shell.openExternal(url));

ipcMain.on("LiteLoader.plugininstaller.log", (event, level, ...args) => console[{ 0: "debug", 1: "log", 2: "info", 3: "warn", 4: "error" }[level] || "log"](`[!Renderer:Log:${event.sender.id}]`, ...args));

ipcMain.on("LiteLoader.plugininstaller.WindowShow", (event) => BrowserWindow.fromWebContents(event.sender).show());

ipcMain.handle("LiteLoader.plugininstaller.initUpdatePluginData", (event, slug) => initUpdatePluginData(slug));

ipcMain.on("LiteLoader.plugininstaller.openPluginInfoWindow", (event) => openPluginInfoWindow());

async function initUpdatePluginData(slug) {
  const isInstall = LiteLoader.plugins[slug] ? true : false;
  if(!isInstall) {
    console.error("[Plugininstaller openPluginInfoWindow]", slug, "Plugin not found");
    return;
  }
  const plugin = LiteLoader.plugins[slug].manifest;
  const url = `https://raw.githubusercontent.com/${plugin.repository.repo}/${plugin.repository.branch}/manifest.json`;
  await initPluginData(url);
  return plugin_data;
}

async function initPluginData(url) {
  if (plugin_data && plugin_data.PIInfoUrl == url) return;
  try {
    plugin_data = await (await fetch(url, await fetchOptions())).json();
    plugin_data.PIurl = plugin_data.repository?.release?.file ? `https://github.com/${plugin_data.repository.repo}/releases/latest/download/${plugin_data.repository?.release?.file}` : `https://github.com/${plugin_data.repository.repo}/archive/${plugin_data.repository.branch}.zip`;
    plugin_data.PIUpdateBody = "# github API 超限无法获取更新日志";
    // 当 github API 未被限制时使用 github API 获取下载地址
    if(!apiLimit){
      const downloadtemp = await (await fetch(`https://api.github.com/repos/${plugin_data.repository.repo}/releases/latest`, await fetchOptions())).json();
      if(downloadtemp.message?.includes("API rate limit")){ apiLimit = true; }
      if(downloadtemp.assets){ plugin_data.PIurl = downloadtemp.assets[0] ? downloadtemp.assets[0].browser_download_url : downloadtemp.zipball_url; }
      if(downloadtemp.body){plugin_data.PIUpdateBody = downloadtemp.body;}
    }

    const isInstall = LiteLoader.plugins[plugin_data.slug] ? true : false;
    
    if(plugin_data.PIinstall === false) {
      plugin_data.PIinstall = 0; // 插件作者禁用自动安装
    }else{
      if(isInstall){
        if(LiteLoader.plugins[plugin_data.slug].manifest.version != plugin_data.version){
          plugin_data.PIinstall = 1; // 插件需要更新
        }else{
          plugin_data.PIinstall = 2; // 插件已安装且无需更新
        }
      }else{
        plugin_data.PIinstall = 3; // 插件未安装
      }
    }

    plugin_data.PIInfoUrl = url;

  } catch (error) {
    console.error("[Plugininstaller initPluginData]", error);
  }
}

async function openPluginInfoWindow() {
  const installWindow = new BrowserWindow({
    frame: false,
    resizable: false,
    show: false,
    width: 600,
    height: 200,
    webPreferences: {
      preload: path.join(__dirname, "../src/window/install_preload.js"),
    },
  });
  installWindow.loadFile(path.join(__dirname, "../src/window/install.html"));
}

async function openPluginInfoWindowBySlug(slug) {
  const isInstall = LiteLoader.plugins[slug] ? true : false;
  if(!isInstall) {
    console.error("[Plugininstaller openPluginInfoWindow]", slug, "Plugin not found");
    return;
  }
  const plugin = LiteLoader.plugins[slug].manifest;
  const url = `https://raw.githubusercontent.com/${plugin.repository.repo}/${plugin.repository.branch}/manifest.json`;
  await initPluginData(url);
  openPluginInfoWindow();
}

async function chackPluginUpdate(slug) {
  if (slug && plugin_update_data) {
    return plugin_update_data;
  } else {
    let list = [];
    let update = [];
    for (const [slug, plugin] of Object.entries(LiteLoader.plugins)) {
      if (plugin.disabled || plugin.incompatible) {
        continue;
      }
      list.push(
        (async () => {
          try {
            return await (await fetch(`https://raw.githubusercontent.com/${plugin.manifest.repository.repo}/${plugin.manifest.repository.branch}/manifest.json`, await fetchOptions())).json();
          } catch {
            return Promise.resolve(null);
          }
        })()
      );
    }

    const plugins = await Promise.all(list)
    plugins.filter((notNull) => notNull).forEach((plugin) => {
      if (plugin.version > LiteLoader.plugins[plugin.slug].manifest.version) {
        plugin.PIoldversion = LiteLoader.plugins[plugin.slug].manifest.version;
        update.push(plugin);
      }
    })

    plugin_update_data = update;
    return update;
  }
}

LiteLoader.api.openPluginInfoWindow = openPluginInfoWindowBySlug;