---
title: 快速部署 STX
sidebar_label: 快速部署
description: 在 Linux 上一键安装 STX 控制面，打开控制台并完成首次登录。
---

本文介绍如何在 Linux 上一键安装并启动 STX 控制面。默认装最新 Release。

## 前置准备

一键安装面向 **Linux**（amd64 / arm64）。macOS / Windows 仅适合本地开发，不是当前一键安装目标。

| 检查项 | 最低要求 | 说明 |
| :--- | :--- | :--- |
| **操作系统** | Ubuntu / Debian、Rocky / Alma / RHEL 8+、CentOS 7（仅 amd64）等带 systemd 的 Linux | 需 glibc ≥ 2.17 |
| **架构** | amd64 或 arm64 | CentOS 7 仅支持 amd64 |
| **开放端口** | API `17800`、前端 `17880`、gRPC `17890` | 确保防火墙放行 |
| **可选依赖** | 本机 Node ≥ 18.18 | 有则可跳过内置 Node；否则安装器会按 glibc 自动选取 |

---

## 步骤 1：在线一键安装（推荐）

```bash
# 海外
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash

# 中国（链接已带 gh-proxy）
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash
```

常用参数：

- `--install-dir /opt/stx` — 安装目录（默认 `/opt/stx`）
- `--arch amd64|arm64` — 指定架构
- `--without-node` — 不安装内置 Node
- `--without-observability` — 不安装监控三件套
- `--no-systemd` / `--no-start` — 不写 systemd 或不自动启动

:::tip
脚本会按 glibc 选择 Node 变体（&lt; 2.27 → `glibc217`）；本机已有 Node ≥ 18.18 时会自动跳过。
:::

安装完成后可用：

```bash
/opt/stx/bin/status.sh
# 或
systemctl status stx
```

---

## 步骤 2：打开控制台并登录

默认端口：

| 服务 | 地址 |
| :--- | :--- |
| **控制台** | `http://<服务器IP>:17880` |
| **API** | `http://<服务器IP>:17800` |
| **gRPC** | `17890`（Agent 通信） |

默认账号：

- **用户名**：`admin`
- **密码**：`admin123`（或 `config.yaml` 中 `auth.default_admin_password`）

登录后进入概览页，确认控制面状态正常即可。

---

## 步骤 3：纳管主机与集群

1. 左侧进入 **主机管理** → 添加主机，填写 IP 即可。
2. 安装 Agent，状态变为 Online。
3. 进入 **集群管理**，一键安装集群或者注册集群（自动发现并纳管该主机上的 SeaTunnel 节点）。

---

## 其他安装方式

### 离线安装

在能访问 GitHub 的机器上生成 bundle，再拷到目标机：

```bash
# 海外
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash
# 中国
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash
```

CentOS 7 示例：`bash -s -- --node-variant glibc217 --arch amd64`。

```bash
tar -xzf dist/offline/stx-offline-bundle-*-linux-*.tar.gz
cd stx-offline-bundle-*-linux-*
sudo ./install.sh --install-dir /opt/stx --offline
```

### Docker 全量启动

```bash
mkdir -p stx-docker && cd stx-docker
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/stx-docker-compose.tar.gz | tar -xz
cd docker
cp config.example.yaml config.yaml   # 按库类型改 database / 密码
mkdir -p data
docker compose up -d                 # 默认 MySQL
```

中国镜像可 `cp .env.cn.example .env` 后启动。控制台同样是 `http://127.0.0.1:17880`。

### 单容器体验（无监控）

```bash
# 海外 GHCR
docker run -d -p 17800:17800 -p 17880:17880 -p 17890:17890 ghcr.io/leonyoah/stx-all-in-one:latest

# 中国华为云 SWR
docker run -d -p 17800:17800 -p 17880:17880 -p 17890:17890 swr.cn-east-3.myhuaweicloud.com/stx/stx-all-in-one:latest
```

### 启停

```bash
/opt/stx/bin/start.sh                 # 默认 --observability auto
/opt/stx/bin/stop.sh
/opt/stx/bin/status.sh
# 或 systemctl restart stx
```

本地监控三件套由 `start.sh` 按 auto 智能启停（有本地栈且 `observability.enabled` 不为 false 时启动）。显式关闭：

```bash
/opt/stx/bin/start.sh --observability off
```

---

## 常见问题

### 1. 端口被占用

默认占用 `17800` / `17880` / `17890`。排查示例：

```bash
ss -lntp | grep -E '17800|17880|17890'
```

冲突时可改安装目录下的 `config.yaml` 后重启，或先释放占用进程。

### 2. Agent 连不上控制面

确认目标机能访问控制面 **gRPC `17890`**，并检查安全组 / 防火墙。

### 3. 中国网络拉 Release 失败

优先使用带 `v4.gh-proxy.org` 前缀的安装命令；手动下载也可把资产 URL 贴到 [gh-proxy.com](https://gh-proxy.com/) 打开。

### 4. 需要本地开发而不是一键安装？

见上游仓库 [README](https://github.com/LeonYoah/stx/blob/main/README_CN.md) 的本地启动说明（Go ≥ 1.24、Node ≥ 18、pnpm ≥ 8）。
