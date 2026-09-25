---
title: Cluster management
sidebar_label: Cluster management
description: Create cluster definitions, adopt existing processes or one-click install, and manage node start/stop and day-to-day operations.
---

Open **Cluster management** in the Web UI. The list can be filtered by running, deploying, or stopped; cards show deployment mode, node count, and version. You can open details or stop a cluster.

![Cluster management list](/img/screenshots/04-clusters.png)

Creating a cluster only registers name, version, and deployment mode—it does not start SeaTunnel processes. You also need to [connect an online host](./host-management), then choose to adopt existing processes or one-click install.

## Choose an onboarding path

| Path | When to use | What to do next |
| :--- | :--- | :--- |
| **Adopt existing processes** | SeaTunnel is already running on the host | Create cluster and nodes, discover processes, then bind |
| **One-click install** | Install a new SeaTunnel cluster on the host | Prepare the package, select host and roles, pre-check, then install |

## Deployment mode and status

| Concept | Values / default | Description |
| :--- | :--- | :--- |
| **Deployment mode** | Hybrid / Separate | Hybrid: Master+Worker in one process; Separate: independent Master / Worker processes |
| **Node role** | Master, Worker, Master/Worker | Hybrid mode commonly uses Master/Worker |
| **Cluster status** | Created → Deploying → Running / Stopped / Abnormal | Just created shows as "Created" |
| **Node status** | Pending / Installing / Running / Stopped / Abnormal; may also show Offline | Offline means stx-agent on the host for that node is not online |
| **Default ports** | Master communication `5801`, API `8080`, Worker communication `5802` | Can be overridden per node |

## Adopt existing processes

1. **Cluster management** → Create cluster: name, hybrid or separate, SeaTunnel version.
2. Add nodes: specify online host, role, install directory, and ports (defaults per table above).
3. Trigger discovery on the host or node (stx-agent scans local SeaTunnel processes).
4. After confirming the bind, the node should show process PID and actual install directory.

:::tip
When multiple processes run on one machine, verify role and ports carefully to avoid binding a Worker to a Master node record.
:::

## One-click install

**Package management** in the Web UI must have an install package for the target version. You can upload or download first.

Typical flow:

1. Select target host and role (separate mode requires at least Master / Worker).
2. Click **Pre-check** to verify the install directory is writable and ports are free.
3. Submit install: push package → extract to install directory → write cluster discovery config → start by role.
4. View install progress in the Web UI; on failure, **Retry / Cancel**.

## Day-to-day operations

In cluster details / node list, for the **whole cluster** or a **single node**:

| Operation | Description |
| :--- | :--- |
| **Start / Stop / Restart** | Issued through stx-agent |
| **View logs** | Pull engine logs from the node for start/stop and job issues |
| **Add node** | Single add or batch add on the same host; pre-check available before add |
| **Delete node / Delete cluster** | Check running jobs first; a host linked to cluster nodes cannot be deleted from host management |

:::tip Before stopping a cluster
For critical sync jobs, Savepoint or pause first, then stop or rolling restart to preserve recovery position.
:::

## Boundary with host management

- **Host**: machine + whether stx-agent is connected, resource heartbeats
- **Cluster**: SeaTunnel topology and process lifecycle
- Whether a node is operable depends on both node status and whether the host is online
