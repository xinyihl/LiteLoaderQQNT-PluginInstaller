const progressStream = require("progress-stream");
const { httpsAgent } = require("./options.js");
const StreamZip = require("node-stream-zip");
const { dialog } = require("electron");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

async function uninstall(slug) {
  const paths = LiteLoader.plugins[slug].path;
  if (!paths) return;
  try {
    fs.rmSync(paths.plugin, { recursive: true, force: true });
  } catch (error) {
    dialog.showErrorBox( "PluginInstaller uninstall", error.stack || error.message);
  }
}

async function update(webContent, plugin) {
  try {
    await uninstall(plugin.slug);
    await install(webContent, plugin);
  } catch (error) {
    dialog.showErrorBox( "PluginInstaller update", error.stack || error.message);
  }
}

function UorI(webContent, plugin){
  if(plugin.PIupdatemode){
    update(webContent, plugin)
  }else{
    install(webContent, plugin)
  }
}

async function install(webContent, plugin) {
  try {
    const pluginDataPath = LiteLoader.plugins.plugininstaller.path.data;
    const fileName = `${plugin.slug} v${plugin.version}.zip`;
    const saveFilePath = path.join(pluginDataPath, fileName);
    if (!fs.existsSync(pluginDataPath)) fs.mkdirSync(pluginDataPath, { recursive: true });
    await installPlugin(webContent, plugin.PIurl, saveFilePath, plugin);
  } catch (error) {
    dialog.showErrorBox( "PluginInstaller install", error.stack || error.message);
  }
}

async function installPlugin(webContent, fileURL, saveFilePath, plugin) {
  let tmpFileSavePath = saveFilePath + ".tmp";
  let cfgFileSavePath = saveFilePath + ".cfg.json";

  let downCfg = {
    rh: {}, //请求头
    percentage: 0, //进度
    transferred: 0, //已完成
    length: 0, //文件大小
    remaining: 0, //剩余
    first: true, //首次下载
  };

  let tmpFileStat = { size: 0 };

  if (fs.existsSync(tmpFileSavePath) && fs.existsSync(cfgFileSavePath)) {
    tmpFileStat = fs.statSync(tmpFileSavePath);
    downCfg = JSON.parse(fs.readFileSync(cfgFileSavePath, "utf-8").trim());
    downCfg.first = false;
    downCfg.transferred = tmpFileStat.size;
  }

  let writeStream = null;

  let fetchHeaders = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    Pragma: "no-cache",
  };

  if (downCfg.length != 0) {
    fetchHeaders.Range = "bytes=" + downCfg.transferred + "-" + downCfg.length;
  }
  if (downCfg.rh["last-modified"]) {
    fetchHeaders["last-modified"] = downCfg.rh["last-modified"];
  }

  /*
  progressData: {
    percentage: 9.05, 进度
    transferred: 949624, 已完成
    length: 10485760, 文件大小
    remaining: 9536136, 剩余
    eta: 42,
    runtime: 3, 耗时
    delta: 295396,
    speed: 949624 速度
  }
  */

  const checkHerder = [
    "last-modified", //文件最后修改时间
    "server", //服务器
    "content-length", //文件大小
    "content-type", //返回类型
    "etag", //文件标识
  ];

  fetch(fileURL, {
    agent: await httpsAgent(),
    method: "GET",
    headers: fetchHeaders,
    //timeout: 1000,
  })
    .then((res) => {

      let h = {};
      let fileIsChange = false;

      res.headers.forEach((v, i, a) => { h[i.toLowerCase()] = v;});

      if (downCfg.first) {

        for (let k of checkHerder) downCfg.rh[k] = h[k];

        downCfg.length = h["content-length"];

      } else {

        for (let k of checkHerder) {
          if (downCfg.rh[k] != h[k]) {
            fileIsChange = true;
            break;
          }
        }

        downCfg.range = res.headers.get("content-range") ? true : false;

      }
      writeStream = fs
        .createWriteStream(tmpFileSavePath, { flags: !downCfg.range || fileIsChange ? "w" : "a"})
        .on("error", (error) => { dialog.showErrorBox( "PluginInstaller dowloadFile", error.stack || error.message); })
        .on("ready", () => { webContent.send("LiteLoader.plugininstaller.UpdateInfo", { text: "开始下载", progressData: null }); })
        .on("finish", async () => {

          fs.renameSync(tmpFileSavePath, saveFilePath);
          fs.unlinkSync(cfgFileSavePath);

          webContent.send("LiteLoader.plugininstaller.UpdateInfo", { text: "下载完成", progressData: null });

          const { plugins } = LiteLoader.path;
          const plugin_path = `${plugins}/${plugin.slug}`;

          try {

            webContent.send("LiteLoader.plugininstaller.UpdateInfo", { text: "解压中...", progressData: null });

            fs.mkdirSync(plugin_path, { recursive: true });

            const zip = new StreamZip.async({ file: saveFilePath });
            const entries = await zip.entries();
            const isFolder = !entries.hasOwnProperty("manifest.json");

            for (const entry of Object.values(entries)) {
              if (!entry.name.includes(".github")) {

                const pathname = `${plugin_path}/${isFolder ? entry.name.split("/").slice(1).join("/") : entry.name}`;

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
                  fs.mkdirSync(pathname.slice(0, pathname.lastIndexOf("/")), { recursive: true });
                  await zip.extract(entry.name, pathname);
                  continue;
                }
              }
            }

            await zip.close();

            webContent.send("LiteLoader.plugininstaller.UpdateInfo", { text: "安装完成", progressData: null });

          } catch (error) {
            dialog.showErrorBox( "PluginInstaller", error.stack || error.message );
            fs.rmSync(plugin_path, { recursive: true, force: true });
          }
        });

      fs.writeFileSync(cfgFileSavePath, JSON.stringify(downCfg));

      let str = progressStream({ length: h["content-length"], time: 100 });

      str.on("progress", function (progressData) { webContent.send("LiteLoader.plugininstaller.UpdateInfo", { text: "下载中...", progressData: progressData }); });
      res.body.pipe(str).pipe(writeStream);
    })
    .catch((error) => { dialog.showErrorBox( "PluginInstaller dowloadFile", error.stack || error.message); });
}

module.exports = {
  install,
  uninstall,
  update,
  UorI
};
