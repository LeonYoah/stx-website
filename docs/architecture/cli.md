---
title: STX CLI
sidebar_label: STX CLI
description: 使用 stx 命令连接 STX Server，查询集群、查看日志并执行操作。
---

STX 客户端和服务端用的是同一个二进制文件：运行 `stx server` 启动服务；运行 `stx login`、`stx cluster list` 是操作远端 STX。你可以把这个文件复制到同架构的 Linux 机器上，只用它的 CLI 能力，不必登录 STX 安装机。这和部署 Hadoop 后使用 `hadoop` 命令操作文件很像。需要在被纳管主机上执行的操作，仍由 Server 通知 `stx-agent`。

## 先试几条命令

假设 STX Server 在 `10.0.0.10`。在装好 CLI 的机器上执行：

```bash
stx login --server http://10.0.0.10:17800
stx whoami
stx cluster list --output table
stx sync job list --status FAILED --output table
```

`login` 会提示输入用户名和密码。查询命令不会更改远端环境。看到失败的作业编号后，用 `stx sync job logs <作业编号> --lines 40` 查看日志；`stx sync job logs --help` 可查看可用参数。STX CLI 不负责替你判断故障：人或 AI Agent 可以依据输出继续排查。

要让 AI Agent 调用 `stx`，在本机执行 `stx skill install`（见[给 AI Agent 安装 Skill](#给-ai-agent-安装-skill)）。**Skill 是本机命令说明，不是另一个服务。**

还没有安装 CLI？先看[快速部署中的「安装 STX CLI」](../get-started/quick-start#安装-stx-cli)，按本机是否同时运行 STX Server 选择步骤。

## 客户端与服务端

STX Server 的默认 API 地址是 `http://10.0.0.10:17800`（示例 IP）。同机使用 CLI 时也可连接 `http://127.0.0.1:17800`。登录后先用只读命令查看当前环境，写操作需要明确确认。

:::note
`stx server` 用于启动 STX Server。只复制 `stx` 到另一台机器，并运行 `stx login`、`stx host …` 等命令，不会启动服务。
:::

## 它怎么工作

```mermaid
flowchart LR
  You["你的终端"] -->|HTTP /api/v1| Server["STX Server<br/>默认 :17800"]
  You --> Local["本机配置<br/>~/.config/stx/config.yaml"]
  Local -.->|记下 server / token| You
```

1. 用 `stx login` 登录某台 STX 安装机的 API（默认端口 **17800**）。
2. 登录成功后，本机记下该环境的地址与令牌（见下方「命名空间」）。
3. 之后的 `stx host …`、`stx cluster …` 等命令，都是带着令牌去调同一套 HTTP API；需要动被纳管主机时，仍由 Server 经 stx-agent 下发。

CLI 只跟 **STX Server** 说话；要动被纳管主机上的 SeaTunnel，仍由 Server 经 **stx-agent**（边上的探针进程）下发，命令行不会绕过这层。

## 登录与命名空间

本地配置默认路径：

- `$XDG_CONFIG_HOME/stx/config.yaml`，或
- `~/.config/stx/config.yaml`

一个配置文件里可以有多个 **命名空间**（namespace）：每个对应一套「Server 地址 + 登录态」，方便在测试 / 生产之间切换。

```bash
# 登录（会提示用户名密码；也可用参数 / 环境变量）
stx login --server http://10.0.0.10:17800

# 看当前身份
stx whoami

# 列出 / 切换本地命名空间
stx namespace list
stx namespace use <name>

stx logout
```

### 举例

| 场景 | 做法 |
| :--- | :--- |
| 只管一台 STX | `stx login --server http://10.0.0.10:17800`，之后直接敲业务命令 |
| 同时管测试与生产 | 分别 login 到不同 `--server`，用 `stx namespace use …` 切换 |
| 临时指定环境 | 命令上加 `--namespace`，或设环境变量 `STX_SERVER` / `STX_NAMESPACE` |

常用环境变量：`STX_SERVER`、`STX_NAMESPACE`、`STX_TOKEN`、`STX_TIMEOUT`（默认请求超时 **30s**）、`STX_OUTPUT`、`STX_USERNAME`。

## 命令风险设计

操作在服务端登记了风险等级。对 CLI 的直观影响：

| 等级 | 典型含义 | CLI 行为 |
| :--- | :--- | :--- |
| **R0** | 查询、预检等只读或低影响 | 直接执行，**不需要** `--confirm` |
| **R1+** | 创建、更新、启停、安装等会改状态 | 必须加 `--confirm`，否则拒绝执行 |
| 更高风险（如部分删除 / 重启类） | 影响面更大 | 仍要 `--confirm`；个别操作服务端还会要求二次确认（见下） |

写操作还可带：

- `--idempotency-key`：同一请求重试时保持幂等（不传则 CLI 自动生成）
- `--confirmation-id`：服务端返回「需要二次确认」时，用返回的 ID 再执行一次

```bash
# 只读：列主机
stx host list

# 写入：必须确认
stx host create --name node-1 --ip-address 10.0.0.21 --confirm
stx cluster create --name demo --deployment-mode hybrid --version 2.3.13 --confirm
stx cluster restart 6 --confirm
```

## 输出格式

全局参数（根命令）：

| 参数 | 说明 |
| :--- | :--- |
| `--output` / `-f` | `json`（默认）、`table`、`yaml`、`raw` |
| `--pick` | 只保留结果里指定的顶层字段（逗号分隔） |

适合人眼浏览用 `table`；给脚本解析用默认 `json`。

```bash
stx host list --output table
stx whoami --pick username,roles
```

## 和 Web UI、AI Agent 的关系

| | Web UI | CLI |
| :--- | :--- | :--- |
| 入口 | 浏览器 → 安装机 **17880** | 终端 / AI Agent → 安装机 API **17800** |
| 适合 | 可视化、引导安装、看拓扑与进度 | 脚本、批量、CI；以及模型通过命令行操控 STX |
| 鉴权 | 浏览器会话 | `login` 写入本地命名空间的 token |
| 写保护 | 界面上的确认框 | `--confirm`（及必要时的二次确认） |

人和 AI Agent 走同一套命令与确认规则。AI Agent 通过本机 Skill 调用 `stx`，而不是模拟点击页面。

## 给 AI Agent 安装 Skill

在跑 AI Agent 的同一用户下安装本机说明文件（不访问 Server；查询/改环境前仍要 `stx login`）：

```bash
stx skill install
stx skill status --output table
```

| `--target` | 路径 |
| :--- | :--- |
| `claude` | `~/.claude/skills/stx/SKILL.md` |
| `agents` | `~/.agents/skills/stx/SKILL.md` |
| `all`（默认） | 两处都写 |

`install` 不覆盖已有文件；升级 CLI 后用 `stx skill update`。语言默认跟本机 locale，可用 `--language zh-CN` / `en`。

## 审计日志

专门为 CLI（尤其是 AI Agent 调用）做了审计侧优化：**每一次** `stx` 远端调用都要有迹可循。模型可能误停集群、误改配置；没有清晰的来源与请求编号，事后很难查清「是谁、哪一次调用」导致的问题。

Web UI 的审计列表里，「来源」会标成 **CLI** / **Web** / **系统**，一眼能分出是命令行还是页面发起的：

![审计日志：来源列可见 CLI 与 Web](/img/screenshots/10-audit-log.png)

### 调用时带上什么

CLI 访问 STX Server 时会自动带上：

| 标记 | 作用 |
| :--- | :--- |
| **`X-STX-Client: cli`** | 标明来源是命令行（不是 Web UI） |
| **`X-Request-ID`** | 本次调用的请求编号；同一次操作里下发给 stx-agent 的命令共用这个编号，方便串起来查 |

写操作还会带上确认 / 幂等相关头（见上文 `--confirm`）。敏感参数入库前会脱敏，审计里不应出现密码原文。

### 两类记录怎么用

| 记录 | 看什么 | 常用查询 |
| :--- | :--- | :--- |
| **审计日志** | 谁（用户）、用哪种客户端、对什么资源做了什么、结果如何 | `stx audit list --client_type cli` |
| **命令日志** | STX Server 实际下发给 stx-agent 的命令及执行状态 | `stx audit command list --request_id <id>` |

详情里可看 **执行与命令调用追查**：同一次操作（如 `diagnostics.task.create`）下，边上 stx-agent 实际执行了哪些命令，例如 `get_logs`、`thread_dump`（含 `jcmd … Thread.print` 等），便于核对 AI / 脚本是否下对了令。

![执行与命令调用追查：实际执行命令](/img/screenshots/17-command-trace.png)

排查「AI / 脚本刚执行过什么」时，典型路径：

1. `stx audit list --client_type cli --size 50`（必要时加 `--result_status failed`、时间范围）
2. 从条目里取出 `request_id`
3. `stx audit get <审计条目 id>` 看详情；再用同一 `request_id` 查 `stx audit command list`，看边上探针实际执行是否成功

Web UI 的「审计日志」页同样可按客户端类型等条件筛选；CLI 与页面查的是同一批数据。

```bash
# 只看命令行来源的操作
stx audit list --client_type cli --size 50 --output table

# 某次请求牵出的 Agent 侧命令
stx audit command list --request_id <request_id> --output table
```

## 最小上手路径

```bash
# 1. 能访问 STX API
curl -sS http://10.0.0.10:17800/api/v1/health

# 2. 登录
stx login --server http://10.0.0.10:17800 --username admin

# 3. 只读探路
stx whoami
stx host list --output table

# 4. 再做写入（务必 --confirm）
stx cluster create --name demo --deployment-mode hybrid --version 2.3.13 --confirm
```

主机 / 集群具体操作见 [主机管理](../host-cluster/host-management) 与 [集群管理](../host-cluster/cluster-management)；整体进程与端口见 [系统架构](./overview)。
