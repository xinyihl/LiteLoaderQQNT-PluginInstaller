# LiteLoaderQQNT-PluginInstaller

> [!NOTE]\
> 该插件仅在 Windows 环境下开发&测试，未对其他平台进行测试，不保证可用性 \
> 其中 `URL Schemes` 功能 [mac](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/TP40009249-102207-TPXREF115) & [linux](https://askubuntu.com/questions/514125/url-protocol-handlers-in-basic-ubuntu-desktop) 系统需要自行进行额外操作

### 功能
- 检查&更新已启用的插件
- 下载插件时显示下载进度、断点续传
- 通过 `URL Schemes` 跳转 `QQ` 安装插件 [试一试](https://xinyihl.github.io/LiteLoaderQQNT-PluginInstaller/)
- 通过插件 `manifest.json` 文件访问链接安装插件
  > 即对应插件仓库文件的 raw.githubusercontent.com 源码链接 \
    获取方式为点击 `manifest.json` 文件页面右上角 `Raw` 按钮

### 使用方法
1. 下载最新 [发行版](https://github.com/xinyihl/LiteLoaderQQNT-PluginInstaller/releases) 并解压
2. 将文件夹移动至 `LiteLoaderQQNT数据目录/plugins/` 下面
3. 重启QQNT即可

### 注意
- 使用 `git clone` 方法安装的用户还需执行 `npm install` 下载依赖
- 本插件依靠 [Protocio](https://github.com/PRO-2684/protocio) 插件实现 `URL Schemes` 跳转功能

### 鸣谢
- [LiteLoaderQQNT](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT) 
- 其他插件开发者

### 对于插件开发者：   
```
插件添加的 api:
 使用 `LiteLoader.api.openPluginInfoWindow(slug)` 打开弹窗，本插件会自动判断是否为更新模式 
 在您仓库的 `manifest.json` 文件中添加 `"PIinstall": false` 来禁止本插件自动安装

URL Schemes 示例:
 llqqnt://plugininstaller/xinyihl/LiteLoaderQQNT-PluginInstaller/main/manifest.json
 即将仓库的 `manifest.json` 文件访问链接的 `https://raw.githubusercontent.com` 改为 `llqqnt://plugininstaller`
```
