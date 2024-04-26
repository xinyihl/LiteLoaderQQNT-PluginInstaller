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
              <img  src="${icon}" class="icon-common icon" />
              <div class="icon-common class-6">
                <span class="class-4">${plugin.name}</span
                ><span class="class-5"
                  >${plugin.description}</span
                >
              </div>
            </div>
            <div class="info">
              <div class="class-11">
                <span class="class-7">版本：</span><span class="class-9">${plugin.version}</span><span class="class-8">作者：</span
                ><a href="${plugin.authors[0].link}" class="class-10">${plugin.authors[0].name}</a>
              </div>
              <div class="class-12">
                <span class="class-13">支持平台：</span><span class="class-14">${plugin.platform}</span>
              </div>
              <div class="class-17"><span class="class-16">加载器版本：</span><span class="class-18">${plugin.manifest_version}</span></div>
              <a href="llqqnt://plugininstaller/${plugin.repository.repo}/${plugin.repository.branch}/manifest.json" class="install">安装</a>
            </div>
          </div>
        </div>
      `;
        const doc = new DOMParser().parseFromString(temp, "text/html");
        document.querySelector(".app").appendChild(doc.querySelector("div"));
      });
  });
}

window.onload = init();
