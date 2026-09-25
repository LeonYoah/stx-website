---
title: Package Management
sidebar_label: Package Management
description: Download or upload SeaTunnel install archives for one-click install and upgrade.
---

Web UI **Packages & Plugins** → **Package Management** (`/packages`). This page stores **SeaTunnel release archives** (`.tar.gz`), not the STX installer itself and not connector JARs (see [Plugin Marketplace](./plugin-marketplace)).

![Package management: online versions and download actions](/img/screenshots/24-packages.png)

Archives are stored on the machine that runs **STX Server** first, then **stx-agent** pushes them to managed hosts during one-click install or upgrade.

## Online Versions and Local Packages

| List | What it does |
| :--- | :--- |
| **Online Versions** | Browse versions on mirrors; use **Download to Server** to pull them locally |
| **Local Packages** | Show archives already downloaded or uploaded; delete them, or add / replace an optional source archive |

The page header shows the **Recommended Version**. Use **Refresh Versions** when the catalog needs updating.

| Column (online) | Meaning |
| :--- | :--- |
| **Version** | SeaTunnel version; the recommended one is marked **Recommended** |
| **Status** | Whether the version can be downloaded |
| **Source package** | Whether the source archive is present, or can be downloaded with the binary |
| **Download** | **Download to Server**, progress, or **Downloaded** |

In the download dialog, pick a mirror (for example Aliyun, Huawei Cloud, or Apache) and optionally download the source archive at the same time. The source archive is optional and mainly used for AI Agent troubleshooting.

## Offline upload

When mirrors are unreachable: click **Upload Package** and drop a `.tar.gz`.

| Constraint | Detail |
| :--- | :--- |
| **Format** | `.tar.gz` only |
| **Filename** | Prefer `apache-seatunnel-{version}-bin.tar.gz` so the version can be detected |
| **Size limit** | Controlled by `storage.max_package_size`; the example config defaults to **20480 MB** |
| **Storage** | Default `./lib/packages` (relative to the STX Server working directory) |

You can also upload the matching `*-src.tar.gz` source archive.

## Relation to cluster install and upgrade

| Scenario | Requirement |
| :--- | :--- |
| **One-click install · online** | If the target version is missing locally, install may download it as needed |
| **One-click install · offline** | The target version must already exist under **Local Packages** |
| **Cluster upgrade** | Prepare the target version locally before upgrade; the UI prompts you to open package management when it is missing |

The default node install directory looks like `/opt/seatunnel-{version}`. See [Cluster management](../host-cluster/cluster-management) for install and upgrade steps.
