---
title: Quick deploy STX
sidebar_label: Quick deploy
description: Install STX on Linux, connect a managed host, and use STX CLI on the same machine or another.
---

After you install STX on a Linux machine, you get the Web UI, STX Server, and the gRPC service that `stx-agent` needs. This guide shows how to install STX with the install scripts.

## Check before installing

| Check | Requirement |
| :--- | :--- |
| System | Linux, glibc ≥ 2.17; Ubuntu / Debian, Rocky / Alma / RHEL 8+, CentOS 7, and similar. **systemd recommended**; on containers / CI without systemd, pass `--no-systemd` |
| Architecture | amd64 or arm64; CentOS 7 supports amd64 only |
| Network | Browsers can reach the STX install machine on `17880`; managed hosts can reach `17800` and `17890` on it |
| Disk | About 700 MB on the install-directory partition; about 2.2 GB with the local monitoring stack |
| Commands | `bash`, `curl`, `tar`, `gzip`, `sha256sum`; no Node.js or python3 needed (the bundle ships Node) |
| Privileges | root (run the install scripts with `sudo`) |

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

The script downloads the [offline bundle](#offline-install) for your CPU architecture and glibc version, verifies its sha256, and installs it; systems with glibc < 2.28, such as CentOS 7, get the CentOS 7 bundle automatically. Without `-y` it asks for the ports, the advertised IP, the database, and the admin password; press Enter to accept each default.

Without systemd (some containers or CI), pass `--no-systemd`. Non-root additionally needs a writable `--install-dir`.

### Pick a download line

By default the script probes the lines, uses the fastest one, and falls back to the next on failure. Pin a line with `--mirror` (number or name, or your own proxy prefix):

| No. | Name | Address |
| :--- | :--- | :--- |
| 1 | `gh-proxy` | `https://gh-proxy.org` (Cloudflare main) |
| 2 | `v4` | `https://v4.gh-proxy.org` (Cloudflare optimized, recommended, IPv4 only) |
| 3 | `v6` | `https://v6.gh-proxy.org` (Cloudflare optimized, IPv6) |
| 4 | `cdn` | `https://cdn.gh-proxy.org` (Fastly CDN) |
| 5 | `axisnow` | `https://axisnow.gh-proxy.org` (AxisNow) |
| 6 | `github` | Direct GitHub |

```bash
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | sudo bash -s -- --mirror v4
```

### Common flags

Append flags to the command, for example `curl -fsSL ... | sudo bash -s -- -y --install-dir /data/stx`:

| Flag | Effect |
| :--- | :--- |
| `-y` | No prompts; use defaults and flag values |
| `--install-dir /opt/stx` | Install directory, default `/opt/stx` |
| `--admin-password xxx` | Initial admin password |
| `--frontend-port` / `--http-port` / `--grpc-port` | Web UI / HTTP API / gRPC ports, default `17880` / `17800` / `17890` |
| `--external-ip 10.0.0.10` | Advertised IP or host name |
| `--db-type sqlite\|mysql\|postgres` | Database, default `sqlite`; `postgres` can also be written `pg` |
| `--db-host` / `--db-port` / `--db-user` / `--db-password` / `--db-name` | MySQL / PostgreSQL connection; the password can also come from `STX_DB_PASSWORD` |
| `--without-observability` | Skip the local monitoring stack (Prometheus / Alertmanager / Grafana) |
| `--prometheus-port` / `--alertmanager-port` / `--grafana-port` | Monitoring ports, default `9090` / `9093` / `3000` |
| `--mirror v4` | Pin a download line (one-click install / `download-bundle.sh` only) |
| `--variant amd64\|arm64\|centos7` / `--version <tag>` | Bundle variant / version (one-click install / `download-bundle.sh` only) |
| `--without-node` | Use the host Node ≥ 18.18 instead of the bundled one |
| `--service-user stx` | Run the service as this user (default root) |
| `--no-autostart` / `--no-systemd` / `--no-start` | No start on boot / no systemd unit / do not start after install |

With an external database:

```bash
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh \
  | sudo bash -s -- --db-type postgres --db-host 10.0.0.5 --db-user stx --db-name stx
```

:::note sudo
Installing needs root. Without sudo the scripts exit before any check or prompt and print the full command with `sudo`. Non-root works only with a writable `--install-dir` together with `--no-systemd`.
:::

Check the status after install:

```bash
/opt/stx/bin/status.sh
# When installed with systemd:
systemctl status stx
```

## 2. Open the Web UI

If the STX install machine is `10.0.0.10`, open `http://10.0.0.10:17880` and sign in as `admin` with the password set during install (`admin123` if you pressed Enter; change it soon after signing in).

![STX sign-in page](/img/screenshots/00-login.png)

| Service | Default port | Who needs access |
| :--- | :--- | :--- |
| Web UI | `17880` | People using a browser |
| STX Server HTTP API | `17800` | Web UI, CLI, and install scripts on managed hosts |
| stx-agent gRPC | `17890` | `stx-agent` on managed hosts |

The install summary ends with the next steps; for connecting hosts and creating clusters see [Host management](../host-cluster/host-management) and [Cluster management](../host-cluster/cluster-management).

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

These are the fixed names of the latest Release. For a specific version the file is named like `stx-vX.Y.Z-linux-amd64-offline.tar.gz`, and `latest/download` in the URL becomes `download/vX.Y.Z`.

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

The [common flags](#common-flags) are the same as for the one-click install (for example `sudo ./install.sh -y --db-type postgres ...`; add `--no-systemd` when needed). The download flags `--mirror`, `--variant`, `--version`, and `--bundle-file` do not apply to `install.sh`, which installs the bundle in the current directory. Offline bundles default to installing from the package contents—you usually **do not** need an extra `--offline` flag.

This installs the STX control plane only. To install SeaTunnel clusters offline, also prepare a [SeaTunnel offline asset bundle](../packages-plugins/package-management#offline-export-asset-bundle) (package ± plugins) on a networked STX, then copy and import it.

### Docker Compose

```bash
mkdir -p stx-docker && cd stx-docker
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/stx-docker-compose.tar.gz | tar -xz
cd docker
cp config.example.yaml config.yaml   # keep database.enabled: true when changing database.type
mkdir -p data && chmod -R 777 data
# China mirrors:
cp .env.cn.example .env
docker compose up -d                 # MySQL by default; for sqlite use docker-compose.sqlite.yml
```

Open the **Web UI** at `http://127.0.0.1:17880` (API is `17800`). Use the SeaTunnel version shown in Web UI package management.

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
| Install fails without systemd / in a container | Pass `--no-systemd`; for non-root also pass a writable `--install-dir` |
| Opening `17800` shows no login page | Web UI defaults to **`17880`**; `17800` is the HTTP API |

To develop STX locally instead of installing a Release, see the [development notes in the source repository](https://github.com/LeonYoah/stx/blob/main/README_CN.md).
