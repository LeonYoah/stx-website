---
title: Alert center
sidebar_label: Alert center
description: Handle alerts, configure cluster and job rules, and manage notification channels and deliveries.
---

Open **Alert center** (`/monitoring`) in the Web UI. The top-right tabs switch between **Alerts**, **Rules**, and **Notifications**. Open [Diagnostics](./error-center) from the top left.

## Alert events

![Alert list, status filters, and time range](/img/screenshots/18-alert-events.png)

Filter by status, scope, severity, cluster, or time range, or search by name, rule key, or cluster. Click an alert to see its details and timeline, or use the row's **More** menu to act on it.

| Action | Result |
| :--- | :--- |
| **Acknowledge** | Mark the alert as seen; the condition has not necessarily recovered. |
| **Silence 30 min** | Pause notifications for this alert without changing its trigger condition. |
| **Close** | Close this event; new alerts can still fire. |

## Configure alert rules {#rules}

Open **Rules**, choose **Cluster** or **Job**, then click a rule to see its details.

![Cluster rules, global defaults, and enable switches](/img/screenshots/44-alert-policies.png)

- **Cluster**: Set global defaults for the rule's enabled state, severity, and any applicable threshold and duration. To override a rule for one cluster, select that cluster before editing. Unchanged fields inherit the global defaults. A rule can use the default notification settings or specify its own channels and recipients.
- **Job**: Manage rules for individual jobs, such as job failure or high CDC delay.

## Set up notifications and check deliveries

Open **Notifications**. Use **Default notification** to set shared channels, recipients, cooldown, and whether to notify on recovery.

![Default notification, channels, and New channel action](/img/screenshots/19-notification-channels.png)

Under **Channels**, click **New channel** and choose Email, Webhook, WeCom, DingTalk, or Feishu. Use **Test** in the channel list to check the configuration.

![Delivery list and failure reasons](/img/screenshots/45-delivery-history.png)

Open **Deliveries** and filter by notification channel, delivery status, or event. For failed deliveries, check the response and error. To investigate further, see [Inspections & diagnostic reports](./diagnostic-report).

For CLI operations, see [STX CLI: Alerts and monitoring](../architecture/cli#alerts-and-monitoring).
