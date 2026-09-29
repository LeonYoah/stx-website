---
title: Package Management
sidebar_label: Package Management
description: Download or offline import/export SeaTunnel archives and local plugins for install, upgrade, and air-gapped import.
---

Web UI **Packages & Plugins** → **Package Management** (`/packages`). This page stores **SeaTunnel release archives** (`.tar.gz`), not the STX installer itself and not connector JARs (see [Plugin Marketplace](./plugin-marketplace)).

![Package management: online versions and download actions](/img/screenshots/24-packages.png)

Archives are stored on the machine that runs **STX Server** first, then **stx-agent** pushes them to managed hosts during one-click install or upgrade.

## Why offline import / export exists

**Package Management** (releases) and the **Plugin Marketplace** (connectors) need outbound access to mirrors for day-to-day downloads. Once the STX install machine is offline, those pages cannot fetch new archives.

The page header exposes a single entry **Offline Import / Export**:

| Tab | What it does |
| :--- | :--- |
| **Import** | Auto-detect by filename: offline asset bundle, or a single official `*-bin.tar.gz` |
| **Export** | Pack the local package (± plugins) into `stx-seatunnel-offline-*.tar.gz` |

To upload a source archive or set a custom version, open the **full upload form** from the Import tab (the former “Upload Package” flow).

Separately, you still need an **STX offline install bundle** for the control plane itself (see [Offline install](../get-started/quick-start#offline-install)). The STX installer and the SeaTunnel asset pack are different artifacts; neither replaces the other.

## Online Versions and Local Packages

| List | What it does |
| :--- | :--- |
| **Online Versions** | Browse versions on mirrors; use **Download to Server** to pull them locally |
| **Local Packages** | Show archives already downloaded or imported; delete them, or add / replace an optional source archive |

The page header shows the **Recommended Version**. Use **Refresh Versions** when the catalog needs updating.

| Column (online) | Meaning |
| :--- | :--- |
| **Version** | SeaTunnel version; the recommended one is marked **Recommended** |
| **Status** | Whether the version can be downloaded |
| **Source package** | Whether the source archive is present, or can be downloaded with the binary |
| **Download** | **Download to Server**, progress, or **Downloaded** |

In the download dialog, pick a mirror (for example Aliyun, Huawei Cloud, or Apache) and optionally download the source archive at the same time. The source archive is optional and mainly used for AI Agent troubleshooting.

## Offline import

Open **Offline Import / Export** → **Import**, then pick a `.tar.gz`:

| Filename | Detected as | Result |
| :--- | :--- | :--- |
| `stx-seatunnel-offline-{version}.tar.gz` | Offline asset bundle | Writes the local package and plugins from the bundle (if any) |
| `apache-seatunnel-{version}-bin.tar.gz` | Single official package | Local package only — **no** plugins |

Importing an official bin alone does **not** include connectors; download them on a networked STX and pack them into an asset bundle, or handle plugins separately.

## Offline export (asset bundle)

Open **Offline Import / Export** → **Export**. Packing **never** fetches from the internet; missing local files are not included.

### On a networked STX

1. Start and open a STX Web UI that can reach mirrors (reuse an existing install).
2. **Download to Server** the target version (or import an official bin).
3. (Optional) In the [Plugin Marketplace](./plugin-marketplace), download connectors for the same version.
4. **Export** → pick version → optionally include local plugins → **Pack and download**.
5. Separately prepare an **STX offline install bundle** ([Offline install](../get-started/quick-start#offline-install)) and copy **both** archives to the offline host.

CLI: `stx package offline-bundle create <version> --include-plugins --confirm`, then `stx package offline-bundle download …`.

### On the offline host

1. Install and start STX with the STX offline bundle (`--offline`).
2. **Offline Import / Export** → **Import**, select the exported asset bundle.
3. Local packages / plugins appear in their lists; then run one-click install or install plugins as usual.

| Artifact | Purpose |
| :--- | :--- |
| STX offline install bundle | Install STX Server / Web UI offline |
| SeaTunnel offline asset bundle | Fill local `packages` / `plugins` on that STX |

### Asset bundle layout

Exported name looks like `stx-seatunnel-offline-2.3.13.tar.gz`. After unpacking:

```text
stx-seatunnel-offline-2.3.13/
├── MANIFEST.json                          # format, version, package checksum, plugin list
├── packages/
│   ├── apache-seatunnel-2.3.13-bin.tar.gz # required
│   └── apache-seatunnel-2.3.13-src.tar.gz # optional (if checked and present locally)
└── plugins/
    └── 2.3.13/                            # optional (if “Include local plugins” was checked)
        ├── connectors/                    # connector JARs
        ├── metadata/                      # plugin metadata
        └── plugins/                       # auxiliary deps (e.g. JDBC drivers)
```

`MANIFEST.json` uses `format` `stx-seatunnel-offline-bundle/v1`. Import writes into the local cache from the manifest; you usually do not unpack by hand.

## Relation to cluster install and upgrade

| Scenario | Requirement |
| :--- | :--- |
| **One-click install · online** | If the target version is missing locally, install may download it as needed |
| **One-click install · offline** | The target version must already exist under **Local Packages** (import an asset bundle or a single bin) |
| **Cluster upgrade** | Prepare the target version locally before upgrade; the UI prompts you to open package management when it is missing |

The default node install directory looks like `/opt/seatunnel-{version}`. See [Cluster management](../host-cluster/cluster-management) for install and upgrade steps.
