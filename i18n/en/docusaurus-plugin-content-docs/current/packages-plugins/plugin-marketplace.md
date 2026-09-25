---
title: Plugin Marketplace
sidebar_label: Plugin Marketplace
description: Browse SeaTunnel connectors, download them with required dependencies in one click, then install onto clusters.
---

Web UI **Packages & Plugins** → **Plugin Marketplace** (`/plugins`). Browse connectors, download JARs and required **Auxiliary Dependencies** to the machine that runs **STX Server**, then install them onto every node of a chosen cluster.

![Plugin marketplace: available plugins and filters](/img/screenshots/07-plugins.png)

Use the top tabs to switch back to [Package Management](./package-management). Workbench connector templates come from **plugins already installed on the cluster**; if a JAR is missing, download and install it here first.

## Available Plugins and Local Plugins

| Tab | What it does |
| :--- | :--- |
| **Available Plugins** | Browse the official catalog; search by name and filter by SeaTunnel version, category, and mirror |
| **Local Plugins** | JARs already downloaded locally; install onto a cluster or delete |

Header actions include **Download All**, **Refresh Connectors** (available) or **Refresh** (local). Downloads use the selected mirror; catalog refresh still uses official Maven metadata.

| Card fields | Meaning |
| :--- | :--- |
| **Name / category / version** | Connector identity and matching SeaTunnel version |
| **Install readiness** | **No extra dependencies**, **Scenario Required**, or **Auto dependencies ready** |
| **Download / Install** | Download first when missing locally; install onto a cluster when already cached |

Transform features usually ship inside `seatunnel-transforms-v2.jar` in the SeaTunnel package—**no separate marketplace download**.

## Auxiliary Dependencies (drivers in one click)

Many connectors need JDBC drivers or other libraries beyond their own JAR. Open the plugin details and switch to **Auxiliary Dependencies**:

| Case | What to do |
| :--- | :--- |
| Badge shows **Scenario Required** (for example Jdbc) | Under **Select Data Source Scenarios**, pick MySQL, Oracle, and so on so the system attaches the matching dependencies, then **Download** |
| Badge shows **Auto dependencies ready** (for example Hive) | Review **Currently active system standard dependencies**, then **Download** |
| Official templates do not cover a special version | Switch to **Custom Driver** to add your own; disable system standard dependencies first if you need to replace them |

![Jdbc: select data source scenarios to attach dependencies](/img/screenshots/25-plugin-deps-profile.png)

![Hive: download when auto dependencies are ready](/img/screenshots/26-plugin-deps-ready.png)

After you pick scenarios, the list shows each **Scenario Driver/Lib** with Group ID, Artifact ID, version, and target directory (for example `plugins/connector-hive`). Download pulls the connector and these dependencies together; install to a cluster pushes them together as well.

## Download first, then install onto a cluster

Typical flow:

1. On **Available Plugins**, pick the SeaTunnel **version** that matches the target cluster.
2. If the badge says **Scenario Required**, choose data source scenarios under **Auxiliary Dependencies** first.
3. Click **Download**; track progress under **Local Plugins**.
4. On **Local Plugins**, open **Manage Plugin** / **Install to Cluster** and choose a version-matched cluster.
5. If `lib` dependencies are included, the UI may prompt you to **restart** the cluster after install.

| Location | Default |
| :--- | :--- |
| Plugin cache | `./lib/plugins` (relative to the STX Server working directory) |

After install, connector JARs land under the node SeaTunnel `connectors/` directory; some dependencies go to `lib/` or a matching `plugins/` subdirectory. **stx-java-proxy** on the node loads these JARs for workbench schema probes and related calls.

Cluster details → **Installed plugins** lists and uninstalls plugins, and can send you back here to add more. The one-click install wizard can also select plugins to install with the cluster.

## Local plugin list

| Column | Meaning |
| :--- | :--- |
| **Name / category / version** | Cached connector |
| **Installed clusters** | Clusters that already have this plugin |
| **File size** | Local JAR size |
| **Actions** | **Manage Plugin** (install), **Delete** (optionally uninstall from selected clusters) |

You can select multiple rows for **Batch Install**. An empty list points you back to **Available Plugins** to download first.

Before a cluster upgrade, plugins required by the target version must already be local; the UI prompts you to open the marketplace when they are missing. See [Cluster management](../host-cluster/cluster-management) for install and upgrade, and [Debug workbench](../workbench/overview) for job-side usage.
