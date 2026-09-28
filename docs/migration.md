# 从内部中文扩展迁移

本次整理统一源码与发行结构；没有自动修改任何已部署实例。

| 项目 | 旧名称 | 新名称 |
|---|---|---|
| 源码目录 | `i18n-overlay` | `web-app-zh-cn` |
| package / manifest / app ID | `zh-custom-overlay` | `web-app-zh-cn` |
| 源词表 | `src/locales/zh-custom.json` | `l10n/translations.json` |
| 对外词表 | `zh-custom.json` | `translations.json` |
| 应用目录 | `assets/apps/zh-custom-overlay/` | `assets/apps/web-app-zh-cn/` |
| 模块版本 | `8.0.1-local.1` | `0.1.0`（独立版本） |

语言键仍为 `zh`，1,640 条译文未改动；目录名称中的 `zh-cn` 不应写成词表语言键。

## 部署切换

1. 记录当前镜像、Web 配置、Compose 挂载和旧扩展目录，保留可恢复副本。旧扩展的副本放在应用发现目录之外，避免被再次加载。
2. 构建并校验新 ZIP，将安装包解压到独立的新目录，例如宿主机 `config/web-app-zh-cn/`。
3. 在同一变更中替换 Compose 挂载：

   ```yaml
   services:
     opencloud:
       volumes:
         - ./config/web-app-zh-cn:/var/lib/opencloud/web/assets/apps/web-app-zh-cn:ro,Z
   ```

   合并到已有服务配置，移除旧扩展那一条挂载，保留其他数据卷。路径、容器 UID/GID、SELinux 标签以目标部署为准。
4. 同步修改 `customTranslations` URL 为 `/assets/apps/web-app-zh-cn/translations.json?v=<本次版本或词表哈希>`，使用实际入口域名。若曾手工配置 `external_apps`、`apps.yaml` 或应用自身 `config.json`，一并检查旧名称引用；使用自动发现时不要重复注册。
5. 挂载定义改变后，执行 `docker compose up -d --no-deps --force-recreate opencloud` 使新挂载生效。单纯 restart 不会更新 Docker 挂载定义。
6. 刷新浏览器，确认只有新扩展生效，清单及入口资源均返回成功，并检查团队空间、回收站、分享和权限文案。旧目录可在应用发现目录之外暂留用于回滚。

## 回滚

恢复旧扩展目录、旧挂载和旧译文 URL，重新创建 OpenCloud 容器，再刷新浏览器验证。不要同时加载新旧两个译文扩展，否则覆盖顺序可能不明确。
