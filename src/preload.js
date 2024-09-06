const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("plugininstaller", {
    log: (level, ...serializedArgs) => ipcRenderer.send("LiteLoader.plugininstaller.log", level, ...serializedArgs),
    openWeb: (url) => ipcRenderer.send("LiteLoader.plugininstaller.openWeb", url),
    installByUrl: (url) => ipcRenderer.send("LiteLoader.plugininstaller.installByUrl", url),
    updateBySlug: (slug) => ipcRenderer.send("LiteLoader.plugininstaller.updateBySlug", slug),
    chackPluginUpdate: (slug) => ipcRenderer.invoke("LiteLoader.plugininstaller.chackPluginUpdate", slug),
    initUpdatePluginData: (slug) => ipcRenderer.invoke("LiteLoader.plugininstaller.initUpdatePluginData", slug),
    openPluginInfoWindow: () => ipcRenderer.send("LiteLoader.plugininstaller.openPluginInfoWindow")
});