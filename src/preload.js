const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("plugininstaller", {
    log: (level, ...serializedArgs) => ipcRenderer.send("LiteLoader.plugininstaller.log", level, ...serializedArgs),
    close: () => ipcRenderer.send("LiteLoader.plugininstaller.close"),
    openWeb: (url) => ipcRenderer.send("LiteLoader.plugininstaller.openWeb", url),
    getWindowInitData: () => ipcRenderer.invoke("LiteLoader.plugininstaller.WindowInit"),
    WindowShow: () => ipcRenderer.send("LiteLoader.plugininstaller.WindowShow"),
    installPlugin: (url, slug) => ipcRenderer.send("LiteLoader.plugininstaller.installPlugin", url, slug),
    getWebRequest: (url) => ipcRenderer.invoke("LiteLoader.plugininstaller.getWebRequest", url)
});