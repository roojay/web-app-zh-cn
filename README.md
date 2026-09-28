# OpenCloud Web 简体中文优化

`web-app-zh-cn` 是一个社区维护的 OpenCloud Web 译文扩展，采用 OpenCloud 官方 Extension SDK 和 Web Application 接口。统一“团队空间”“回收站”“分享”等常用网盘术语，补齐并优化中文表达，不增加页面、菜单或业务接口。

- 当前词表：1,640 个英文消息键，语言键为 OpenCloud 使用的 `zh`。
- 词表基线：OpenCloud 8.0.1 部署中的 Web 与内置应用，来源信息见 [NOTICE](./NOTICE)。
- 构建基线：Extension SDK / web-pkg 8.0.0，Vite 8；依赖由 `package-lock.json` 固定。
- 当前模块版本：`0.1.0`，独立于服务端版本。

服务端、Web 与 SDK 的版本需分别核对。适配其他 Web 版本或应用时，应检查词条覆盖及译文加载顺序。

## 构建

要求 Node.js 22.12+（推荐 Node.js 24 LTS）、npm，以及打包时使用的 `zip` 命令。Linux 和 macOS 均可构建。

```bash
npm ci
npm run package
```

- `check`：TypeScript、英文键覆盖、非空译文及 `%{...}` 占位符检查。
- `build`：检查后构建，并验证清单入口、静态词表和许可文件。
- `package`：构建并生成 `release/web-app-zh-cn-0.1.0.zip`、同版本 `-source.zip` 与 `SHA256SUMS`。
- `build:watch`：监听源文件重新构建；在 OpenCloud 中刷新页面查看变化。

安装 ZIP 根目录直接包含 `manifest.json`，符合官方应用商店要求；源码 ZIP 内包含完整独立项目。`dist/`、`release/`、依赖和构建缓存均不纳入源码版本管理。

## 安装

