---
title: 快速部署 STX
sidebar_label: 快速部署
description: 在 Linux 上安装 STX、接入主机，并在本机或另一台机器上使用 STX CLI。
---

在一台 Linux 机器上安装 STX 后，你会得到 Web UI、STX Server 和 Agent 所需的 gRPC 服务。本文用一键安装完成首次登录，再说明后续步骤和如何接入主机。

## 安装前检查

| 检查项 | 要求 |
| :--- | :--- |
| 系统 | 带 systemd 的 Linux，glibc ≥ 2.17；支持 Ubuntu / Debian、Rocky / Alma / RHEL 8+、CentOS 7 等 |
| 架构 | amd64 或 arm64；CentOS 7 仅支持 amd64 |
| 网络 | 浏览器能访问 STX 安装机的 `17880`；被纳管主机能访问 STX 安装机的 `17800` 和 `17890` |
| 磁盘 | 安装目录所在分区约 700 MB；带本地监控组件约 2.2 GB |
| 命令 | `bash`、`curl`、`tar`、`gzip`、`sha256sum`；不需要 Node.js 和 python3（离线包自带 Node） |

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

脚本会自动识别 CPU 架构和 glibc 版本，下载对应的[离线包](#离线安装)，校验 sha256 后安装。CentOS 7 等 glibc < 2.28 的系统会自动选择 CentOS 7 专用包。

### 选择下载线路

下载前，脚本会对 6 条线路逐条测速，并自动使用最快的一条：

```text
下载 [2/5] 选择下载线路 / choosing a download line...
  测速各下载线路（每条最多 6s）/ probing download lines:
    1) https://gh-proxy.org           Cloudflare (v4) 主站加速              402 ms       800 KB/s
    2) https://v4.gh-proxy.org        Cloudflare (v4) 优选，推荐，仅 IPv4   120 ms      3982 KB/s
    3) https://v6.gh-proxy.org        Cloudflare (v4/v6) 优选，支持 IPv6     80 ms      5924 KB/s
    4) https://cdn.gh-proxy.org       Fastly (v4) CDN                      1230 ms       272 KB/s
    5) https://axisnow.gh-proxy.org   AxisNow (v4) 三网优选，仅 IPv4        2309 ms       174 KB/s
    6) https://github.com             GitHub 直连                          1981 ms       257 KB/s
  ? 选择下载线路编号 [回车=最快的 3]:
```

- 直接回车使用最快的线路，也可以输入编号改选。
- 某条线路下载失败时，脚本会自动换下一条。
- 要固定线路，加 `--mirror`：编号（如 `2`）、名称（`gh-proxy`、`v4`、`v6`、`cdn`、`axisnow`、`github`），或自己的代理前缀。例如 `curl -fsSL ... | sudo bash -s -- --mirror v4`。

### 回答几个问题

安装器先做一次**安装前检查**，一次性列出 CPU / glibc、各端口是否被占用、磁盘空间和 systemd：

```text
[1/7] 安装前检查 / pre-flight checks...
  检查结果 / results:
    ✔ CPU / glibc：amd64 / 2.17
    ✔ Web 控制台端口 / web console port：17880 空闲 / free
    ✘ 后端 API 端口 / backend API port：端口 17800 已被占用 / port 17800 is in use
    ✔ Agent gRPC 端口（Agent 回连）/ agent gRPC port：17890 空闲 / free
    ✔ 磁盘 / disk (/opt/stx)：可用 51200 MB（需要约 2200 MB）
    ✔ systemd：可用，将注册 stx.service
```

然后问几个问题。**直接回车 = 使用 `[ ]` 里的默认值**，大多数情况一路回车即可：

```text
[2/7] 安装配置 / settings...
  ? 管理员 admin 的初始密码 [回车保持默认 admin123]:
  ? Web 控制台端口 / web console port [默认 17880]:
  ? 后端 API 端口 / backend API port：17800 不可用，请输入新端口 [默认 17801]:
  ? Agent gRPC 端口（Agent 回连）/ agent gRPC port [默认 17890]:
  ? 对外访问 IP / 域名（Agent 回连与浏览器访问用）[默认 10.0.0.10]:
  ? 数据库 / database：1) SQLite（内置，无需安装） 2) MySQL [默认 1]:
```

| 问题 | 默认值 | 说明 |
| :--- | :--- | :--- |
| admin 初始密码 | `admin123` | 输入时不显示，需输入两次；至少 6 位 |
| Web UI 端口 | `17880` | 浏览器访问的端口 |
| STX Server HTTP API 端口 | `17800` | Web UI、CLI 和被纳管主机上的安装脚本访问 |
| stx-agent gRPC 端口 | `17890` | 被纳管主机上的 `stx-agent` 回连 |
| 对外访问 IP / 域名 | 自动探测的本机 IP | 写入 `app.external_url`，必须是被纳管主机能访问的地址 |
| 数据库 | SQLite | 选 MySQL 时再问地址、端口、用户、密码、库名 |

- 安装前检查发现被占用的端口会**强制**要求换一个，其余端口回车即可。
- 选 MySQL 时，数据库需要事先创建，表结构由 STX 首次启动自动创建：

  ```sql
  CREATE DATABASE stx DEFAULT CHARACTER SET utf8mb4;
  ```

- 加 `-y`，或在没有终端的环境（如 CI）中运行时，不提问，全部使用默认值和参数值；此时有端口冲突会直接报错，并提示用哪个参数换端口。
- 管理员密码只在首次安装（数据库为空）时生效。重装且沿用已有数据库时不会再问密码。

之后的步骤自动完成：解压安装包、复制文件、写入配置、注册 systemd 服务、启动并等待服务就绪。每一步都显示 `[i/7]` 和 ✔ / ✘；失败时会指出出错的步骤和日志位置（`/tmp/stx-install-*.log`，安装后也会复制到 `/opt/stx/logs/install.log`）。

### 安装完成

最后会打印安装结果：

```text
==================== STX 安装完成 / installed ====================
  访问地址 / URL : http://10.0.0.10:17880
  登录账号 / user: admin
  登录密码 / pass: admin123   ← 默认密码，请登录后尽快修改
  后端 API       : http://10.0.0.10:17800    Agent gRPC 端口: 17890（Agent 回连 10.0.0.10）
  数据库         : SQLite（/opt/stx/data/stx.db）
  可观测性       : Prometheus :9090 / Alertmanager :9093 / Grafana :3000（仅本机监听，经控制台访问）
                   占用磁盘 1.2G，Prometheus 数据在 /opt/stx/observability/prometheus/data 会随时间增长（默认保留 15 天）；不需要可重装时加 --without-observability
  安装目录       : /opt/stx
  配置文件       : /opt/stx/config.yaml   （修改后重启生效）
  日志           : /opt/stx/logs/backend.log  /opt/stx/logs/frontend.log  /opt/stx/logs/install.log
  启动 / start   : /opt/stx/bin/start.sh
  停止 / stop    : /opt/stx/bin/stop.sh
  状态 / status  : /opt/stx/bin/status.sh

后续步骤 / next steps（浏览器打开上面的访问地址并登录）
  A. 还没有 SeaTunnel 集群：
  ...
```

安装时改过密码的，这里只提示「已修改」，不会显示密码。

### 常用参数

需要调整安装方式时，在命令后加参数，例如 `curl -fsSL ... | sudo bash -s -- -y --install-dir /data/stx`：

| 参数 | 作用 |
| :--- | :--- |
| `-y` | 不提问，全部使用默认值 / 参数值 |
| `--install-dir /opt/stx` | 指定安装目录，默认 `/opt/stx` |
| `--admin-password xxx` | 设置 admin 初始密码 |
| `--frontend-port` / `--http-port` / `--grpc-port` | Web UI / HTTP API / gRPC 端口 |
| `--external-ip 10.0.0.10` | 对外访问 IP 或域名 |
| `--db-type mysql --db-host ... --db-port ... --db-user ... --db-password ... --db-name ...` | 使用 MySQL |
| `--without-observability` | 不安装本地监控组件（Prometheus / Alertmanager / Grafana） |
| `--prometheus-port` / `--alertmanager-port` / `--grafana-port` | 本地监控组件端口，默认 `9090` / `9093` / `3000` |
| `--mirror v4` | 固定下载线路 |
| `--variant amd64\|arm64\|centos7` / `--version v1.3.0` | 指定离线包类型 / 版本 |
| `--without-node` | 不用包内 Node，改用本机 Node ≥ 18.18 |
| `--service-user stx` | 用指定用户运行服务（默认 root） |
| `--no-autostart` / `--no-systemd` / `--no-start` | 不开机自启 / 不创建 systemd 服务 / 安装后不启动 |

:::tip 监控组件的磁盘占用
本地监控组件安装后约 1.2 GB，Prometheus 数据会随纳管规模增长（默认保留 15 天）。磁盘紧张时加 `--without-observability`。
:::

安装完成后检查状态：

```bash
/opt/stx/bin/status.sh
# 使用 systemd 安装时也可查看
systemctl status stx
```

## 2. 打开 Web UI

假设 STX 安装机的 IP 是 `10.0.0.10`，在浏览器中打开 `http://10.0.0.10:17880`。把示例 IP 换成自己的机器地址。

![STX 登录页](/img/screenshots/00-login.png)

用户名是 `admin`。密码是安装时设置的密码；安装时直接回车的，密码是 `admin123`，登录后请尽快修改。

登录后会进入概览页：

![STX 概览页](/img/screenshots/01-dashboard.png)

| 服务 | 默认端口 | 谁需要访问 |
| :--- | :--- | :--- |
| Web UI | `17880` | 使用浏览器的人 |
| STX Server HTTP API | `17800` | Web UI、CLI 和被纳管主机上的安装脚本 |
| stx-agent gRPC | `17890` | 被纳管主机上的 `stx-agent` |

## 3. 后续步骤

安装结果的最后会列出后续步骤，按是否已有 SeaTunnel 集群分两种情况。

### 还没有 SeaTunnel 集群

1. **安装包与插件 → 安装包管理**：下载要用的 SeaTunnel 版本。见 [安装包管理](../packages-plugins/package-management)。
2. **安装包与插件 → 插件市场**：下载需要的连接器插件。见 [插件市场](../packages-plugins/plugin-marketplace)。
3. **主机与集群 → 主机管理**：添加要部署 SeaTunnel 的机器，并按安装引导安装 `stx-agent`。
4. **主机与集群 → 集群管理**：创建集群，选择版本、主机和插件。

### 已有 SeaTunnel 集群

跳过上面第 1、2 步：

1. **主机与集群 → 主机管理**：添加运行 SeaTunnel 的机器，并安装 `stx-agent`。
2. 在主机行点击 **自动发现**，导入机器上正在运行的 SeaTunnel 节点。
3. 到 **集群管理** 查看和管理导入的集群。

:::note JDK
STX 不安装 JDK。部署 SeaTunnel 的机器需要先装好 JDK，版本以所选 SeaTunnel 版本的要求为准（2.3.x 常用 JDK 8 / 11）。
:::

### 接入一台主机

1. 在 Web UI 打开 **主机管理**，点击 **创建主机**，填写名称和 IP，类型选 **物理机 / 虚拟机**。
2. 打开该主机的安装引导，复制其中的命令，到**被纳管主机**上执行。
3. 回到主机列表。状态显示在线后，就可以在这台机器上发现 SeaTunnel 进程或安装新集群。

![主机管理列表](/img/screenshots/03-hosts.png)

:::caution 安装地址
安装引导里的地址来自 STX Server 的 `app.external_url`，也就是安装时填的「对外访问 IP」。它必须是被纳管主机能访问到的地址，例如 `http://10.0.0.10:17800`，不能填只在 STX 安装机上可用的 `localhost`。
:::

接下来看 [主机管理](../host-cluster/host-management) 和 [集群管理](../host-cluster/cluster-management)。

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

上表是最新版本的固定文件名。指定版本时，文件名形如 `stx-v1.3.0-linux-amd64-centos7-offline.tar.gz`，下载地址把 `latest/download` 换成 `download/v1.3.0`。

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

安装过程中的提问和结果与[一键安装](#回答几个问题)相同，参数也一样（如 `sudo ./install.sh -y`）。

这只装好 STX 控制面。无网环境还要装 SeaTunnel 集群时，须另备 [SeaTunnel 离线资产包](../packages-plugins/package-management#离线导出资产包)（安装包 ± 插件），在有网侧的 STX 里导出后拷过来导入。

### Docker Compose

```bash
mkdir -p stx-docker && cd stx-docker
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/stx-docker-compose.tar.gz | tar -xz
cd docker
cp config.example.yaml config.yaml   # 按数据库类型修改 database 和密码
mkdir -p data
docker compose up -d                 # 默认使用 MySQL
```

使用中国镜像时，启动前执行 `cp .env.cn.example .env`。本机浏览器打开 `http://127.0.0.1:17880`。

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

如果你要在本机开发 STX，而不是安装 Release，请看[源码仓库的开发说明](https://github.com/LeonYoah/stx/blob/main/README_CN.md)。
