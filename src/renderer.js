const plugin_path = LiteLoader.plugins["plugininstaller"].path.plugin;

export const onSettingWindowCreated = async view => {
    try {
        const hetiLinkElement = document.createElement("link");
        hetiLinkElement.rel = "stylesheet";
        hetiLinkElement.href = `local:///${plugin_path}/src/settings.css`;
        document.head.appendChild(hetiLinkElement);

        const html_file_path = `local:///${plugin_path}/src/settings.html`;
        view.innerHTML = await (await fetch(html_file_path)).text();

        const button = view.querySelector(".plugininstaller-install");

        button.addEventListener("click", () => {
            const url = document.querySelector(".plugininstaller-url").value;
            var reg=/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
            if(!reg.test(url)) {
                document.querySelector(".input-text.plugininstaller-url").value = "链接格式错误";
                return;
            };
            plugininstaller.installByUrl(url);
        })

    }catch (e) {
        console.error(e);
    }
}