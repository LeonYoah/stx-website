---
title: Quick Deploy STX
sidebar_label: Quick Deploy
description: Install the STX control plane on Linux in one command, open the console, and sign in.
---

This guide installs and starts the STX control plane on Linux. It installs the latest Release by default.

## Prerequisites

One-click install targets **Linux** (amd64 / arm64). macOS / Windows are fine for local development, not for this installer.

| Check | Minimum | Notes |
| :--- | :--- | :--- |
| **OS** | Ubuntu / Debian, Rocky / Alma / RHEL 8+, CentOS 7 (amd64 only), or other systemd Linux | glibc ≥ 2.17 |
| **Arch** | amd64 or arm64 | CentOS 7 is amd64 only |
| **Ports** | API `17800`, UI `17880`, gRPC `17890` | Open in firewall / security group |
| **Optional** | Local Node ≥ 18.18 | Skips bundled Node; otherwise the installer picks by glibc |

---

## Step 1: Online one-click install (recommended)

```bash
# Global
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash

# China (URL already uses gh-proxy)
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash
```

Useful flags:

- `--install-dir /opt/stx` — install root (default `/opt/stx`)
- `--arch amd64|arm64` — force architecture
- `--without-node` — skip bundled Node
- `--without-observability` — skip Prometheus / Alertmanager / Grafana
- `--no-systemd` / `--no-start` — skip systemd unit or auto-start

:::tip
The script picks a Node variant from glibc (&lt; 2.27 → `glibc217`). If Node ≥ 18.18 is already on the host, bundling is skipped.
:::

After install:

```bash
/opt/stx/bin/status.sh
# or
systemctl status stx
```

---

## Step 2: Open the console and sign in

Default ports:

| Service | Address |
| :--- | :--- |
| **Console** | `http://<server-ip>:17880` |
| **API** | `http://<server-ip>:17800` |
| **gRPC** | `17890` (Agent) |

Default credentials:

- **Username**: `admin`
- **Password**: `admin123` (or `auth.default_admin_password` in `config.yaml`)

Open the overview page and confirm the control plane is healthy.

---

## Step 3: Onboard hosts and clusters

1. Go to **Hosts** → add a host (IP is enough).
2. Install the Agent until status is Online.
3. Open **Clusters** → one-click install or register a cluster (discovers SeaTunnel nodes on that host).

---

## Other install options

### Offline install

Build a bundle on a machine with GitHub access, then copy it to the target:

```bash
# Global
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash
# China
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/download-bundle.sh | bash
```

CentOS 7 example: `bash -s -- --node-variant glibc217 --arch amd64`.

```bash
tar -xzf dist/offline/stx-offline-bundle-*-linux-*.tar.gz
cd stx-offline-bundle-*-linux-*
sudo ./install.sh --install-dir /opt/stx --offline
```

### Full Docker Compose stack

```bash
mkdir -p stx-docker && cd stx-docker
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/stx-docker-compose.tar.gz | tar -xz
cd docker
cp config.example.yaml config.yaml   # set database type / passwords
mkdir -p data
docker compose up -d                 # MySQL by default
```

For China images, `cp .env.cn.example .env` then start. Console: `http://127.0.0.1:17880`.  
Persistent data lives under `./data/` (relative bind mounts).

### Single-container trial (no monitoring)

```bash
# Global GHCR
docker run -d -p 17800:17800 -p 17880:17880 -p 17890:17890 ghcr.io/leonyoah/stx-all-in-one:latest

# China Huawei SWR
docker run -d -p 17800:17800 -p 17880:17880 -p 17890:17890 swr.cn-east-3.myhuaweicloud.com/stx/stx-all-in-one:latest
```

### Start / stop (binary install)

```bash
/opt/stx/bin/start.sh                 # default --observability auto
/opt/stx/bin/stop.sh
/opt/stx/bin/status.sh
# or systemctl restart stx
```

The local observability stack is started by `start.sh` in `auto` mode when the stack is present and `observability.enabled` is not `false`. Force off:

```bash
/opt/stx/bin/start.sh --observability off
```

---

## FAQ

### 1. Port already in use

Defaults: `17800` / `17880` / `17890`. Check with:

```bash
ss -lntp | grep -E '17800|17880|17890'
```

Edit `config.yaml` under the install dir and restart, or free the conflicting process.

### 2. Agent cannot reach the control plane

Ensure the agent host can reach control-plane **gRPC `17890`**, and check security groups / firewalls.

### 3. China network fails to fetch Release assets

Prefer the `v4.gh-proxy.org`-prefixed install commands, or open asset URLs via [gh-proxy.com](https://gh-proxy.com/).

### 4. Local development instead of one-click install?

See the upstream [README](https://github.com/LeonYoah/stx/blob/main/README.md) (Go ≥ 1.24, Node ≥ 18, pnpm ≥ 8).
