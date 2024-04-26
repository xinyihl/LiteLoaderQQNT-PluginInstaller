async function init() {
  const app = document.querySelector(".app");
  const plugins = await (
    await fetch("https://raw.githubusercontent.com/LiteLoaderQQNT/Plugin-List/v4/plugins.json")
  ).json();
  let list = [];
  for (const { repo, branch } of plugins) {
    list.push(
      (async () => {
        try {
          return await (await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/manifest.json`)).json();
        } catch {
          return Promise.resolve(null);
        }
      })()
    );
  }
  Promise.all(list).then((plugins) => {
    plugins
      .filter((notNull) => notNull)
      .forEach((plugin) => {
        const icon = plugin.icon ? `https://raw.githubusercontent.com/${plugin.repository.repo}/${plugin.repository.branch}/${plugin.icon}` : "default_icon.png"
        const temp = `
      <div class="plugin-card">
        <div class="desc">
          <img src="${icon}" class="icon" />
          <div>
            <span class="name">${plugin.name}</span>
            <span class="description">${plugin.description}</span>
          </div>
        </div>
        <div class="info">
          <div>
            <span class="version">版本：</span><span>${plugin.version}</span>
            <span class="author">作者：</span><a href="${plugin.authors[0].link}">${plugin.authors[0].name}</a>
          </div>
          <div>
            <span>支持平台：</span><span>${plugin.platform}</span>
          </div>
          <div>
            <span>加载器版本：</span><span>${plugin.manifest_version}</span>
          </div>
          <a href="llqqnt://plugininstaller/${plugin.repository.repo}/${plugin.repository.branch}/manifest.json" class="install">安装</a>
        </div>
      </div>
      `;
        const doc = new DOMParser().parseFromString(temp, "text/html");
        document.querySelector(".app").appendChild(doc.querySelector("div"));
      });
  });
}

window.onload = init();
