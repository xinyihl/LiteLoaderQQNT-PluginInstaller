const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("plugininstaller", {
    log: (level, ...serializedArgs) => ipcRenderer.send("LiteLoader.plugininstaller.log", level, ...serializedArgs),
    close: () => ipcRenderer.send("LiteLoader.plugininstaller.close"),
    openWeb: (url) => ipcRenderer.send("LiteLoader.plugininstaller.openWeb", url),
    WindowInit: () => ipcRenderer.invoke("LiteLoader.plugininstaller.WindowInit"),
    WindowShow: () => ipcRenderer.send("LiteLoader.plugininstaller.WindowShow"),
    installPlugin: (plugin) => ipcRenderer.send("LiteLoader.plugininstaller.installPlugin", plugin),
    onUpdateInfo: (callback) => ipcRenderer.on("LiteLoader.plugininstaller.UpdateInfo", (event, tag) => callback(tag)),
    restart: () => ipcRenderer.send("LiteLoader.plugininstaller.restart")
});