1. 从 [Releases](https://github.com/roojay/web-app-zh-cn/releases) 下载发行包及 `SHA256SUMS`，或按上文自行构建。用 `sha256sum`（Linux）或 `shasum -a 256`（macOS）比对对应文件哈希。
2. 将**安装 ZIP**解压到 OpenCloud 的应用目录下，形成：

   ```text
   $OC_DATA_DIR/web/assets/apps/web-app-zh-cn/
   ├── manifest.json
   ├── translations.json
   ├── LICENSE
   ├── NOTICE
   ├── THIRD_PARTY_NOTICES.txt
   └── js/
   ```

   使用官方 opencloud-compose 时，对应宿主机目录为 `config/opencloud/apps/web-app-zh-cn/`。自定义 Compose 可将解压后的目录只读挂载到 `/var/lib/opencloud/web/assets/apps/web-app-zh-cn/`；以实际 `OC_DATA_DIR` 为准。SELinux 主机按部署要求使用 `:ro,Z`，不要改为全局可写权限。

3. 在现有 Web 配置中合并下列字段，保留其他配置项：

   ```json
   {
     "customTranslations": [
       { "url": "https://cloud.example.com/assets/apps/web-app-zh-cn/translations.json?v=0.1.0" }
     ]
   }
   ```

   将示例域名替换为实际 OpenCloud 入口；更新词表时改变版本参数。已有其他自定义词表时合并数组，并核实同名词条的覆盖顺序。

4. 在 Compose 项目目录应用变更。以下命令中的 `opencloud` 应替换为实际负责 Web 服务的服务名：

   - **新增或修改了 Compose 挂载、环境变量等配置**：重建容器，使配置生效。

     ```bash
     docker compose up -d --no-deps --force-recreate opencloud
     ```

   - **仅更新原有挂载目录内的扩展文件或 Web 配置内容**：重启服务。

     ```bash
     docker compose restart opencloud
     ```

   刷新浏览器并选择简体中文。部署默认语言属于服务端配置，不由此扩展强制改变用户偏好。
5. 核对 `manifest.json` 及其 `entrypoint`、`translations.json` 均能访问，并检查团队空间、回收站、分享和权限提示的实际中文效果。纯译文扩展不会新增应用切换器菜单。

本扩展通过 `customTranslations` 提供静态词表，并通过 Web Application 注册应用译文。其他应用可能注册同名消息，升级时应复核覆盖顺序及实际页面效果。

## 升级与回退

1. 保留当前安装包、Web 配置和 Compose 配置的可恢复副本。副本放在应用发现目录之外，避免重复加载。
2. 将新安装包解压到空目录后替换扩展目录，更新 `customTranslations` URL 的版本参数，按安装步骤应用文件或容器配置变更。手动注册应用的部署需检查 `external_apps`、`apps.yaml` 或应用配置中的名称和路径；使用自动发现时避免重复注册。
3. 核对清单、入口资源和词表，并检查受影响页面。需要回退时恢复上一版扩展及对应配置，按安装步骤重新应用并刷新浏览器验证。

## 维护译文

只维护 [`l10n/translations.json`](./l10n/translations.json) 这一份中文词表。`src/index.ts` 直接导入 JSON；Vite 构建阶段将同一文件输出为静态 `translations.json`，供 `customTranslations` 读取。

[`l10n/source-keys.json`](./l10n/source-keys.json) 保存本版本英文消息键基线。升级 OpenCloud 时先对照新版本英文原文，更新基线和译文，再运行 `npm run check`。保留消息键、占位符名称、重复次数和空格，保持 HTML 标记及其语义。

优先使用国内网盘常见表达，如“团队空间”“回收站”“个人空间”。完整术语与语义边界统一维护在仓库的 [中文用语](https://github.com/roojay/web-app-zh-cn/blob/main/.agents/skills/opencloud-zh-cn-maintenance/references/terminology.md)，不要机械替换“存储空间”或空白字符等不同概念。

### Agent 维护入口

Git 仓库内提供 [opencloud-zh-cn-maintenance](https://github.com/roojay/web-app-zh-cn/blob/main/.agents/skills/opencloud-zh-cn-maintenance/SKILL.md) skill，覆盖日常改译、上游词条同步、构建发行和译文未生效排查。它复用现有脚本，无需安装全局 skill；克隆仓库后，Codex 可从 `.agents/skills/` 发现它，其他 agent 可直接读取 `SKILL.md` 并按需读取参考资料。

示例：`使用 $opencloud-zh-cn-maintenance 修正分享相关中文，保留英文键和占位符并完成校验。`

适配新版时提供目标 OpenCloud Web / 应用版本或可复核的词表来源；服务端版本不能直接当作 Web 或 SDK 版本。

## 发布

源码包包含独立构建所需的输入、锁文件、脚本和文档。`npm run package` 生成的安装 ZIP 和源码 ZIP 均不收录 `.agents/`；维护 skill 保留在 Git 仓库中。

1. 确认 `package.json` 版本及 `CHANGELOG.md`。版本变化时用 `npm install --package-lock-only` 同步锁文件，并更新安装示例中的版本参数。
2. 运行 `npm ci && npm run package`，从源码包解压后复核能独立构建。
3. 在[项目 Releases](https://github.com/roojay/web-app-zh-cn/releases) 中创建对应版本，上传安装 ZIP、源码 ZIP、`SHA256SUMS`。
4. `.github/workflows/ci.yml` 执行构建和打包并保存 artifact；它不会自动向 npm、GitHub Release 或应用商店发布。`private: true` 用于避免误发 npm，不影响 GitHub 开源和发行附件。

## 许可与来源

采用 [AGPL-3.0-only](./LICENSE)，保留 OpenCloud Web 原始消息和已有译文的来源说明，见 [NOTICE](./NOTICE)。这是社区定制模块，并非 OpenCloud 官方中文发行版。发行包同时携带其构建运行时代码所需的第三方许可说明。

## 官方参考

- [Web Application 骨架](https://github.com/opencloud-eu/web-app-skeleton)
- [扩展系统与 Extension SDK](https://docs.opencloud.eu/docs/dev/web/extension-system/)
- [安装 Web 应用](https://docs.opencloud.eu/docs/admin/configuration/web-applications/)
- [应用商店发布格式](https://github.com/opencloud-eu/awesome-apps/tree/main/webApps)
