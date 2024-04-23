async function init() {
    const app = document.querySelector(".app");
    const plugins = await (await fetch("https://raw.githubusercontent.com/LiteLoaderQQNT/Plugin-List/v4/plugins.json")).json();
    for (const { repo, branch } of plugins) {
        const plugin = await (await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/manifest.json`)).json();
        console.log(plugin.name, plugin.version);
        const temp = `
        <div>
            <h3 style="display: unset;">${plugin.name}</h3><br>
            <span>${plugin.version}</span>
            <p style="display: unset;">${plugin.description}</p>
            <a href="llqqnt://plugininstaller/${repo}/${branch}/manifest.json">下载</a>
        </div>
        `;
        const doc = new DOMParser().parseFromString(temp, "text/html");
        document.querySelector(".app").appendChild(doc.querySelector("div"));
    }
}

window.onload = init();
