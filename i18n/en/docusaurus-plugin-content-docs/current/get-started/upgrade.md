---
title: Upgrade STX
sidebar_label: Upgrade guide
description: Upgrade STX from older versions and understand changes after built-in monitoring replaced external components.
---

This guide covers changes to consider when upgrading STX, especially after built-in monitoring replaced external Prometheus / Alertmanager / Grafana.

## Before you upgrade

- Back up configuration and data in the installation directory (especially `config.yaml` and database / `data`).
- Review release notes for the target version and plan a maintenance window.
- For Docker Compose deployments, be ready to remove obsolete monitoring containers.

## Upgrade (Linux package)

1. Stop STX: run `bin/stop.sh` or `systemctl stop stx`.
2. Install the new package over the existing installation (or follow release instructions), keeping `config.yaml` and data directories.
3. Review `config.yaml`: legacy `observability.prometheus` / `alertmanager` / `grafana` / `remote_ingest` sections are ignored and can be removed.
4. Start STX: run `bin/start.sh` or `systemctl start stx`.
5. Sign in to the Web UI and verify dashboards, alert center, and cluster status.

The `--observability` flag for `bin/start.sh` / `bin/stop.sh` is kept for compatibility and ignored. To disable built-in monitoring, set `observability.enabled: false` in `config.yaml` and restart.

## Upgrade (Docker Compose)

1. Update to the new Compose package/images and configuration.
2. Run `docker compose up -d --remove-orphans` to start new services and remove obsolete prometheus / alertmanager / grafana containers.
3. Monitoring data is stored under the mounted `data/stx/tsdb` directory (depending on volume mapping).

## Monitoring changes

| Change | Description |
| :--- | :--- |
| Monitoring components | Prometheus / Alertmanager / Grafana are no longer required; collection, storage, query, and alert evaluation run inside STX Server. |
| Data directory | Monitoring data defaults to `data/tsdb` and is pruned by size only by default. See [capacity and retention](../alerts-diagnostics/builtin-monitoring#capacity-and-retention). |
| Historical data | Historical monitoring data from older deployments is not migrated automatically. |
| Legacy config | `observability.prometheus` / `alertmanager` / `grafana` / `remote_ingest` sections are ignored. |
| Legacy install flags | `--with-observability`, `--prometheus-port`, `--alertmanager-port`, `--grafana-port` are no longer accepted and will cause an error if passed. |
| External alert ingest | `/api/v1/monitoring/alertmanager/webhook` was removed; requests to it return 404. Outbound webhook/email notifications from STX are unaffected. |

Old `observability/` directories from previous versions may remain and can be deleted manually when no longer needed.

## Post-upgrade checks

- Home dashboards for clusters, jobs, and hosts display correctly.
- Alert center sources show platform health / metric / job alerts.
- Notification channels and delivery records work as expected.
- Update any scripts or integrations that called removed monitoring APIs.

## API changes for integrations

Removed endpoints:

- `GET /api/v1/monitoring/prometheus/discovery`
- `GET /api/v1/monitoring/prometheus/jobs/metrics`
- `POST /api/v1/monitoring/alertmanager/webhook`
- `ANY /api/v1/monitoring/proxy/grafana`
- `ANY /api/v1/monitoring/proxy/grafana/*proxyPath`

Alert `source_type` values are now `platform_health` / `metric` / `job`; old values return 400. Webhook notification payload `source_type` values changed accordingly.
