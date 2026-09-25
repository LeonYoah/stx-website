---
title: Host management
sidebar_label: Host management
description: Register hosts, install stx-agent, and understand online status and binding rules.
---

Register a machine in the Web UI under **Host management**, then install `stx-agent` on that machine. After the host shows online, you can discover processes, install clusters, or run start/stop operations on it. Currently available types are **physical / virtual machines**; Docker and Kubernetes types are not yet supported.

## Add a host

Web UI: **Host management** → **Create host**. The list can be filtered by online / not installed / offline, and shows CPU and memory:

![Host management list](/img/screenshots/03-hosts.png)

| Field | Description |
| :--- | :--- |
| **Name** | Required, globally unique |
| **Type** | Physical / virtual machine (default) |
| **IP** | Required, valid IPv4 / IPv6; duplicate IPs are not allowed |

After creation, the host shows as not installed. You still need to run the command from the installation guide on that machine and wait for it to connect to STX Server.

## Install stx-agent

Open the installation guide in the host details, copy the generated command, and run it on the managed host. If the STX install machine is `10.0.0.10`, the download address in the command should be reachable from that host, for example `http://10.0.0.10:17800`. The command looks like:

```bash
curl -sSL http://10.0.0.10:17800/api/v1/agent/install.sh \
  | bash -s -- --install-dir=$HOME/.stx/agent/ --host-id <id>
```

Key points:

- Default install directory is `$HOME/.stx/agent/` (configurable); `--host-id` binds to the host record
- The managed host must reach the STX install machine's **API (default 17800)** and **gRPC (default 17890)**
- Install scripts, binaries, certificates, and so on are provided by STX Server

After installation, return to the guide page and wait until status becomes online. `stx-agent` sends a heartbeat every **10 seconds** by default; if no report arrives for more than **30 seconds**, the host shows offline.

:::tip
If the install command contains `localhost:17800` but the managed host is not the STX install machine, check `app.external_url` first. The install command must be reachable from the managed host.
:::

## Host status and binding rules

When registering, STX Server matches in this order:

1. **Explicit host ID** in the install command
2. Reported primary IP against registered host IP
3. Same name and no stx-agent installed yet
4. Still no match → **auto-create** a physical / virtual machine host

If the IP was wrong at registration: when that IP is not in stx-agent's local address set, STX Server corrects it using the reported primary IP.

When discovery relies on IP / hostname without a host ID, the same order applies. After STX Server restarts, heartbeats from before the restart are ignored.

## Common constraints

| Scenario | Behavior |
| :--- | :--- |
| Name / IP conflict | Create or update is rejected |
| Host still attached to cluster nodes | **Cannot delete**; remove nodes from the cluster first |
| stx-agent disconnects then reconnects | Marked installed again after heartbeat resumes; resource metrics keep updating |

## Relationship to clusters

- After a host is online, you can **discover SeaTunnel processes** or use **one-click install** on it
- Cluster nodes are linked to hosts; start/stop, logs, and pre-checks run through stx-agent on that host

Next, see [Cluster management](./cluster-management).
