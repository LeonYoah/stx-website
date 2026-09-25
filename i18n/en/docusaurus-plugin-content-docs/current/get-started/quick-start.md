---
title: Quick deploy STX
sidebar_label: Quick deploy
description: Install STX on Linux, connect a managed host, and use STX CLI on the same machine or another.
---

After you install STX on a Linux machine, you get the Web UI, STX Server, and the gRPC service that `stx-agent` needs. This guide uses the online installer for first login, then explains how to connect a managed host.

## Check before installing

| Check | Requirement |
| :--- | :--- |
| System | Linux with systemd, glibc ≥ 2.17; Ubuntu / Debian, Rocky / Alma / RHEL 8+, and similar |
| Architecture | amd64 or arm64; CentOS 7 supports amd64 only |
| Network | Browsers can reach the install machine on `17880`; managed hosts can reach `17800` and `17890` on the install machine |
| Node.js | Reuse local Node ≥ 18.18 if present; otherwise the installer provides a bundled Node |

:::note
The one-click installer targets Linux. macOS and Windows are for local development—not what this install script is built for.
:::

## 1. Install and check the service

Run one command on the Linux machine that will be your **STX install machine**. The installer fetches the latest Release by default; the install directory is `/opt/stx`.

```bash
# Direct access to GitHub
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash

# Proxy URL for networks in China
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash
```

Check status after install:

```bash
/opt/stx/bin/status.sh
# When installed with systemd:
systemctl status stx
```

Installer flags when you need to customize:

| Flag | Purpose |
| :--- | :--- |
| `--install-dir /opt/stx` | Install directory (default `/opt/stx`) |
| `--arch amd64\|arm64` | CPU architecture |
| `--without-node` | Do not install bundled Node |
| `--without-observability` | Do not install local monitoring stack |
| `--no-systemd` / `--no-start` | Skip systemd unit / do not start after install |

:::tip
The installer picks a Node build for your glibc version; if Node ≥ 18.18 is already on the machine, bundled Node is skipped.
:::

## 2. Open the Web UI

If the STX install machine is `10.0.0.10`, open `http://10.0.0.10:17880` in your browser. Replace the sample IP with your machine's address.

![STX sign-in page](/img/screenshots/00-login.png)

Default first-login username is `admin`, password is `admin123`. If you set `auth.default_admin_password` during install, use that password.

After login you land on the overview page:

![STX overview](/img/screenshots/01-dashboard.png)

| Service | Default port | Who needs access |
| :--- | :--- | :--- |
| Web UI | `17880` | People using a browser |
| STX Server HTTP API | `17800` | Web UI, CLI, and install scripts on managed hosts |
| stx-agent gRPC | `17890` | `stx-agent` on managed hosts |

## 3. Connect a managed host

1. In the Web UI, open **Host management**, click **Create host**, enter name and IP, and choose **Physical / virtual machine**.
2. Open that host's install guide, copy the command, and run it **on the managed host**.
3. Return to the host list. When status shows online, you can discover SeaTunnel processes or install a new cluster on that machine.

![Host management list](/img/screenshots/03-hosts.png)

:::caution Install address
The address in the install guide comes from STX Server's `app.external_url`. It must be reachable **from the managed host**, e.g. `http://10.0.0.10:17800`—not `localhost`, which only works on the STX install machine.
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

Download the offline bundle on a machine that can reach GitHub, then copy the archive to the STX install machine.

```bash
# Direct access to GitHub
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash
# Networks in China
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash
```

For CentOS 7, pass `bash -s -- --node-variant glibc217 --arch amd64` when downloading. After copying the archive, install:

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
| Ports `17800`, `17880`, or `17890` in use | Run `ss -lntp \| grep -E '17800\|17880\|17890'`; free the ports or change `config.yaml` under the install directory and restart |
| Host stays offline | From the managed host, verify reachability to `17800` and `17890` on the install machine; check firewall and security groups |
| Cannot download Release | Use the `v4.gh-proxy.org` commands above |

To develop STX locally instead of installing a Release, see the [development notes in the source repository](https://github.com/LeonYoah/stx/blob/main/README_CN.md).
