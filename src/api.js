/**
 * api.js 来自原插件商店
 */
const { ipcMain, app, shell, BrowserWindow, dialog, net } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const StreamZip = require("node-stream-zip");

/**
 * 简易请求函数
 * @param {String} url
 * @returns
 */
function request(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
            }
        };
        const protocol = url.startsWith("https") ? https : http;
        const req = protocol.get(url, options);
        req.on("error", (error) => reject(error));
        req.on("response", (res) => {
            if (res.statusCode >= 300 && res.statusCode <= 399) {
                return resolve(request(res.headers.location));
            }
            const chunks = [];
            res.on("error", (error) => reject(error));
            res.on("data", (chunk) => chunks.push(chunk));
            res.on("end", () => {
                var data = Buffer.concat(chunks);
                resolve({
                    data: data,
                    str: data.toString("utf-8"),
                    url: res.url
                });
            });
        });
    });
}

/**
 * 下载插件
 * @param {String} url 
 * @param {String} slug
 * @param {String} save_folder
 * @returns 
 */
async function downloadPlugin(url, slug, save_folder="") {
    const pluginDataPath = save_folder? save_folder:LiteLoader.plugins.plugininstaller.path.data;
    const body = (await request(url)).data;
    const cache_file_path = path.join(pluginDataPath, `${slug}.zip`);
    fs.mkdirSync(pluginDataPath, { recursive: true });
    fs.writeFileSync(cache_file_path, body);
    return cache_file_path;
}

/**
 * 下载文件
 * @param {String} url
 * @param {String} file_name
 * @param {String} save_folder
 * @returns 
 */
async function downloadFile(url, file_name, save_folder="") {
    const pluginDataPath = save_folder? save_folder:LiteLoader.plugins.plugininstaller.path.data;
    const body = (await request(url)).data;

    const cache_file_path = path.join(pluginDataPath, file_name);
    fs.mkdirSync(pluginDataPath, { recursive: true });
    fs.writeFileSync(cache_file_path, body);
    return cache_file_path;
}

/**
 * 解压安装插件
 * @param {String} cache_file_path
 * @param {String} slug
 * @returns
 */
async function installPlugin(cache_file_path, slug) {
    const { plugins } = LiteLoader.path;
    const plugin_path = `${plugins}/${slug}`;
    try {
        fs.mkdirSync(plugin_path, { recursive: true });
        const zip = new StreamZip.async({ file: cache_file_path });
        const entries = await zip.entries();
        const isFolder = !entries.hasOwnProperty("manifest.json")
        for (const entry of Object.values(entries)) {
            if (!entry.name.includes(".github")) {
                const pathname = `${plugin_path}/${isFolder? entry.name.split('/').slice(1).join('/') : entry.name}`;
                if (entry.isDirectory) {
                    fs.mkdirSync(pathname, { recursive: true });
                    continue;
                }
                try {
                    if (entry.isFile) {
                        await zip.extract(entry.name, pathname);
                        continue;
                    }
                } catch (error) {
                    fs.mkdirSync(pathname.slice(0, pathname.lastIndexOf('/')), { recursive: true });
                    await zip.extract(entry.name, pathname);
                    continue
                }

            }
        }
        await zip.close();
        return true;
    } catch (error) {
        dialog.showErrorBox("PluginInstaller", error.stack || error.message);
        fs.rmSync(plugin_path, { recursive: true, force: true });
        if (error.message.includes('Bad archive')) {
            return false;
        }
        return false;
    }
}

/**
 * 安装
 * @param {String} url
 * @param {String} slug
 * @returns
 */
async function install(url, slug) {
    try {
        const cache_file_path = await downloadPlugin(url, slug)
        return await installPlugin(cache_file_path, slug);
    } catch(error) {
        dialog.showErrorBox("PluginInstaller", error.stack || error.message)
        return false
    }
}

/**
 * 卸载
 * @param {String} slug
 * @param {Boolean} update_mode
 * @returns
 */
async function uninstall(slug, update_mode = false) {
    const paths = LiteLoader.plugins[slug].path;
    if (!paths) {
        return false;
    }
    if (update_mode) {
        fs.rmSync(paths.plugin, { recursive: true, force: true });
        return true;
    }
    for (const [name, path] of Object.entries(paths)) {
        fs.rmSync(path, { recursive: true, force: true });
    }
    return true;
}

/**
 * 更新
 * @param {String} url
 * @param {String} slug
 * @returns
 */
async function update(url, slug) {
    try {
        const cache_file_path = await downloadPlugin(url, slug)
        if (!(await uninstall(slug, true))) {
            return false;
        }
        if (!(await installPlugin(cache_file_path, slug))) {
            return false;
        }
        return true;
    } catch(error) {
        dialog.showErrorBox("PluginInstaller", error.stack || error.message)
        return false
    }
}

module.exports  =  {
    request,
    downloadPlugin,
    downloadFile,
    installPlugin,
    install,
    uninstall,
    update
}