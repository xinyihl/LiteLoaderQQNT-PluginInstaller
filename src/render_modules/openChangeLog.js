// 以下内容来自 https://github.com/xiyuesaves/LiteLoaderQQNT-lite_tools/blob/v4/src/render_modules/openChangeLog.js
const updateMsgBox = `
<div class="lite-tools-mask">
  <div class="lite-tools-update-msg-box">
    <div class="title" title="{{title}}">{{title}}</div>
    <div class="context">{{context}}</div>
    <div class="bottom-solt">
      <button class="q-button q-button--small q-button--primary update-btn">更新</button>
      <!-- <button class="q-button q-button--small q-button--secondary detail-btn">详情</button> -->
      <button class="q-button q-button--small q-button--secondary  quite-btn">返回</button>
    </div>
  </div>
</div>`;

/**
 * 显示更新日志，该模块只能在设置页面使用
 * @param {String} html html字符串
 * @param {Boolean} showDownloadBtn 是否显示下载按钮
 */
function openChangeLog(html) {
  const newMsgBox = updateMsgBox.replace(/\{\{([^}]+)\}\}/g, (match, name) => {
    switch (name) {
      case "title":
        return "更新日志";
      case "context":
        return html;
      default:
        return name;
    }
  });
  document.querySelector(".update-view.plugininstaller").insertAdjacentHTML("beforeend", newMsgBox);
  const showMsgBox = document.querySelector(".lite-tools-mask");
  showMsgBox.offsetHeight;
  showMsgBox.classList.add("show");
  showMsgBox.querySelector(".quite-btn").addEventListener("click", () => {
    showMsgBox.addEventListener("transitionend", () => {
      showMsgBox.remove();
    });
    showMsgBox.classList.remove("show");
  });
  showMsgBox.querySelector(".update-btn").addEventListener("click", () => {
    showMsgBox.addEventListener("transitionend", () => {
      showMsgBox.remove();
    });
    showMsgBox.classList.remove("show");
    plugininstaller.openPluginInfoWindow();
    //lite_tools.updatePlugins(updateUrl);
  });
  //showMsgBox.querySelector(".detail-btn").addEventListener("click", () => {
  //  lite_tools.openWeb(detailUrl);
  //});
}
export { openChangeLog };
