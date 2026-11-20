---
title: Embedded monitoring (unreleased)
sidebar_label: Embedded monitoring (unreleased)
description: Learn how embedded monitoring retains data, classifies alerts, and replaces the external monitoring stack.
---

:::caution Development builds only
Embedded monitoring has not shipped in a stable release. For v1.4.0, use [Quick deploy](../get-started/quick-start) and [Alert center](./alert-center).
:::

STX Server collects and stores host, SeaTunnel node, and job metrics, and evaluates metric alerts in the same process. You do not need separate Prometheus, Alertmanager, or Grafana services. The home dashboards summarize clusters, jobs, and hosts. Platform monitoring shows the health of STX Server, stx-agent, and monitoring storage. STX Server cannot alert on its own outage; to detect downtime, probe its health endpoint from another machine, for example `http://10.0.0.10:17800/api/v1/health`.

## Collection and retention

| Setting | Default and behavior |
| :--- | :--- |
| `observability.enabled` | Defaults to `true`. Set it to `false` to turn off built-in metric collection, trends, and metric alerts. |
| `observability.scrape_interval` / `observability.eval_interval` | Engine metric collection and metric alert evaluation both default to `15s`. |
| `observability.storage.dir` | Defaults to `data/tsdb` relative to the STX install directory. With the release Docker Compose bundle, the path on the host is `data/stx/tsdb`. |
| `observability.storage.retention` | No time limit by default. To set one, use a value such as `90d`. |
| `observability.storage.max_size` | Cap for stored metric blocks. Defaults to 20% of the data disk's total capacity, with a 1 GiB minimum and a 30 GiB maximum. Set an explicit byte count to override it; `0` means no size limit. |

Restart STX after changing `config.yaml`. When you set a time limit and a size limit, the first one reached triggers cleanup.

## Alert categories

Alerts and notification routes use three categories: **Platform health**, **Metric alerts**, and **Job alerts**. Examples include an stx-agent version mismatch, node resource use that stays above a threshold, and excessive CDC lag in a sync job, respectively. STX can still send notifications by email, Webhook, or bot channels.

## Upgrade from external monitoring

1. Back up the STX metadata database and configuration before upgrading. The old `observability/` directory is kept, but external Prometheus history and Grafana dashboards are not migrated automatically.
2. Remove `--with-observability` and the three old port flags (`--prometheus-port`, `--alertmanager-port`, and `--grafana-port`) from install commands. `--without-observability` still works but now disables embedded monitoring; the old `start.sh --observability off` no longer turns collection off.
3. On first start after an in-app upgrade, STX refreshes the service scripts and attempts to stop the old monitoring processes. If you roll back and still need the local stack, pick the correct timestamped backups in `bin/` (including the backup of `bin/lib/observability.sh`), restore them to their original filenames, and restart the old service. With Docker Compose, add `--remove-orphans` when starting the new bundle to stop and remove leftover monitoring containers in that Compose project.
4. Review notification routes and automated inspection policies marked invalid after the upgrade. Select a new alert category or rule. Old unresolved Alertmanager events are marked recovered once, without sending recovery notifications. If a notification consumer filters by `source_type`, switch to `platform_health`, `metric`, and `job`.
5. Update stx-agent on managed hosts to collect complete host metrics and node time zones. If the node time zone is unavailable, engine timestamps fall back to the STX Server process time zone, not the Web UI display time zone.
