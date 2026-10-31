---
title: 快速部署 STX
sidebar_label: 快速部署
description: 在 Linux 上安装 STX、接入主机，并在本机或另一台机器上使用 STX CLI。
---

在一台 Linux 机器上安装 STX 后，你会得到 Web UI、STX Server 和 Agent 所需的 gRPC 服务。本文介绍如何用安装脚本安装 STX。

## 安装前检查

| 检查项 | 要求 |
| :--- | :--- |
| 系统 | Linux，glibc ≥ 2.17；支持 Ubuntu / Debian、Rocky / Alma / RHEL 8+、CentOS 7 等。**推荐**带 systemd；容器 / CI 等无 systemd 环境加 `--no-systemd` |
| 架构 | amd64 或 arm64；CentOS 7 仅支持 amd64 |
| 网络 | 浏览器能访问 STX 安装机的 `17880`；被纳管主机能访问 STX 安装机的 `17800` 和 `17890` |
| 磁盘 | 安装目录所在分区约 700 MB；带本地监控组件约 2.2 GB |
| 命令 | `bash`、`curl`、`tar`、`gzip`、`sha256sum`；不需要 Node.js 和 python3（离线包自带 Node） |
| 权限 | root（用 `sudo` 执行安装脚本） |

:::note
一键安装面向 Linux。macOS 和 Windows 可用于本地开发，不是这套安装脚本的目标系统。
:::

## 1. 一键安装

在准备作为 **STX 安装机** 的 Linux 机器上执行一条命令。安装目录默认为 `/opt/stx`。

```bash
# 中国网络（推荐）
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | sudo bash

# 直接访问 GitHub
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | sudo bash
```

