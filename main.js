const closelists = ["qqsss"]

async function init() {
  const app = document.querySelector(".app");
  const searchParams = new URLSearchParams(window.location.search);
  const link = searchParams.get('link')
  if(link){
    console.log("自动跳转", link)
    window.location.href = link;
    const temp = `<p>如果没有自动跳转，请点击<a href="${link}">这里</a>.</p>`;
    const doc = new DOMParser().parseFromString(temp, "text/html");
    app.appendChild(doc.querySelector("p"));
    return;
  }

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
        try{
          const icon = plugin.icon ? `https://raw.githubusercontent.com/${plugin.repository.repo}/${plugin.repository.branch}/${plugin.icon}` : "default_icon.png"
          var text = ''
          if(closelists.includes(plugin.slug)){
            text = `<span style="float: right; color: red;" title="该插件为闭源/混淆插件，请谨慎使用">闭源</span>`
          }
          const temp = `
          <div class="plugin-card">
            <div class="desc">
              <img src="${icon}" class="icon" />
              <div>
                <span class="name">${plugin.name + text}</span>
                <span class="description">${plugin.description}</span>
              </div>
            </div>
            <div class="info">
              <div>
                <span class="version">版本：</span><span>${plugin.version}</span>
                <span class="author">作者：</span><a href="${plugin.authors[0].link}" title="点击打开 ${plugin.authors[0].name} 作者首页" >${plugin.authors[0].name}</a>
              </div>
              <div>
                <span>支持平台：</span><span>${plugin.platform}</span>
              </div>
              <div>
                <span>加载器版本：</span><span>${plugin.manifest_version}</span>
              </div>
              <a href="llqqnt://plugininstaller/${plugin.repository.repo}/${plugin.repository.branch}/manifest.json" title="点击安装 ${plugin.name}" class="link">安装</a>
              <a href="https://github.com/${plugin.repository.repo}" title="点击打开 ${plugin.name} 仓库" class="link">详情</a>
            </div>
          </div>
          `;
          const doc = new DOMParser().parseFromString(temp, "text/html");
          app.appendChild(doc.querySelector("div"));
        }catch (e) {
          console.error(plugin, e);
        }
      });
  });
}
init();