---
title: Built-in monitoring and dashboards
sidebar_label: Built-in monitoring & dashboards
description: Learn about STX built-in monitoring data sources, dashboards and trends, and capacity and retention.
---

STX includes monitoring: metric collection, storage, queries, trend charts, and metric-based alerting all run inside STX Server. No extra monitoring components are required.

## What is collected

| Source | Content | How |
| :--- | :--- | :--- |
| SeaTunnel engine | Engine metrics for each online node in managed clusters (JVM heap/non-heap, GC, threads, CPU, FD, job thread pools, Hazelcast partitions/executors, job state counts, etc.) | STX Server scrapes node metrics every `observability.scrape_interval` (default 15s) from `seatunnel_metrics.path` (default `/hazelcast/rest/instance/metrics`) |
| STX jobs | Rows/bytes read and written, committed rows, CDC delay, checkpoint duration and failures, operator busy ratio, edge backpressure, table-level I/O | Written during job reconciliation; final values written when a job ends |

When a node is unreachable, it appears unavailable in availability-related views.

## Dashboards and trends

The Web UI home page provides cluster, job, and host dashboards for overall status and key metrics. Trend charts on cluster and job pages, the trend tab in job details, and metric snapshots in diagnostic reports all use the same built-in monitoring data.

![Cluster dashboard: node availability and engine metrics](/img/screenshots/41-dashboard-cluster.png)

The **Cluster** tab shows node availability, JVM heap, process CPU, and other engine metrics per cluster; the **Jobs** tab aggregates job metrics such as read/write throughput and data volume.

![Host dashboard: CPU, memory, load, and disk](/img/screenshots/43-dashboard-hosts.png)

The **Hosts** tab shows CPU, memory, system load, network, and disk metrics per managed host.

## Configuration

Configure the `observability` section in `config.yaml` (defaults in `config.example.yaml`):

```yaml
observability:
  enabled: true
  storage:
    dir: "data/tsdb"
    retention: ""            # No time limit by default; accepts durations such as 31d
    # max_size: 32212254720  # Optional explicit limit in bytes
  scrape_interval: "15s"
  eval_interval: "15s"
  query_timeout: "8s"
  max_samples: 10000000
```

Restart STX Server after changes. For Docker Compose, data is stored under the mounted `data/stx/tsdb` directory (depending on your volume mapping).

## Capacity and retention

- **Retention**: By default, data is not pruned by age. Set `storage.retention` (for example, `31d`) to remove data older than that duration.
- **Size limit**: If `storage.max_size` is unset, the limit is the smaller of 30 GiB and 20% of the disk capacity where the data directory resides. The oldest data blocks are removed first once the limit is exceeded. Set `storage.max_size` to `0` to remove the size limit.
- **Scrape interval**: Shorter `scrape_interval` gives finer data but uses more space and query load.

## Common issues

| Symptom | What to check |
| :--- | :--- |
| Charts show monitoring data unavailable | Data directory permissions/disk space or query timeout; check `[Observability]` logs in `logs/backend.log` |
| A node chart is empty | Node online, Hazelcast port reachable, and `seatunnel_metrics.path` correct |
| No job trend data | Job must be running to produce continuous data; finished jobs can be viewed over their full duration in job details |

Built-in monitoring cannot alert when STX Server stops. To detect a server outage, periodically check its health endpoint from outside STX, for example `http://10.0.0.10:17800/api/v1/health`.

For alert configuration, see [Alert policies and rules](./alert-policies-rules) and [Alert center](./alert-center).
