---
title: 集群管理
sidebar_label: 集群管理
description: 创建集群定义、纳管已有进程或一键安装，并完成节点启停与日常运维。
---

集群是 STX 对一套 SeaTunnel Engine（Zeta）部署的管理对象：名称、部署模式、版本，以及若干 **节点**（主机 + 角色 + 安装目录 + 端口）。  
在 Web UI 或 CLI 里「创建集群」**只写入定义，不会自动拉起进程**；真正跑起来要靠「纳管已有进程」或「一键安装」。

前置：至少一台 [主机](./host-management) 上的 Agent 已在线。

Web UI 的 **集群管理** 列表可按运行中 / 部署中 / 已停止筛选；卡片上可见部署模式、节点数、版本，并可直接停止或进入详情：

![集群管理列表](/img/screenshots/04-clusters.png)

## 概念对照

| 概念 | 取值 / 默认 | 说明 |
| :--- | :--- | :--- |
| **部署模式** | 混合 / 分离 | 混合：Master+Worker 同进程；分离：独立 Master / Worker 进程 |
| **节点角色** | Master、Worker、Master/Worker | 混合模式常用 Master/Worker |
| **集群状态** | 已创建 → 部署中 → 运行中 / 已停止 / 异常 | 刚创建时为「已创建」 |
| **节点状态** | 待部署 / 安装中 / 运行中 / 已停止 / 异常；还可能显示离线 | 离线表示该节点所在主机的 Agent 不在线 |
| **默认端口** | Master 通信 `5801`、API `8080`、Worker 通信 `5802` | 可按节点覆盖 |

底层启停命令（由 Agent 在被纳管主机上执行）：

```bash
# 混合模式
$SEATUNNEL_HOME/bin/seatunnel-cluster.sh -d

# 分离模式
$SEATUNNEL_HOME/bin/seatunnel-cluster.sh -d -r master
$SEATUNNEL_HOME/bin/seatunnel-cluster.sh -d -r worker
```

## 两条路径怎么选

| 路径 | 适用 | 做什么 |
| :--- | :--- | :--- |
| **纳管已有集群** | 机器上已有 SeaTunnel 进程在跑 | 创建集群与节点 → Agent 扫进程 → 绑定进程与安装目录 |
| **一键安装** | 空机器，要装新版本 | STX 安装机上已有安装包 → 选主机与角色 → 预检 → 分发、解压、写配置、启动 |

推荐纳管顺序：

1. 在 Web UI 创建集群（填版本、部署模式）
2. 选主机、分配角色（可先占位安装目录 / 端口）
3. 对该主机执行 **发现进程**
4. 把扫到的 PID、角色、安装目录绑到已有节点

## 方式一：纳管已有进程

1. **集群管理** → 创建集群：名称、混合或分离、SeaTunnel 版本。
2. 添加节点：指定在线主机、角色、安装目录与端口（默认可按上表）。
3. 在主机或节点操作里触发发现（Agent 扫描本机 SeaTunnel 进程）。
4. 确认绑定后，节点应显示进程 PID 与实际安装目录。

:::tip
同机多进程时，务必核对角色与端口，避免把 Worker 绑到 Master 节点记录上。
:::

## 方式二：一键安装

前提：Web UI **安装包管理** 中已有目标版本包（上传或下载）。

典型流程：

1. 选择目标主机与角色（分离模式至少区分 Master / Worker）。
2. **预检**（目录可写、端口未占用等；也可用 CLI：`stx host precheck` / `stx cluster node precheck`）。
3. 提交安装：推包 → 解压到安装目录 → 写入集群发现配置 → 按角色启动。
4. 在 Web UI 查看安装进度；失败可 **重试 / 取消**。

CLI 示例：

```bash
stx cluster create --name demo --deployment-mode hybrid --version 2.3.13 --confirm
stx cluster node add <cluster-id> --host-id <host-id> --role master/worker --confirm
stx host precheck <host-id> --install-dir /opt/seatunnel --port 5801
```

## 日常运维

在集群详情 / 节点列表可对 **整集群** 或 **单节点** 做：

| 操作 | 说明 |
| :--- | :--- |
| **启动 / 停止 / 重启** | 经 Agent 下发 |
| **查看日志** | 拉取节点侧引擎日志，便于排启停与作业异常 |
| **加节点** | 支持单台添加与同机批量添加；建议先预检 |
| **删节点 / 删集群** | 先理清作业与依赖；主机若仍被节点引用则无法从主机管理删除 |

:::tip 停集群前
对关键同步作业先做 Savepoint 或暂停，再执行停止 / 滚动重启，降低丢单风险。
:::

## 和主机管理的边界

- **主机**：机器 + Agent 是否连通、资源心跳
- **集群**：SeaTunnel 拓扑与进程生命周期
- 节点是否可操作，同时取决于节点状态与主机是否在线
