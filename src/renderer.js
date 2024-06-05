const plugin_path = LiteLoader.plugins["plugininstaller"].path.plugin;

export const onSettingWindowCreated = async view => {
    try {
        const hetiLinkElement = document.createElement("link");
        hetiLinkElement.rel = "stylesheet";
        hetiLinkElement.href = `local:///${plugin_path}/src/settings/settings.css`;
        document.head.appendChild(hetiLinkElement);

        const html_file_path = `local:///${plugin_path}/src/settings/settings.html`;
        view.innerHTML = await (await fetch(html_file_path)).text();

        const button1 = view.querySelector(".plugininstaller-install");
        button1.addEventListener("click", debounce(() => { handleURL(document.querySelector(".plugininstaller-url").value) }, 500));

        const button2 = view.querySelector(".plugininstaller-chackpluginupdate");
        button2.addEventListener("click", debounce(() => { pluginupdate(view, false) }, 500));

        pluginupdate(view, true);
    }catch (e) {
        console.error(e);
    }
}

function debounce(func, delay) {
    let timer = null;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, arguments);
        }, delay);
    };
}

async function pluginupdate(view, slug) {
    view.querySelector(".update-list").innerHTML = "";
    const update_list = view.querySelector(".update-list");
    const update = await plugininstaller.chackPluginUpdate(slug);
    update.forEach((plugin) => {
        const temp = `
        <setting-item data-direction="row">
            <div>
                <div>${plugin.name}</div>
                <span class="secondary-text">${plugin.PIoldversion} -> ${plugin.version}</span>
            </div>
            <div>
                <button class="q-button q-button--small q-button--secondary update">更新</button>
            </div>
        </setting-item>
        `;
        const dom = new DOMParser().parseFromString(temp, "text/html");
        dom.querySelector(".update").addEventListener("click",  debounce(() => plugininstaller.updateBySlug(plugin.slug), 500));
        update_list.appendChild(dom.querySelector("setting-item"));
    })
}

function handleURL(url) {
    const githubRawPattern = /^https:\/\/raw\.githubusercontent\.com\/[^\s/]+\/[^\s/]+\/[^/]+\/manifest\.json$/;
    const githubBlobPattern = /^https:\/\/github\.com\/[^\s/]+\/[^\s/]+(\/blob)?\/[^/]+\/manifest\.json$/;
    const llqqntPattern = /^llqqnt:\/\/plugininstaller\/[^\s/]+\/[^\s/]+(\/blob)?\/[^/]+\/manifest\.json$/;

    if (githubRawPattern.test(url)) {
        plugininstaller.installByUrl(url);
    } else if (githubBlobPattern.test(url) || llqqntPattern.test(url)) {
        const newURL = url.replace(/^https:\/\/github\.com\//, 'https://raw.githubusercontent.com/')
            .replace(/^llqqnt:\/\/plugininstaller\//, 'https://raw.githubusercontent.com/')
            .replace(/\/blob\//, `/`);
        plugininstaller.installByUrl(newURL);
    } else {
        document.querySelector(".input-text.plugininstaller-url").value = "链接格式错误";
    }
}