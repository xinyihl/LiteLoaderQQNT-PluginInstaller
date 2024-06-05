var dowload_tag = false
window.onload = async () => {
  try {
    const plugin = await plugininstaller.WindowInit();

    init(plugin);

    const dowloadTagProgess = document.querySelector("#dowloadTagProgess");
    const dowloadTagText = document.querySelector("#dowloadTagText");
    const button = document.querySelector("#thebutton");
    
    plugininstaller.onUpdateInfo((tag) => {
      dowloadTagText.textContent = tag.text;
      if(tag.progressData){
        dowloadTagProgess.value = tag.progressData.percentage;
      }
      if(tag.text === "安装完成"){
        if(plugin.PIupdatemode) dowloadTagText.textContent = "更新完成";
        button.textContent = "重启";
        button.disabled = false;
      }
    })

    plugininstaller.WindowShow();
  } catch (error) {
    plugininstaller.log(1, error)
    plugininstaller.close();
  }
}

function init(plugin) {
  const icon = plugin.icon ? `https://raw.githubusercontent.com/${plugin.repository.repo}/${plugin.repository.branch}/${plugin.icon}` : "default_icon.png"
  const temp = `
  <div>
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
        <span class="author">作者：</span
        ><span>${plugin.authors[0].name}</span>
      </div>
    </div>
    <div class="action">
      <progress id="dowloadTagProgess" max="100" value="0"></progress>
      <span id="dowloadTagText">准备中</span>
      <button id="quit" type="button">关闭</button>
      <button id="more" type="button">详情</button>
      <button id="thebutton" type="button">
        ${plugin.PIupdatemode ? "更新" : "安装"}
      </button>
    </div>
  </div>
  `;
  const doc = new DOMParser().parseFromString(temp, "text/html");

  document.querySelector(".app").appendChild(doc.querySelector("div"));

  document.querySelector("#thebutton").disabled = !plugin.PIinstall;

  document.querySelector("#thebutton").addEventListener("click", () => {
    if(!dowload_tag){
      dowload_tag = true;
      document.querySelector("#thebutton").disabled = true;
      document.querySelector("#dowloadTagProgess").style.display = "block";
      document.querySelector("#dowloadTagText").style.display = "inline";
      plugininstaller.installPlugin(plugin);
    }else{
      plugininstaller.restart();
    }
  });

  document.querySelector("#more").addEventListener("click", () => {
    const link = "https://github.com/" + plugin.repository.repo;
    plugininstaller.openWeb(link);
  });

  document.querySelector("#quit").addEventListener("click", () => {
    plugininstaller.close();
  });
}
