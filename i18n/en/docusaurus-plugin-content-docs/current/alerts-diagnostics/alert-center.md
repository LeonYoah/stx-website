---
title: Alert center
sidebar_label: Alert center
description: View alert events, handle firing alerts, and configure rules and notifications.
---

Web UI **Alerts & Diagnostics** → **Alert center** (`/monitoring`). Use the top-right toggle for **Alert events** and **Rules & notifications**; you can also open [Diagnostics](./error-center) from the top bar.

## Alert events

![Alert event list with status filter and time range](/img/screenshots/18-alert-events.png)

The list combines **local process events** and **remote Alertmanager** alerts. Filter by status, cluster, source, and time range, or search alert name, rule ID, and summary. Click the row action to view event details, timeline, and handling history.

| Column | What to look at |
| :--- | :--- |
| **Cluster / Source** | Which cluster the alert belongs to, and whether it comes from a local process event or remote Alertmanager. |
| **Alert name / Severity** | Rule name, identifier, and warning or critical severity. |
| **Current status** | Firing, recovered, or closed. |
| **Summary / First trigger / Last change** | Brief problem description and when it occurred. |

**Current status** reflects the alert condition or this event's state; **Handling progress** records manual actions. **Acknowledged** does not mean **recovered**.

| Action | Result |
| :--- | :--- |
| **Acknowledge** | Mark as taken; you can leave a note. |
| **Silence for 30 minutes** | When firing and not silenced, temporarily suppress notifications. |
| **Close manually** | Close this event; new separate events can still alert again. |
| **Go to Diagnostics for deeper investigation** | Continue with alert context to view errors or inspection results. |

## Rules & notifications

After switching to **Rules & notifications**, use **Alert rules**, **Notification channels**, and **Delivery history** in order.

| Page | Operations |
| :--- | :--- |
| **Alert rules** | View rules by cluster; adjust switches, thresholds, and time windows. |
| **Notification channels** | Create email or Webhook channels; save and test send. |
| **Delivery history** | Verify notifications were sent; view failure reasons. |

![Notification channel list and create entry](/img/screenshots/19-notification-channels.png)

Notification channels currently offer **Email** and **Webhook** as create options. For WeCom, DingTalk, or Feishu bots, fill in the Webhook URL per the target platform; do not treat them as separate channel types. To continue investigating on-site, go to [Inspections & diagnostic reports](./diagnostic-report).

For CLI operations, see [STX CLI](../architecture/cli).
