---
title: Quick deploy STX
sidebar_label: Quick deploy
description: Install STX on Linux, connect a managed host, and use STX CLI on the same machine or another.
---

After you install STX on a Linux machine, you get the Web UI, STX Server, and the gRPC service that `stx-agent` needs. This guide uses the one-click installer for first login, then covers next steps and how to connect a managed host.

## Check before installing

| Check | Requirement |
| :--- | :--- |
| System | Linux with systemd, glibc ≥ 2.17; Ubuntu / Debian, Rocky / Alma / RHEL 8+, CentOS 7, and similar |
| Architecture | amd64 or arm64; CentOS 7 supports amd64 only |
| Network | Browsers can reach the STX install machine on `17880`; managed hosts can reach `17800` and `17890` on it |
| Disk | About 700 MB on the install-directory partition; about 2.2 GB with the local monitoring stack |
| Commands | `bash`, `curl`, `tar`, `gzip`, `sha256sum`; no Node.js or python3 needed (the bundle ships Node) |

:::note
The one-click installer targets Linux. macOS and Windows are for local development—not what this install script is built for.
:::

## 1. One-click install

Run one command on the Linux machine that will be your **STX install machine**. The default install directory is `/opt/stx`.

```bash
# Networks in China (recommended)
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | sudo bash

# Direct access to GitHub
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | sudo bash
```

