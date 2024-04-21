let downloadurl
window.onload = async () => {
  try {

    const r1 = await plugininstaller.getWindowInitData();
    const plugin = JSON.parse(r1.str);

    init(plugin);

    const r2 = await plugininstaller.getWebRequest(`https://api.github.com/repos/${plugin.repository.repo}/releases/latest`)
    const downloadtemp = JSON.parse(r2.str);

    downloadurl = downloadtemp.url
      ? "https://ghproxy.net/" + downloadtemp.assets[0].browser_download_url   
      : `https://ghproxy.net/https://github.com/${plugin.repository.repo}/archive/refs/heads/${plugin.repository.branch}.zip`;

    plugininstaller.WindowShow();
  } catch (error) {
    plugininstaller.log(1, error)
  }
}

//todo 获取插件图片
function init(plugin) {
  const icon = plugin.icon ? `https://ghproxy.net/https://raw.githubusercontent.com/${plugin.repository.repo}/${plugin.repository.branch}/${plugin.icon}` : "default_icon.png"
  const temp = `
  <div>
      <div>
          <div class="icon"><img src="${icon}"></div>
          <div>
              <div>
                  <span class="name" title="${plugin.name}">${plugin.name}</span>
              </div>
              <div>
                  <span class="description" title="${plugin.description}">${plugin.description}</span>
              </div>
          </div>
      </div>
      <div class="info">
          <span>版本：${plugin.version}</span>
          <span>开发：${plugin.authors[0].name}</span>
      </div>
      <div class="button">
          <button id="install" type="button">安装</button>
          <button id="more" type="button">详情</button>
          <button id="quit" type="button">取消</button>
      </div>
  </div>
  `;
  const doc = new DOMParser().parseFromString(temp, "text/html");

  document.querySelector(".app").appendChild(doc.querySelector("div"));

  document.getElementById("install").addEventListener("click", () => {
      plugininstaller.installPlugin(downloadurl, plugin.slug)
  });

  document.getElementById("more").addEventListener("click", () => {
    const link = "https://github.com/" + plugin.repository.repo;
    plugininstaller.openWeb(link);
  });

  document.getElementById("quit").addEventListener("click", () => {
    plugininstaller.close();
  });
}
