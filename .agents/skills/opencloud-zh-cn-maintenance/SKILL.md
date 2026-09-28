---
name: opencloud-zh-cn-maintenance
description: 维护 web-app-zh-cn 的 OpenCloud 简体中文译文。在调整网盘术语、同步上游英文词条、排查译文未生效或验证中文扩展发行包时使用。
---

# OpenCloud 简体中文维护

让译文符合国内网盘使用习惯，同时保留英文原意和 OpenCloud 消息格式。这个 skill 仅在 Git 仓库中维护，复用项目的词表、检查和打包入口，不加入构建生成的安装包或源码包。

## 定位与选择流程

本 skill 所在目录的 `../../..` 是项目根目录，先确认该目录的 `package.json.name` 为 `web-app-zh-cn`。下文命令均在项目根目录执行；Markdown 链接相对当前文件解析。

| 当前任务 | 读取与操作 |
|---|---|
| 修正文案、统一术语、补已知漏译 | 读取 [中文用语](references/terminology.md)，定位英文键及页面上下文，修改对应译文 |
| 适配新版 Web 或新增应用 | 读取 [同步上游](references/upstream-sync.md)，先确定英文词条来源，再同步基线和译文 |
| 译文未生效、调整加载方式、准备发行 | 读取 [构建、发布与运行验证](references/release-and-runtime.md) |

只读取当前任务相关的参考资料。普通文案修改无需重新采集整套上游词表，也无需升级依赖。

## 文件职责

| 文件（相对项目根目录） | 维护职责 |
|---|---|
| `l10n/translations.json` | 唯一中文源词表，结构为 `{ "zh": { "英文消息键": "中文译文" } }` |
| `l10n/source-keys.json` | 独立英文消息键基线；不能从中文词表反向生成来消除报错 |
| `src/index.ts` | 通过官方 `defineWebApplication` 注册译文，不新增页面或菜单 |
| `vite.config.ts` | 通过官方 SDK 构建，并输出同源的静态词表与许可文件 |
| `scripts/check.mjs` | 类型检查之外的词条、占位符和构建产物校验 |
| `scripts/package-release.mjs` | 安装包、源码包与 SHA-256 清单；源码采用明确的收录列表 |
| `README.md` / `NOTICE` / `CHANGELOG.md` | 安装与兼容范围、词表来源、实际变更记录 |

## 修改译文

1. 用 `rg -n -F` 定位英文键或现有中文，结合调用位置、截图或目标版本页面确认含义。同一英文键可能被多个页面复用；影响权限或删除语义时核对相关入口。
2. 以英文原意和 [中文用语](references/terminology.md) 为准修改值。已有正确译文优先保留，不整库重译；常规文案修改不动英文键基线。
3. 保持现有 JSON 排版和键顺序，避免无关重排；查看新增、删除、改译的实际范围。当前基线的数量见 README，升级后以真实英文集合为准。
4. 根据下面的验证范围检查，再汇报变化与证据。仅在发行或兼容范围发生变化时同步相应版本说明。

## 格式与运行约束

- 语言键保持 `zh`。模块名中的 `zh-cn` 不代表可以把词表根节点改为 `zh-CN`。
- 英文消息键大小写、标点、空格均参与匹配，不为改善排版修改它们。
- `%{name}` 与 `%{ name }` 不等价。逐条保留占位符名称、内部空格和出现次数；可以按中文语序调整位置。
- 保留换行、转义、链接变量，以及存在时的 HTML 标签和属性语义；不要新增脚本、远程链接或改变插值的转义方式。
- 当前中文值必须是非空字符串。上游如引入复数数组、上下文键或新插值格式，先确认目标运行时语义及校验器支持，不能静默扁平化或删键。
- `src/index.ts` 的 JSON 导入与构建输出的 `translations.json` 使用同一份源文件；静态词表由 Vite 输出，不手改 `dist/` 或维护第二份源词表。
- 保持现有应用译文与 `customTranslations` 两个加载入口；需要改变它们时先验证目标版本的合并顺序。构建成功不能证明页面最终选中了本扩展译文。

## 按影响验证

| 改动范围 | 适用检查 |
|---|---|
| 仅译文或英文基线 | `node scripts/check.mjs`；检查受影响语句的原意、标签与页面上下文 |
| TypeScript、加载方式或构建配置 | `npm run build`（已含类型、词条、构建产物检查） |
| 准备发行、版本或源码收录列表变化 | `npm run package`，再按发布参考核对 ZIP 内容和校验和 |
| 仅维护说明或 skill | 核对路径、命令和实际实现；改变打包范围时检查源码 ZIP |

缺少依赖或锁文件改变时使用 `npm ci`，Node/npm 要求以项目配置为准。复用现有脚本，不另造一套重复校验。`check.mjs` 能验证键覆盖和占位符，不能判断中文语义、HTML 安全、真实上游覆盖率或页面效果。

## 交付范围

说明目标版本或词表来源、修改范围、实际执行的检查及未验证项。有条件时检查受影响页面；未连接目标环境时明确页面效果尚未验证，不将本地通过写成生产验证。

源码维护本身不包含部署、Git 提交或对外发布；需要这些动作时遵循用户在当前任务中的授权。不要把机器地址、密码、令牌或一次性采集数据写入本公开项目。

## Skill 设计依据

2026-09-28 核对：[Agent Skills 规范](https://agentskills.io/specification)、[Codex 项目内技能](https://learn.chatgpt.com/docs/build-skills)、[技能编写实践](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)、[精简技能与按需加载](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)。本 skill 采用简短触发描述、按任务读取参考资料，并复用项目校验入口。
