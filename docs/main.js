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
        const temp = `
      <div>
          <h3 style="display: unset;">${plugin.name}</h3><br>
          <span>${plugin.version}</span>
          <p style="display: unset;">${plugin.description}</p>
          <a href="llqqnt://plugininstaller/${plugin.repository.repo}/manifest.json">下载</a>
      </div>
      `;
        const doc = new DOMParser().parseFromString(temp, "text/html");
        document.querySelector(".app").appendChild(doc.querySelector("div"));
      });
  });
}

window.onload = init();
