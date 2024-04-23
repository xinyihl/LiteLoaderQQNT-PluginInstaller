# LiteLoaderQQNT-PluginInstaller

### 功能
- 通过 `URL Schemes` 链接跳转 `QQ` 安装插件  
- 在设置页面输入插件 `manifest.json` 文件访问链接安装插件

#### URL Schemes 链接示例：   
>llqqnt://plugininstaller/xinyihl/LiteLoaderQQNT-PluginInstaller/main/manifest.json   
即将你仓库的 `manifest.json` 文件访问链接的 `https://raw.githubusercontent.com` 改为 `llqqnt://plugininstaller`

### 使用方法
1. 下载最新 [发行版 ](https://github.com/xinyihl/LiteLoaderQQNT-PluginInstaller/releases) 并解压
2. 将文件夹移动至 `LiteLoaderQQNT数据目录/plugins/` 下面
3. 重启QQNT即可

### 注意
- 如果使用 `git clone` 安装还需要执行 `npm install` 下载依赖
- 本插件需要 [Protocio](https://github.com/PRO-2684/protocio) 插件实现 `URL Schemes` 跳转功能

### 鸣谢
- [LiteLoaderQQNT](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT) 
- 其他插件开发者