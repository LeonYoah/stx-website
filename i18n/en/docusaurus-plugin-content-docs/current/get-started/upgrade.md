---
title: Upgrade STX
sidebar_label: Upgrade guide
description: Upgrade STX Server and stx-agent from the Web UI, Docker Compose, or install script, plus v1.5.0 upgrade notes.
---

There are three ways to upgrade STX: **Web UI System Upgrade** (recommended for bare-metal/VM installs), **Docker Compose** for container installs, or re-running the install script.

:::tip SeaTunnel workloads stay running
STX self-upgrade only restarts STX control plane, frontend, `stx-agent`, and `stx-java-proxy`. **SeaTunnel clusters and running jobs are never stopped or restarted.** Back up `config.yaml` and `data/` before upgrading.
:::

## Option 1: Web UI online / offline self-upgrade (recommended)

For bare-metal / VM installs. Sign in to the Web UI with an **administrator** account.

### 1. Open System Upgrade

Click the **Profile** icon on the right side of the bottom dock, scroll to the bottom of the dialog, and click **Check for updates** to open the **System Upgrade** page:

![System Upgrade entry: click Profile on the bottom dock, scroll down, and click Check for updates](/img/screenshots/51-self-upgrade-entry.png)

### 2. Follow the four upgrade steps

![System Upgrade four-step guide: check for updates, stage assets, dry run or start upgrade, verify node agent versions](/img/screenshots/52-self-upgrade-steps.png)

1. **Check version**: Click **Check for updates** in the top-right corner to view your current version and the latest available release.
2. **Stage assets**:
   - **Online**: Select **Online download** and click **Download to local cache**.
   - **Offline / air-gapped**: Switch to **Offline import** and drop or select a `.tar.gz` / `.tgz` / `.zip` release bundle.
   - Wait until control plane, `stx-agent`, `stx-java-proxy`, and frontend bundle all show **Ready**.
3. **Run upgrade**:
   - Optionally click **Dry run (no changes)** first to verify the workflow without touching binaries or processes.
   - Click **Start upgrade**, review the target version and nodes in the confirmation dialog, and confirm.
   - If the new version fails to start, STX rolls back automatically. Offline managed hosts upgrade automatically once they reconnect.
4. **Verify**: The Web UI reconnects automatically after ~3–5 seconds. Check **Agent version per node** to confirm every managed host matches the control plane, and inspect **Upgrade history** at the bottom if needed.

## Option 2: Docker Compose upgrade

On Docker deployments, the **System Upgrade** page automatically detects container mode and displays the host upgrade command. Run on the STX install host:

```bash
docker compose pull
docker compose up -d --remove-orphans
```

The new container image bundles updated `stx-agent` and `stx-java-proxy` assets for aligning managed hosts after restart.

## Option 3: Install script in-place upgrade

If the Web UI is unavailable or you are upgrading from an older release without self-upgrade, re-run the one-line installer (see [Quick Start](./quick-start)) or `install.sh` from the new offline bundle:

- The script stops the existing service, preserves `config.yaml` and `data/`, and restarts STX.
- Sign in to the Web UI afterward and verify dashboards, alerts, and `stx-agent` versions.

## Version-specific upgrade notes

### Upgrading to v1.5.0 (from v1.4.0 or earlier)

Starting in `v1.5.0`, monitoring is built into STX Server and no longer requires external Prometheus / Alertmanager / Grafana:

| Change | Details |
| :--- | :--- |
| Monitoring stack | Prometheus, Alertmanager, and Grafana are no longer required; collection, storage, query, and alert evaluation run inside STX Server. Pass `--remove-orphans` with Docker Compose to clean up old monitoring containers. |
| Data directory | Monitoring data is stored under `data/tsdb` (or mounted `data/stx/tsdb` in Docker) and pruned by size only by default. See [capacity and retention](../alerts-diagnostics/builtin-monitoring#capacity-and-retention). |
| Historical data | Legacy external monitoring metrics are not migrated automatically. The old `observability/` directory is left untouched and can be deleted manually once confirmed unnecessary. |
| Config & start flags | Legacy `observability.prometheus` / `alertmanager` / `grafana` / `remote_ingest` config sections are ignored. `--observability` on `bin/start.sh` / `bin/stop.sh` is kept as a no-op; use `observability.enabled` in `config.yaml`. |
| Install script flags | `--with-observability`, `--prometheus-port`, `--alertmanager-port`, and `--grafana-port` were removed and now error if passed. Remove them from automation scripts. |
| External alert ingest | `POST /api/v1/monitoring/alertmanager/webhook` was removed (returns 404). Outbound webhook/email notifications from STX are unaffected. |

#### API changes for integrations (v1.5.0)

Removed endpoints:

- `GET /api/v1/monitoring/prometheus/discovery`
- `GET /api/v1/monitoring/prometheus/jobs/metrics`
- `POST /api/v1/monitoring/alertmanager/webhook`
- `ANY /api/v1/monitoring/proxy/grafana`
- `ANY /api/v1/monitoring/proxy/grafana/*proxyPath`

Alert `source_type` values changed to `platform_health` / `metric` / `job` (legacy values return 400); webhook notification payloads use the same updated values.
