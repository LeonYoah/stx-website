---
title: 快速部署 STX
sidebar_label: 快速部署
description: 在 Linux 上安装 STX、接入主机，并在本机或另一台机器上使用 STX CLI。
---

在一台 Linux 机器上安装 STX 后，你会得到 Web UI、STX Server 和 Agent 所需的 gRPC 服务。本文用在线安装完成首次登录，再说明如何接入主机。

## 安装前检查

| 检查项 | 要求 |
| :--- | :--- |
| 系统 | 带 systemd 的 Linux，glibc ≥ 2.17；支持 Ubuntu / Debian、Rocky / Alma / RHEL 8+ 等 |
| 架构 | amd64 或 arm64；CentOS 7 仅支持 amd64 |
| 网络 | 浏览器能访问安装机的 `17880`；被纳管主机能访问安装机的 `17800` 和 `17890` |
| Node.js | 本机有 Node ≥ 18.18 时可复用；没有时安装器会准备内置 Node |

:::note
一键安装面向 Linux。macOS 和 Windows 可用于本地开发，不是这套安装脚本的目标系统。
:::

## 1. 安装并检查服务

在准备作为 **STX 安装机** 的 Linux 机器上执行一条命令。安装器默认获取最新 Release，安装目录为 `/opt/stx`。

```bash
# 直接访问 GitHub
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash

# 中国网络可使用代理地址
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash
```

安装完成后检查状态：

```bash
/opt/stx/bin/status.sh
# 使用 systemd 安装时也可查看
systemctl status stx
```

需要调整安装方式时，可在安装脚本中使用这些参数：

| 参数 | 作用 |
| :--- | :--- |
| `--install-dir /opt/stx` | 指定安装目录，默认 `/opt/stx` |
| `--arch amd64\|arm64` | 指定 CPU 架构 |
| `--without-node` | 不安装内置 Node |
| `--without-observability` | 不安装本地监控组件 |
| `--no-systemd` / `--no-start` | 不创建 systemd 服务 / 安装后不自动启动 |

:::tip
安装器会按 glibc 版本选择 Node 变体；本机已有 Node ≥ 18.18 时会跳过内置 Node。
:::

## 2. 打开 Web UI

假设 STX 安装机的 IP 是 `10.0.0.10`，在浏览器中打开 `http://10.0.0.10:17880`。把示例 IP 换成自己的机器地址。

![STX 登录页](/img/screenshots/00-login.png)

首次登录的默认用户名是 `admin`，密码是 `admin123`。如果安装时设置了 `auth.default_admin_password`，使用你设置的密码。

登录后会进入概览页：

![STX 概览页](/img/screenshots/01-dashboard.png)

| 服务 | 默认端口 | 谁需要访问 |
| :--- | :--- | :--- |
| Web UI | `17880` | 使用浏览器的人 |
| STX Server HTTP API | `17800` | Web UI、CLI 和被纳管主机上的安装脚本 |
| stx-agent gRPC | `17890` | 被纳管主机上的 `stx-agent` |

## 3. 接入一台主机

1. 在 Web UI 打开 **主机管理**，点击 **创建主机**，填写名称和 IP，类型选 **物理机 / 虚拟机**。
2. 打开该主机的安装引导，复制其中的命令，到**被纳管主机**上执行。
3. 回到主机列表。状态显示在线后，就可以在这台机器上发现 SeaTunnel 进程或安装新集群。

![主机管理列表](/img/screenshots/03-hosts.png)

:::caution 安装地址
安装引导里的地址来自 STX Server 的 `app.external_url`。它必须是被纳管主机能访问到的地址，例如 `http://10.0.0.10:17800`，不能填只在 STX 安装机上可用的 `localhost`。
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

先在能访问 GitHub 的机器上下载离线包，再把压缩包复制到 STX 安装机。

```bash
# 直接访问 GitHub
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash
# 中国网络
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash
```

CentOS 7 下载时可传 `bash -s -- --node-variant glibc217 --arch amd64`。复制压缩包后安装：

```bash
tar -xzf dist/offline/stx-offline-bundle-*-linux-*.tar.gz
cd stx-offline-bundle-*-linux-*
sudo ./install.sh --install-dir /opt/stx --offline
```

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
| `17800`、`17880` 或 `17890` 被占用 | 执行 `ss -lntp \| grep -E '17800\|17880\|17890'`；释放端口或修改安装目录下的 `config.yaml` 后重启 |
| 主机一直不在线 | 从被纳管主机检查能否访问 STX 安装机的 `17800` 和 `17890`，再检查防火墙与安全组 |
| 无法下载 Release | 使用上文带 `v4.gh-proxy.org` 的命令 |

如果你要在本机开发 STX，而不是安装 Release，请看[源码仓库的开发说明](https://github.com/LeonYoah/stx/blob/main/README_CN.md)。
