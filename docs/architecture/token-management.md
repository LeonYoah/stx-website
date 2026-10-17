---
title: 令牌管理
sidebar_label: 令牌管理
description: 管理员签发 CLI 令牌，给脚本和调度 Worker 使用；原文只显示一次。
---

管理员在 **用户管理** 里给某个账号签发 CLI 令牌。脚本、CI 和 Dolphin Worker 用这份令牌调用 STX，不必再输入密码。令牌以 `stx_` 开头；原文只在签发时出现一次，列表里只看得到前缀。

## 打开令牌管理

Web UI 底栏 **用户管理** → 页内 Tab **令牌管理**（`/admin/users?tab=tokens`）。副标题是「为 CLI、脚本和调度 Worker 签发令牌」。

![令牌管理：列表、筛选与前缀掩码](/img/screenshots/31-token-management.png)

| 筛选 | 含义 |
| :--- | :--- |
| **全部 / 有效 / 已过期 / 已吊销** | 顶部计数可切换列表 |
| **搜索令牌名称** | 按名称过滤，例如 `dolphin-worker` |

| 列 | 看什么 |
| :--- | :--- |
| **名称** | 签发时填的名字 |
| **所属用户** | 这份令牌代表谁 |
| **前缀** | 形如 `stx_xxxx******`，不是原文 |
| **有效期** | 到期时间；永久则显示 **永久** |
| **最近使用** | 上次用这份令牌访问 STX 的时间 |
| **状态** | **有效** / **已过期** / **已吊销** |

## 签发令牌

点 **签发令牌**。管理员签发时，有效期默认是 **永久**。填好后点 **创建**。

![签发令牌：名称、所属用户与有效期](/img/screenshots/32-token-issue.png)

| 字段 | 说明 |
| :--- | :--- |
| **名称** | 必填。例如 Worker 用 `dolphin-worker`，本机脚本用 `ops-laptop` |
| **所属用户** | 必填。令牌以该用户身份访问 STX |
| **有效期** | **7 天** / **30 天** / **90 天** / **永久** / **自定义**（1 到 3650 天） |

签发成功后弹出 **复制令牌**。界面写明：令牌原文只显示一次，关闭后无法再查看。立刻复制，再写到 Worker 或本地配置里。

也可以用命令行签发：

```bash
stx admin token create --user-id 1 --name dolphin-worker --expires-in never --confirm
stx admin token list --current 1 --size 20 --output table
```

`--expires-in` 可以是 `7d`、`30d`、`90d`、`never`，或 `60d` 这种自定义天数。

## 给 CLI 或 Worker 使用

假设 STX 安装机是 `10.0.0.10`。拿到 `stx_` 原文后，在要跑命令的那台机器上绑定：

```bash
stx login --server http://10.0.0.10:17800 --token stx_...
stx whoami
```

也可以从标准输入读入，避免出现在命令历史里：

```bash
printenv STX_TOKEN | stx login --server http://10.0.0.10:17800 --token-stdin
```

Worker 环境用 `STX_SERVER` 和 `STX_TOKEN` 即可，不必再走用户名密码。令牌登录不能和用户名、密码一起用。

密码登录是另一条路：`stx login --server http://10.0.0.10:17800` 会提示用户名密码，默认签发 **7 天** 令牌；需要更长或永久时加 `--expires-in 30d` 或 `--expires-in never`。

把任务挂到 DolphinScheduler 时，推送只写 SHELL 节点，不会替 Worker 签发或写入 `STX_TOKEN`。Worker 仍要按上面绑定。见 [DolphinScheduler 外部调度](../workbench/dolphin-scheduler)。

## 吊销

列表里对 **有效** 令牌点 **吊销令牌**。确认文案是：使用该令牌的登录和脚本会立即失效。

```bash
stx admin token revoke 1 --confirm
```

`stx logout` 会吊销**当前这台机器**正在用的那份登录令牌。

## 审计日志

Web UI **审计日志** 增加了 **令牌** 列：CLI 显示令牌名称和前缀，Web 显示 **会话**。来源仍是 **CLI** / **Web** / **系统**。

审计页的用法见 [STX CLI](./cli#审计日志)。
