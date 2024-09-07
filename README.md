# LiteLoaderQQNT-PluginInstaller

> [!NOTE]\
> 该插件仅在 Windows 环境下开发&测试，未对其他平台进行测试，不保证可用性 \
> 其中 `URL Schemes` 功能 [mac](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/TP40009249-102207-TPXREF115) & [linux](https://askubuntu.com/questions/514125/url-protocol-handlers-in-basic-ubuntu-desktop) 系统需要自行进行额外操作

> [!WARNING]\
> 由于本插件使用 [REST API](https://docs.github.com/zh/rest) 请求相关数据 \
> 请勿频繁打开不同插件的下载界面&更新日志，可能会导致超过 API 速率限制 `每小时 60 个请求` \
> 对于同一个插件，本插件内部使用了缓存机制则无限制

### 功能
- 检查&更新已启用的插件
- 下载插件时显示下载进度、断点续传
- 通过 `URL Schemes` 跳转 `QQ` 安装插件 [试一试](https://xinyihl.github.io/LiteLoaderQQNT-PluginInstaller/?link=llqqnt://plugininstaller/xinyihl/LiteLoaderQQNT-PluginInstaller/main/manifest.json)
- 通过插件 `manifest.json` 文件访问链接安装插件
- 网页 [插件列表](https://xinyihl.github.io/LiteLoaderQQNT-PluginInstaller/)

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
插件默认下载 `latest releases` 当目标仓库不存在 `releases` 时采用源码安装
```
插件添加的特性:
 在您仓库的 manifest.json 文件中添加 "PIinstall": false 来禁止本插件自动安装

插件添加的 api:
 LiteLoader.api.openPluginInfoWindow(slug) - 仅限主线程使用
 打开弹窗，本插件会自动判断是否为更新模式，如果要在渲染线程调用弹窗可以使用本插件内部的api: plugininstaller.updateBySlug(slug)

URL Schemes 示例:
 llqqnt://plugininstaller/xinyihl/LiteLoaderQQNT-PluginInstaller/main/manifest.json
 即将仓库的 manifest.json 文件访问链接的 https://raw.githubusercontent.com 改为 llqqnt://plugininstaller
 由于 github 并不支持自定义协议可以使用 https://xinyihl.github.io/LiteLoaderQQNT-PluginInstaller/?link=[yourlink]
```
