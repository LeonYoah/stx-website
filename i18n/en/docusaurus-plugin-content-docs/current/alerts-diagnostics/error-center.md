---
title: Errors
sidebar_label: Errors
description: Aggregate SeaTunnel ERROR logs by fingerprint and filter by frequency; show "Known solution" when a matching fix exists.
---

Web UI **Alerts & Diagnostics** → **Diagnostics** → **Errors** (`/diagnostics`). The same page also has [Inspections](./diagnostic-report) and [Troubleshooting library](./troubleshooting-memory).

![Error groups and known solution markers](/img/screenshots/20-error-groups.png)

## View error groups

| Column | Description |
| :--- | :--- |
| **Error group** | Summary aggregated by fingerprint |
| **Known solution** | Shown when the troubleshooting library has a matching fix |
| **Exception class / Source node** | For example `java.sql.SQLException`; host and node |
| **Occurrence count / Last seen** | Total count and most recent time |

:::tip
**Known solution** in the list means the troubleshooting library has a matching fix. Open details to verify log samples before applying.
:::

Frequency filters: **High frequency critical** (≥10), **Medium frequency warning** (3–9), **Low frequency occasional** (&lt;3). Filter by cluster; search summary / exception class / source file. Click **Details** for event samples and evidence; to collect more on-site data, go to **Inspections** for check records and the [diagnostic report](./diagnostic-report).

## Which errors appear

**stx-agent** incrementally scans node SeaTunnel logs for `ERROR` / `FATAL`, reports them, and groups by fingerprint. stx-agent must be online; exceptions not written to these logs will not appear here.

For CLI queries, see [STX CLI](../architecture/cli).
