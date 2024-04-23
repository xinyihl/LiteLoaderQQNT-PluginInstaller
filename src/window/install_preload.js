const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("plugininstaller", {
    log: (level, ...serializedArgs) => ipcRenderer.send("LiteLoader.plugininstaller.log", level, ...serializedArgs),
    close: () => ipcRenderer.send("LiteLoader.plugininstaller.close"),
    openWeb: (url) => ipcRenderer.send("LiteLoader.plugininstaller.openWeb", url),
    WindowInit: () => ipcRenderer.invoke("LiteLoader.plugininstaller.WindowInit"),
    WindowShow: () => ipcRenderer.send("LiteLoader.plugininstaller.WindowShow"),
    installPlugin: () => ipcRenderer.send("LiteLoader.plugininstaller.installPlugin"),
    onUpdateInfo: (callback) => ipcRenderer.on("LiteLoader.plugininstaller.UpdateInfo", (event, tag) => callback(tag)),
    installByUrl: (url) => ipcRenderer.send("LiteLoader.plugininstaller.installByUrl", url)
});