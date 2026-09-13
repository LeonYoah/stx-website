---
title: 快速部署 STX
sidebar_label: 快速部署
description: 5 分钟在 Linux 或 macOS 上启动 STX 控制面，并接入首个 SeaTunnel 节点。
---

本文介绍如何在 5 分钟内快速安装并启动 STX 服务，完成系统初始化配置。

## 前置准备

在开始安装前，请确认你的机器满足以下要求：

| 检查项 | 最低要求 | 说明 |
| :--- | :--- | :--- |
| **操作系统** | Linux (CentOS 7+ / Ubuntu 20.04+) 或 macOS | 支持 x86_64 / arm64 架构 |
| **基础依赖** | 无 | 体验模式内置 SQLite，开箱即用 |
| **开放端口** | `8080` (Web 与 API)、`9090` (Agent gRPC 通信) | 确保防火墙放行 |
| **目标环境** | 已有一套 SeaTunnel (2.3.x+) 运行环境 | 用于纳管验证 |

---

## 步骤 1：下载并解压运行包

执行以下命令下载最新的 STX 发布包：

```bash
# 1. 创建并进入安装目录
mkdir -p /opt/stx && cd /opt/stx

# 2. 下载发布包（以当前版本为例）
curl -LO https://github.com/LeonYoah/SeaTunnelX/releases/download/v1.0.0/stx-linux-amd64.tar.gz

# 3. 解压安装包
tar -zxvf stx-linux-amd64.tar.gz
```

解压后目录结构如下：
* `stx-server`：STX 控制面主二进制程序
* `stx.yaml`：配置文件模板
* `web/`：前端静态页面资源

---

## 步骤 2：检查服务配置

打开 `stx.yaml`，确认监听端口与数据目录：

```yaml
server:
  http_port: 8080      # 前端界面与 REST API 端口
  grpc_port: 9090      # 与 Agent 通信的 gRPC 端口

database:
  type: sqlite
  path: ./data/stx.db  # SQLite 数据库文件路径
```

:::tip
初次体验测试建议保持默认配置即可，无需额外准备 MySQL 数据库。
:::

---

## 步骤 3：启动服务

在 `/opt/stx` 目录下执行启动命令：

```bash
# 启动 STX 后台服务
./stx-server start

# 查看运行日志确认状态
tail -f logs/stx.log
```

当日志输出包含以下内容时，表示服务已成功启动：

```text
[INFO] STX Server listening on http://0.0.0.0:8080
[INFO] STX gRPC listening on 0.0.0.0:9090
[INFO] STX system initialized successfully.
```

---

## 步骤 4：登录控制台

1. 打开浏览器，访问：`http://<服务器IP>:8080`。
2. 在登录页面输入系统默认初始账号：
   * **用户名**：`admin`
   * **密码**：`stx123`
3. 登录成功后进入概览仪表盘，系统状态显示为 `Normal` 即表示控制面正常运行。

---

## 步骤 5：纳管第一台主机与集群

1. 点击左侧导航栏 **「主机管理」** ➔ **「添加主机」**。
2. 填入目标节点的 IP、SSH 端口及认证信息，点击「测试连通性」。
3. 验证通过后点击「安装 Agent」，系统将自动推送并启动 `stx-agent`。
4. 状态变为 `Online` 后，进入 **「集群管理」** 即可发现并纳管当前主机上的 SeaTunnel 节点。

---

## 常见问题与排错

### 1. 启动报错 `bind: address already in use`
* **原因**：`8080` 或 `9090` 端口被系统其他服务占用。
* **排查方法**：
  ```bash
  # 查找占用 8080 端口的进程
  lsof -i :8080
  # 杀掉冲突进程，或修改 stx.yaml 中的端口后重试
  ```

### 2. Agent 连接提示 `connection refused`
* **原因**：Agent 所在节点无法访问服务端的 `9090` gRPC 端口。
* **排查方法**：
  ```bash
  # 在 Agent 主机上测试服务端端口连通性
  telnet <STX_SERVER_IP> 9090
  # 检查服务端安全组与防火墙 iptables / ufw 是否开放该端口
  ```
