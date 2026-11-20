---
title: Alert policies and detection rules
sidebar_label: Alert policies & rules
description: Configure alert policy templates, detection rules, and notification routing.
---

In Web UI **Alerts & diagnostics** → **Alert center** → **Alert policies & notifications**, you can manage alert policies, notification channels, and delivery history. For viewing and handling alert events, see [Alert center](./alert-center).

## Alert sources and categories

Alerts are grouped by source and map to `source_type` in policies and routing:

| Category | `source_type` | Description |
| :--- | :--- | :--- |
| Platform health | `platform_health` | Platform and cluster health alerts, such as node issues, Agent link issues, job status fetch failures, and event channel degradation. |
| Metric alerts | `metric` | Alerts triggered by built-in monitoring metrics, such as CPU, memory, FD, or thread pool backlog. |
| Job alerts | `job` | Alerts for specific jobs, such as job failures or high CDC delay. |

## Alert policies

![Alert policy list and create entry](/img/screenshots/44-alert-policies.png)

Alert policies define when to notify and where to send notifications. Typical settings include:

| Setting | Description |
| :--- | :--- |
| Template | Choose a platform health or metric template to create a policy quickly. |
| Scope | Select clusters or objects the policy applies to. |
| Severity and cooldown | Set alert severity and cooldown between repeated notifications. |
| Notification channels | Select channels that receive alerts. |

## Detection rules

Detection rules define the trigger conditions (metric, threshold, and time window) and are configured with the template and scope when creating or editing an alert policy. Metric alerts are evaluated on the built-in monitoring interval and can recover automatically when conditions no longer match.

List the rule catalog via CLI:

```bash
stx monitoring alert-rule catalog
```

## Notification channels and routing

Notification channels support **Email** and **Webhook**. You can configure WeCom, DingTalk, or Feishu bots as webhook targets according to each platform.

Notification routing can match channels by alert category (`source_type`: `platform_health` / `metric` / `job`) so different alert types can be delivered to different receivers.

## Delivery history

![Delivery history list and failure reasons](/img/screenshots/45-delivery-history.png)

The **Delivery History** tab shows whether each notification was delivered per policy and channel, with event type, response codes, and failure reasons.

## Related commands

```bash
# Alert instances
stx monitoring alert-instance list
stx monitoring alert-instance ack <id> --confirm
stx monitoring alert-instance silence <id> --confirm
stx monitoring alert-instance close <id> --confirm

# Detection rule catalog
stx monitoring alert-rule catalog

# Notification channels and routes
stx monitoring notification-channel list
stx monitoring notification-route list
```

See [STX CLI](../architecture/cli) for parameters and write operations.
