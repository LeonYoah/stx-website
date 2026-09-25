---
title: Troubleshooting library
sidebar_label: Troubleshooting library
description: Record verified fixes; error groups can show "Known solution" to find handling steps for similar issues.
---

Web UI **Alerts & Diagnostics** → **Diagnostics** → **Troubleshooting library**.

![Fix records in the troubleshooting library](/img/screenshots/21-troubleshooting-records.png)

## View records

| Type | Description |
| :--- | :--- |
| **Internal** | Fixes recorded in this environment |
| **Built-in** | Product presets (such as high CPU) |
| **Error log** | Attached to an ERROR fingerprint |
| **Monitoring alert** | Attached to alert-type signals |

Cards include title, trigger condition or exception summary, **Verified troubleshooting steps**, plus root cause, prevention advice, tags, and more.

## Find and record

- When **Known solution** appears on the **Errors** page → open the matching record and follow the steps.
- Search: title, fingerprint, keywords, tags, author.
- After resolving a new issue, click **Create solution** to write reusable steps.

For CLI create or update, see [STX CLI](../architecture/cli).