脚本按 CPU 架构和 glibc 版本下载对应的[离线包](#离线安装)，校验 sha256 后安装；CentOS 7 等 glibc < 2.28 的系统自动使用 CentOS 7 专用包。不加 `-y` 时会提问端口、对外访问 IP、数据库和管理员密码，直接回车即使用默认值。

无 systemd 时（例如部分容器或 CI 环境）加 `--no-systemd`；非 root 还需同时指定当前用户可写的 `--install-dir`。

### 选择下载线路

脚本默认测速后使用最快的线路，失败时自动换下一条。可用 `--mirror` 固定线路（编号或名称，也可以是自己的代理前缀）：

| 编号 | 名称 | 地址 |
| :--- | :--- | :--- |
| 1 | `gh-proxy` | `https://gh-proxy.org`（Cloudflare 主站加速） |
| 2 | `v4` | `https://v4.gh-proxy.org`（Cloudflare 优选，推荐，仅 IPv4） |
| 3 | `v6` | `https://v6.gh-proxy.org`（Cloudflare 优选，支持 IPv6） |
| 4 | `cdn` | `https://cdn.gh-proxy.org`（Fastly CDN） |
| 5 | `axisnow` | `https://axisnow.gh-proxy.org`（AxisNow 三网优选） |
| 6 | `github` | GitHub 直连 |

```bash
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | sudo bash -s -- --mirror v4
```

### 常用参数

参数加在命令后，例如 `curl -fsSL ... | sudo bash -s -- -y --install-dir /data/stx`：

| 参数 | 作用 |
| :--- | :--- |
| `-y` | 不提问，全部使用默认值 / 参数值 |
| `--install-dir /opt/stx` | 安装目录，默认 `/opt/stx` |
| `--admin-password xxx` | admin 初始密码 |
| `--frontend-port` / `--http-port` / `--grpc-port` | Web UI / HTTP API / gRPC 端口，默认 `17880` / `17800` / `17890` |
| `--external-ip 10.0.0.10` | 对外访问 IP 或域名 |
| `--db-type sqlite\|mysql\|postgres` | 数据库，默认 `sqlite`；`postgres` 也可写 `pg` |
| `--db-host` / `--db-port` / `--db-user` / `--db-password` / `--db-name` | MySQL / PostgreSQL 连接参数；密码也可用环境变量 `STX_DB_PASSWORD` |
| `--without-observability` | 不安装本地监控组件（Prometheus / Alertmanager / Grafana） |
| `--prometheus-port` / `--alertmanager-port` / `--grafana-port` | 本地监控组件端口，默认 `9090` / `9093` / `3000` |
| `--mirror v4` | 固定下载线路（仅一键安装 / `download-bundle.sh`） |
| `--variant amd64\|arm64\|centos7` / `--version <tag>` | 指定离线包类型 / 版本（仅一键安装 / `download-bundle.sh`） |
| `--without-node` | 不用包内 Node，改用本机 Node ≥ 18.18 |
| `--service-user stx` | 用指定用户运行服务（默认 root） |
| `--no-autostart` / `--no-systemd` / `--no-start` | 不开机自启 / 不创建 systemd 服务 / 安装后不启动 |

使用外部数据库的示例：

```bash
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh \
  | sudo bash -s -- --db-type postgres --db-host 10.0.0.5 --db-user stx --db-name stx
```

:::note sudo
安装需要 root。不用 sudo 执行时，脚本会在任何检查和提问之前退出，并打印带 `sudo` 的完整命令。只有同时指定当前用户可写的 `--install-dir` 和 `--no-systemd` 时才可以不用 root。
:::

安装完成后检查状态：

```bash
/opt/stx/bin/status.sh
# 使用 systemd 安装时也可查看
systemctl status stx
```

## 2. 打开 Web UI

假设 STX 安装机的 IP 是 `10.0.0.10`，在浏览器中打开 `http://10.0.0.10:17880`，用 `admin` 和安装时设置的密码登录（直接回车的为 `admin123`，登录后请尽快修改）。

![STX 登录页](/img/screenshots/00-login.png)

| 服务 | 默认端口 | 谁需要访问 |
| :--- | :--- | :--- |
| Web UI | `17880` | 使用浏览器的人 |
| STX Server HTTP API | `17800` | Web UI、CLI 和被纳管主机上的安装脚本 |
| stx-agent gRPC | `17890` | 被纳管主机上的 `stx-agent` |

安装结果末尾会打印后续步骤；接入主机和创建集群见 [主机管理](../host-cluster/host-management) 和 [集群管理](../host-cluster/cluster-management)。

## 安装 STX CLI

STX 客户端和服务端用的是同一个二进制文件：运行 `stx server` 时启动 STX Server；运行 `stx login`、`stx cluster list` 等命令时，它就是客户端。可以把它理解成 Hadoop 部署后的 `hadoop` 命令。

### 客户端和服务端在同一台机器

整套 STX 安装完成后，直接使用安装目录中的文件，不需要再安装 CLI：

```bash
/opt/stx/stx login --server http://127.0.0.1:17800
/opt/stx/stx cluster list --output table
```

如果安装时改了 `--install-dir`，将 `/opt/stx` 换成自己的目录。登录会提示输入用户名和密码；本机登录信息保存在执行命令的用户目录中。

### 客户端与服务端分离

假设 STX 安装机是 `10.0.0.10`，另一台 Linux 机器只需通过 CLI 远程操作。**两台机器 CPU 架构相同时，直接复制安装机上的 `/opt/stx/stx` 即可**。在客户端机器执行：

```bash
scp user@10.0.0.10:/opt/stx/stx ./stx
chmod +x ./stx
./stx login --server http://10.0.0.10:17800
./stx cluster list --output table
```

把 `user` 换成能读取该文件的 SSH 用户名。客户端不需要安装 Web UI、Node.js 或 stx-agent。复制这个文件不会在客户端启动 STX Server；客户端只需能访问安装机的 **17800** 端口。

不能使用 SSH 时，也可以通过 U 盘或内网文件传输复制同一个文件，放到客户端后从 `chmod +x ./stx` 继续。客户端安装时可以不连外网，但运行远程命令时仍要连通 STX Server。

:::note 架构不同怎么办
先在两台机器分别运行 `uname -m`。如果一台是 `x86_64`，另一台是 `aarch64`，不能直接复制安装机上的文件。请在能联网的机器上下载**与客户端架构及 STX Server 版本相符**的 Release 文件（`stx-linux-amd64` 或 `stx-linux-arm64`），再复制到客户端并命名为 `stx`。只复制二进制文件是为了使用 CLI，不会安装完整服务。
:::

下一步看 [STX CLI 用法](../architecture/cli)。给 AI Agent 用时执行 `stx skill install`（见 [安装 Skill](../architecture/cli#给-ai-agent-安装-skill)）。

## 其他安装方式

### 离线安装

每个 Release 附带三个完整离线包，包含 STX Server、Web UI、stx-agent、Node、本地监控组件，各带一个 `.sha256` 校验文件。按 STX 安装机选择：

| 离线包 | 适用系统 | 怎么判断 |
| :--- | :--- | :--- |
| `stx-offline-linux-amd64.tar.gz` | x86_64，glibc ≥ 2.28：Ubuntu 20.04+、Debian 10+、Rocky / Alma / RHEL 8+ 等 | `uname -m` 输出 `x86_64`，`ldd --version` 首行 ≥ 2.28 |
| `stx-offline-linux-arm64.tar.gz` | aarch64，glibc ≥ 2.28 | `uname -m` 输出 `aarch64` |
| `stx-offline-linux-amd64-centos7.tar.gz` | x86_64，glibc < 2.28：**CentOS 7**、RHEL 7 | `ldd --version` 首行是 2.17 等 |

上表是最新 Release 的固定文件名。指定版本时，文件名形如 `stx-vX.Y.Z-linux-amd64-offline.tar.gz`，下载地址把 `latest/download` 换成 `download/vX.Y.Z`。

在能联网的机器上下载，6 条线路任选一条（哪条快用哪条）。以 CentOS 7 为例：

```bash
F=stx-offline-linux-amd64-centos7.tar.gz   # 换成上表中你需要的文件名
U=https://github.com/LeonYoah/stx/releases/latest/download/$F

wget "https://gh-proxy.org/$U"          # 1) Cloudflare 主站加速
wget "https://v4.gh-proxy.org/$U"       # 2) Cloudflare 优选（推荐，仅 IPv4）
wget "https://v6.gh-proxy.org/$U"       # 3) Cloudflare 优选（支持 IPv6）
wget "https://cdn.gh-proxy.org/$U"      # 4) Fastly CDN
wget "https://axisnow.gh-proxy.org/$U"  # 5) AxisNow 三网优选
wget "$U"                               # 6) GitHub 直连

# 校验文件用同一条线路下载，例如：
wget "https://v4.gh-proxy.org/$U.sha256"
```

也可以让脚本测速下载：`curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash -s -- --variant centos7`。

把两个文件复制到 STX 安装机后安装：

```bash
sha256sum -c stx-offline-linux-amd64-centos7.tar.gz.sha256
tar -xzf stx-offline-linux-amd64-centos7.tar.gz
cd stx-*-offline/
sudo ./install.sh
```

[常用参数](#常用参数)与一键安装相同（如 `sudo ./install.sh -y --db-type postgres ...`，无 systemd 时加 `--no-systemd`）；下载相关的 `--mirror`、`--variant`、`--version`、`--bundle-file` 不适用于 `install.sh`，它安装的就是当前目录这个离线包。离线包默认按包内组件安装，一般**不必**再加 `--offline`。

这只装好 STX 控制面。无网环境还要装 SeaTunnel 集群时，须另备 [SeaTunnel 离线资产包](../packages-plugins/package-management#离线导出资产包)（安装包 ± 插件），在有网侧的 STX 里导出后拷过来导入。

### Docker Compose

```bash
mkdir -p stx-docker && cd stx-docker
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/stx-docker-compose.tar.gz | tar -xz
cd docker
cp config.example.yaml config.yaml   # 改 database.type 等时请保留 database.enabled: true
mkdir -p data && chmod -R 777 data
# 使用中国镜像：
cp .env.cn.example .env
docker compose up -d                 # 默认使用 MySQL；sqlite 可用 docker-compose.sqlite.yml
```

本机浏览器打开 **Web UI** `http://127.0.0.1:17880`（API 为 `17800`）。安装包目录中的 SeaTunnel 推荐版本以 Web UI 为准。

### 单容器体验（不含监控）

```bash
# GHCR
docker run -d -p 17800:17800 -p 17880:17880 -p 17890:17890 ghcr.io/leonyoah/stx-all-in-one:latest

# 华为云 SWR
docker run -d -p 17800:17800 -p 17880:17880 -p 17890:17890 swr.cn-east-3.myhuaweicloud.com/stx/stx-all-in-one:latest
```

### 启停服务

```bash
/opt/stx/bin/start.sh
/opt/stx/bin/stop.sh
/opt/stx/bin/status.sh
# 使用 systemd 安装时也可执行 systemctl restart stx
```

`start.sh` 默认按 `observability.enabled` 和本地监控组件的安装情况决定是否启动监控。要明确关闭，执行 `/opt/stx/bin/start.sh --observability off`。

## 安装遇到问题

| 现象 | 检查方法 |
| :--- | :--- |
| 安装前检查提示端口被占用 | 交互安装时按提示换一个端口；用 `-y` 时加 `--http-port` 等参数。查看占用：`ss -lntp \| grep -E '17800\|17880\|17890'` |
| 安装失败 | 按提示查看出错的步骤和日志 `/tmp/stx-install-*.log`（或 `/opt/stx/logs/install.log`） |
| CentOS 7 上提示 glibc 版本过低 | 改用 `stx-offline-linux-amd64-centos7.tar.gz`；一键安装会自动选择 |
| 主机一直不在线 | 从被纳管主机检查能否访问 STX 安装机的 `17800` 和 `17890`，再检查防火墙与安全组 |
| 下载慢或失败 | 换一条[下载线路](#选择下载线路)，或加 `--mirror v4` 等固定线路 |
| 无 systemd / 容器环境安装失败 | 加 `--no-systemd`；非 root 时再加可写的 `--install-dir` |
| 打开 `17800` 看不到登录页 | Web UI 默认在 **`17880`**；`17800` 是 HTTP API |

如果你要在本机开发 STX，而不是安装 Release，请看[源码仓库的开发说明](https://github.com/LeonYoah/stx/blob/main/README_CN.md)。
