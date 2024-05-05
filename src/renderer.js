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

        button1.addEventListener("click", debounce(() => {
            const url = document.querySelector(".plugininstaller-url").value;
            var reg=/^https:\/\/raw\.githubusercontent\.com\/.*$/; 
            if(!reg.test(url)) {
                document.querySelector(".input-text.plugininstaller-url").value = "链接格式错误";
                return;
            };
            plugininstaller.installByUrl(url);
        }, 500))

        const button2 = view.querySelector(".plugininstaller-chackpluginupdate");

        button2.addEventListener("click", debounce(() => {
            view.querySelector(".update-list").innerHTML = ""
            pluginupdate(view);
        }, 500))

        pluginupdate(view);
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

async function pluginupdate(view) {
    const update_list = view.querySelector(".update-list");
    const update = await plugininstaller.chackPluginUpdate()
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