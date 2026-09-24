---
title: Quick deploy STX
sidebar_label: Quick deploy
description: Install STX on Linux, connect a host, and use the CLI locally or remotely.
---

Install STX on a Linux machine to start the Web UI, STX Server, and agent gRPC service. Then sign in and connect a managed host.

## Check before installing

| Check | Requirement |
| :--- | :--- |
| System | Linux with systemd and glibc ≥ 2.17; amd64 or arm64. CentOS 7 supports amd64 only. |
| Browser access | Reach port `17880` on the STX installation host. |
| Managed host access | Reach ports `17800` and `17890` on the STX installation host. |
| Node.js | An existing Node ≥ 18.18 can be reused. Otherwise, the installer provides one. |

:::note
The one-click installer targets Linux. macOS and Windows are for local development, not this installation path.
:::

## 1. Install and check the service

Run one command on the Linux machine that will host STX. The default installation directory is `/opt/stx`.

```bash
# Direct access to GitHub
curl -fsSL https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash

# Proxy URL for networks in China
curl -fsSL https://v4.gh-proxy.org/https://github.com/LeonYoah/stx/releases/latest/download/install-online.sh | bash
```

Check the result:

```bash
/opt/stx/bin/status.sh
# If installed as a systemd service:
systemctl status stx
```

Common installer flags include `--install-dir`, `--arch`, `--without-node`, `--without-observability`, `--no-systemd`, and `--no-start`.

## 2. Open the Web UI

If the STX installation host is `10.0.0.10`, open `http://10.0.0.10:17880` in your browser. Replace that sample address with the host's actual address.

![STX sign-in page](/img/screenshots/00-login.png)

The default username is `admin`, and the default password is `admin123`. If `auth.default_admin_password` was set during installation, use that password instead.

| Service | Default port |
| :--- | :--- |
| Web UI | `17880` |
| STX Server HTTP API | `17800` |
| stx-agent gRPC | `17890` |

## 3. Connect a host

1. In the Web UI, create a host with a name and IP address. Choose the physical/virtual machine type.
2. Copy the generated stx-agent installation command and run it **on the managed host**.
3. Return to the host list. When the host is online, you can discover SeaTunnel processes or install a cluster.

![Host list](/img/screenshots/03-hosts.png)

:::caution Agent download address
The generated command uses `app.external_url`. For a separate managed host, set it to an address that host can reach, such as `http://10.0.0.10:17800`, not `localhost` on the STX installation host.
:::

For detailed host and cluster operations, see the short English outlines for [host management](../host-cluster/host-management) and [cluster management](../host-cluster/cluster-management), or switch to Chinese for the complete guides.

## Install STX CLI

The same `stx` binary serves both purposes: `stx api` starts STX Server; commands such as `stx login` and `stx cluster list` act as a client. Think of the `hadoop` command after installing Hadoop.

### Client and server on the same host

A full installation already includes the binary. No second CLI install is needed:

```bash
/opt/stx/stx login --server http://127.0.0.1:17800
/opt/stx/stx cluster list --output table
```

Replace `/opt/stx` if you chose a different installation directory. Login credentials are saved for the user running the command.

### Separate client and server

If the STX installation host is `10.0.0.10`, copy its binary to another Linux host **with the same CPU architecture**. Run these commands on the client host:

```bash
scp user@10.0.0.10:/opt/stx/stx ./stx
chmod +x ./stx
./stx login --server http://10.0.0.10:17800
./stx cluster list --output table
```

Replace `user` with an SSH account that can read the file. You can also transfer the file over an internal network or USB drive, then start at `chmod`. Copying the binary does not start STX Server on the client; only access to port **17800** on the installation host is needed for remote commands.

:::note Different CPU architectures
Check `uname -m` on both machines. If they differ, get `stx-linux-amd64` or `stx-linux-arm64` for the **client's** architecture from the Release matching your STX Server version. Copy it to the client as `stx`. The server host's binary will not run on a different architecture.
:::

For command usage, see [STX CLI](../architecture/cli).