The script detects the CPU architecture and glibc version, downloads the matching [offline bundle](#offline-install), verifies its sha256, and installs it. Systems with glibc < 2.28, such as CentOS 7, get the CentOS 7 bundle automatically.

### Pick a download line

Before downloading, the script probes 6 download lines and uses the fastest one:

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

- Press Enter for the fastest line, or type another number.
- If a line fails during download, the script moves on to the next one.
- To pin a line, add `--mirror` to the one-click script (`install-online.sh`) or `download-bundle.sh`: a number (such as `2`), a name (`gh-proxy`, `v4`, `v6`, `cdn`, `axisnow`, `github`), or your own proxy prefix. Example: `curl -fsSL ... | sudo bash -s -- --mirror v4`.

### Answer a few questions

The installer first runs a **pre-flight check** and lists CPU / glibc, whether each port is in use, disk space, and systemd in one place:

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

Then it asks a few questions. **Press Enter to accept the default in `[ ]`**; most users just press Enter throughout:

```text
[2/7] 安装配置 / settings...
  ? Web 控制台端口 / web console port [默认 17880]:
  ? 后端 API 端口 / backend API port：17800 不可用，请输入新端口 [默认 17801]:
  ? Agent gRPC 端口（Agent 回连）/ agent gRPC port [默认 17890]:
  ? 对外访问 IP / 域名（Agent 回连与浏览器访问用）[默认 10.0.0.10]:
  ? 数据库 / database：1) SQLite（内置，无需安装） 2) MySQL [默认 1]:
  ? 管理员 admin 的初始密码 [回车保持默认 admin123]:
```

| Question | Default | Notes |
| :--- | :--- | :--- |
| Web UI port | `17880` | Port browsers use |
| STX Server HTTP API port | `17800` | Used by the Web UI, CLI, and install scripts on managed hosts |
| stx-agent gRPC port | `17890` | `stx-agent` on managed hosts connects back here |
| Advertised IP / host | Auto-detected local IP | Written to `app.external_url`; must be reachable from managed hosts |
| Database | SQLite | Choosing MySQL then asks for host, port, user, password, and database name |
| Initial `admin` password | `admin123` | Hidden while typing, asked twice; at least 6 characters |

- A port that failed the pre-flight check **must** be changed; for the others, just press Enter.
- With MySQL, create the database first; STX creates the tables on first start:

  ```sql
  CREATE DATABASE stx DEFAULT CHARACTER SET utf8mb4;
  ```

- With `-y`, or without a terminal (for example in CI), nothing is asked and defaults / flags are used; a port conflict then fails with the flag to change.
- The admin password applies only while the database has no admin account yet (STX creates the admin on first start). Reinstalling over an existing SQLite database does not ask for it; with MySQL, the installer logs in after starting STX to confirm whether the new password applied, and says so in the summary.

The remaining steps run on their own: unpack, copy files, write config, register the systemd service, start, and wait until ready. Each step shows `[i/7]` with ✔ / ✘; on failure the installer names the failed step and the log (`/tmp/stx-install-*.log`, also copied to `/opt/stx/logs/install.log`).

### When the install finishes

The installer prints a summary:

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

If you changed the password during install, the summary only says it was changed and never prints it.

### Common flags

Append flags to customize the install, for example `curl -fsSL ... | sudo bash -s -- -y --install-dir /data/stx`:

| Flag | Purpose |
| :--- | :--- |
| `-y` | Ask nothing; use defaults / flag values |
| `--install-dir /opt/stx` | Install directory (default `/opt/stx`) |
| `--admin-password xxx` | Initial `admin` password |
| `--frontend-port` / `--http-port` / `--grpc-port` | Web UI / HTTP API / gRPC ports |
| `--external-ip 10.0.0.10` | Advertised IP or host name |
| `--db-type mysql --db-host ... --db-port ... --db-user ... --db-password ... --db-name ...` | Use MySQL |
| `--without-observability` | Skip the local monitoring stack (Prometheus / Alertmanager / Grafana) |
| `--prometheus-port` / `--alertmanager-port` / `--grafana-port` | Monitoring ports, default `9090` / `9093` / `3000` |
| `--mirror v4` | Pin a download line (one-click install / `download-bundle.sh` only) |
| `--variant amd64\|arm64\|centos7` / `--version v1.3.0` | Bundle type / version (one-click install / `download-bundle.sh` only) |
| `--without-node` | Use the machine's Node ≥ 18.18 instead of the bundled one |
| `--service-user stx` | Run the service as this user (default root) |
| `--no-autostart` / `--no-systemd` / `--no-start` | No start on boot / no systemd unit / do not start after install |

:::tip Monitoring disk usage
The local monitoring stack takes about 1.2 GB after install, and Prometheus data grows with the number of managed hosts (15-day retention by default). Add `--without-observability` when disk is tight.
:::

Check status after install:

```bash
/opt/stx/bin/status.sh
# When installed with systemd:
systemctl status stx
```

## 2. Open the Web UI

If the STX install machine is `10.0.0.10`, open `http://10.0.0.10:17880` in your browser. Replace the sample IP with your machine's address.

![STX sign-in page](/img/screenshots/00-login.png)

The username is `admin`. The password is the one you set during install; if you pressed Enter, it is `admin123`—change it soon after signing in.

After login you land on the overview page:

![STX overview](/img/screenshots/01-dashboard.png)

| Service | Default port | Who needs access |
| :--- | :--- | :--- |
| Web UI | `17880` | People using a browser |
| STX Server HTTP API | `17800` | Web UI, CLI, and install scripts on managed hosts |
| stx-agent gRPC | `17890` | `stx-agent` on managed hosts |

## 3. Next steps

The end of the install summary lists next steps, depending on whether you already run a SeaTunnel cluster. Menu names below are the English Web UI labels; the installer prints the Chinese ones (shown in parentheses).

### No SeaTunnel cluster yet

1. **Packages & Plugins → Package Management** (安装包与插件 → 安装包管理): download the SeaTunnel version you need. See [Package management](../packages-plugins/package-management).
2. **Packages & Plugins → Plugin Marketplace** (插件市场): download the connector plugins you need. See [Plugin marketplace](../packages-plugins/plugin-marketplace).
3. **Hosts & Clusters → Host Management** (主机与集群 → 主机管理): add the machines for SeaTunnel and install `stx-agent` following the install guide.
4. **Hosts & Clusters → Cluster Management** (集群管理): create the cluster, choosing version, hosts, and plugins.

### Existing SeaTunnel cluster

Skip steps 1 and 2 above:

1. **Hosts & Clusters → Host Management**: add the machines running SeaTunnel and install `stx-agent`.
2. Click **Auto-Discover** (自动发现) on the host row to import the SeaTunnel nodes running there.
3. View and manage the imported cluster in **Cluster Management**.

:::note JDK
STX does not install a JDK. Install one on SeaTunnel machines first, as required by the chosen SeaTunnel version (2.3.x usually uses JDK 8 / 11).
:::

### Connect a managed host

1. In the Web UI, open **Host management**, click **Create host**, enter name and IP, and choose **Physical / virtual machine**.
2. Open that host's install guide, copy the command, and run it **on the managed host**.
3. Return to the host list. When status shows online, you can discover SeaTunnel processes or install a new cluster on that machine.

![Host management list](/img/screenshots/03-hosts.png)

:::caution Install address
The address in the install guide comes from STX Server's `app.external_url`—the advertised IP you entered during install. It must be reachable **from the managed host**, e.g. `http://10.0.0.10:17800`—not `localhost`, which only works on the STX install machine.
:::

Next, see [Host management](../host-cluster/host-management) and [Cluster management](../host-cluster/cluster-management).

## Install STX CLI

The STX client and server share the same binary: `stx server` starts STX Server; `stx login`, `stx cluster list`, and similar commands act as the client. Think of it like the `hadoop` command after deploying Hadoop.

### Client and server on the same machine

After a full STX install, use the binary in the install directory—no separate CLI install:

```bash
/opt/stx/stx login --server http://127.0.0.1:17800
/opt/stx/stx cluster list --output table
```

If you used a different `--install-dir`, replace `/opt/stx` with your path. Login prompts for username and password; credentials are stored under the user who ran the command.

### Separate client and server

If the STX install machine is `10.0.0.10` and another Linux machine only needs remote CLI access: **when both machines share the same CPU architecture, copy `/opt/stx/stx` from the install machine**. On the client machine:

```bash
scp user@10.0.0.10:/opt/stx/stx ./stx
chmod +x ./stx
./stx login --server http://10.0.0.10:17800
./stx cluster list --output table
```

Replace `user` with an SSH account that can read the file. The client does not need the Web UI, Node.js, or `stx-agent`. Copying this file does not start STX Server on the client; the client only needs reachability to port **17800** on the install machine.

Without SSH, copy the same file via USB or internal file transfer, then continue from `chmod +x ./stx`. The client install step can be offline; running remote commands still requires connectivity to STX Server.

:::note Different architectures
Run `uname -m` on both machines. If one is `x86_64` and the other `aarch64`, you cannot copy the install machine's binary. On a machine with network access, download the Release artifact matching **the client's architecture and your STX Server version** (`stx-linux-amd64` or `stx-linux-arm64`), copy it to the client, and name it `stx`. Copying only the binary is for CLI use—it does not install the full service stack.
:::

Next, see [STX CLI](../architecture/cli). For AI Agents, run `stx skill install` (see [Install Skill for AI Agents](../architecture/cli#install-skill-for-ai-agents)).

## Other install methods

### Offline install

Each Release ships three complete offline bundles containing STX Server, the Web UI, stx-agent, Node, and the local monitoring stack, each with a `.sha256` file. Pick by STX install machine:

| Bundle | Target system | How to tell |
| :--- | :--- | :--- |
| `stx-offline-linux-amd64.tar.gz` | x86_64, glibc ≥ 2.28: Ubuntu 20.04+, Debian 10+, Rocky / Alma / RHEL 8+, and similar | `uname -m` prints `x86_64`; first line of `ldd --version` ≥ 2.28 |
| `stx-offline-linux-arm64.tar.gz` | aarch64, glibc ≥ 2.28 | `uname -m` prints `aarch64` |
| `stx-offline-linux-amd64-centos7.tar.gz` | x86_64, glibc < 2.28: **CentOS 7**, RHEL 7 | first line of `ldd --version` shows 2.17 or similar |

These are the fixed names of the latest release. For a specific version the file is named like `stx-v1.3.0-linux-amd64-centos7-offline.tar.gz`, and `latest/download` in the URL becomes `download/v1.3.0`.

Download on a machine with Internet access, using any of the 6 lines (whichever is fastest). CentOS 7 example:

```bash
F=stx-offline-linux-amd64-centos7.tar.gz   # replace with the file you need from the table
U=https://github.com/LeonYoah/stx/releases/latest/download/$F

wget "https://gh-proxy.org/$U"          # 1) Cloudflare main
wget "https://v4.gh-proxy.org/$U"       # 2) Cloudflare optimized (recommended, IPv4 only)
wget "https://v6.gh-proxy.org/$U"       # 3) Cloudflare optimized (IPv6)
wget "https://cdn.gh-proxy.org/$U"      # 4) Fastly CDN
wget "https://axisnow.gh-proxy.org/$U"  # 5) AxisNow
wget "$U"                               # 6) GitHub direct

# fetch the checksum over the same line, for example:
wget "https://v4.gh-proxy.org/$U.sha256"
```

Or let the script probe and download: `curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash -s -- --variant centos7`.

Copy both files to the STX install machine and install:

```bash
sha256sum -c stx-offline-linux-amd64-centos7.tar.gz.sha256
tar -xzf stx-offline-linux-amd64-centos7.tar.gz
cd stx-*-offline/
sudo ./install.sh
```

The questions, summary, and [common flags](#common-flags) are the same as the [one-click install](#answer-a-few-questions) (for example `sudo ./install.sh -y`), except the download flags `--mirror`, `--variant`, and `--version`: `install.sh` installs the bundle in the current directory.

This installs the STX control plane only. To install SeaTunnel clusters offline, also prepare a [SeaTunnel offline asset bundle](../packages-plugins/package-management#offline-export-asset-bundle) (package ± plugins) on a networked STX, then copy and import it.

### Docker Compose

```bash
mkdir -p stx-docker && cd stx-docker
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/stx-docker-compose.tar.gz | tar -xz
cd docker
cp config.example.yaml config.yaml   # Adjust database type and passwords
mkdir -p data
docker compose up -d                 # MySQL by default
```

For China mirrors, run `cp .env.cn.example .env` before start. Open `http://127.0.0.1:17880` locally.

### Single-container trial (no monitoring)

```bash
# GHCR
docker run -d -p 17800:17800 -p 17880:17880 -p 17890:17890 ghcr.io/leonyoah/stx-all-in-one:latest

# Huawei Cloud SWR
docker run -d -p 17800:17800 -p 17880:17880 -p 17890:17890 swr.cn-east-3.myhuaweicloud.com/stx/stx-all-in-one:latest
```

### Start and stop

```bash
/opt/stx/bin/start.sh
/opt/stx/bin/stop.sh
/opt/stx/bin/status.sh
# With systemd install: systemctl restart stx
```

By default, `start.sh` starts monitoring based on `observability.enabled` and whether local monitoring components are installed. To disable explicitly: `/opt/stx/bin/start.sh --observability off`.

## Install troubleshooting

| Symptom | What to check |
| :--- | :--- |
| Pre-flight check reports a port in use | In interactive mode, enter another port when asked; with `-y`, add `--http-port` and similar flags. Find the owner: `ss -lntp \| grep -E '17800\|17880\|17890'` |
| Install failed | Check the failed step and the log `/tmp/stx-install-*.log` (or `/opt/stx/logs/install.log`) shown by the installer |
| glibc too old on CentOS 7 | Use `stx-offline-linux-amd64-centos7.tar.gz`; the one-click install picks it automatically |
| Host stays offline | From the managed host, verify reachability to `17800` and `17890` on the install machine; check firewall and security groups |
| Download slow or failing | Try another [download line](#pick-a-download-line), or pin one with `--mirror v4` |

To develop STX locally instead of installing a Release, see the [development notes in the source repository](https://github.com/LeonYoah/stx/blob/main/README_CN.md).
