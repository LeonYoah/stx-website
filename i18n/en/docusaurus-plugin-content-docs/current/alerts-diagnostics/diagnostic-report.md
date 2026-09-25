---
title: Inspections & diagnostic reports
sidebar_label: Inspections & reports
description: Start inspections, view findings, and preview or download diagnostic reports and packages.
---

Web UI **Alerts & Diagnostics** → **Diagnostics** → **Inspections** (`/diagnostics?tab=inspections`). View check records here, then open reports.

## Start an inspection

![Inspection page with check records and entry](/img/screenshots/22-inspection-records.png)

1. Select the cluster to inspect at the top of the page, then click **Inspect now**.
2. Set **Inspection time range** (5–1440 minutes, default 30 minutes), **Error trigger threshold** (1–1000, default 1), and choose resources to collect this time.
3. After starting, view status, findings summary, and lookback window in check records. Click **Summary** for this check, or **Full report** to open inspection details.

An inspection first creates a check record, then starts diagnostic package collection for the selected resources. If collection fails to start, the inspection report may still be generated; rely on check records and task status.

![Diagnostic package status, execution logs, and report entry in inspection details](/img/screenshots/23-inspection-detail.png)

The **Diagnostic package** section in inspection details shows collection status. Click **View execution logs** to verify steps; after success, click **Preview report** to open HTML, or **Download diagnostic package** to save logs and other files. When a package already exists, you can **Regenerate**; when there are findings but no package yet, choose **Generate diagnostic package and report in one click**.

## Read the HTML report

![Offline diagnostic report overview and left tabs](/img/screenshots/17-diagnostic-report-overview.png)

| Tab | Content |
| :--- | :--- |
| **Overview** | Time range and findings summary for this check. |
| **Evidence to review** | View observed values and related evidence by finding. |
| **Timeline** | Events during collection in time order. |
| **Metrics** | Sample values, thresholds, and trends by metric and instance; a single sample point does not draw a trend; gaps break the curve. |
| **Raw evidence** | Browse errors, inspections, configuration, metrics, thread stacks, alerts, and process info by category. Configuration files can be switched; credentials in preview are masked. |
| **Appendix** | Task, execution steps, and cluster information. |

"No structured findings generated this time" only means **checks executed in this time range** produced no findings—it does not mean no raw data was collected. Check **Raw evidence** for on-site content; for steps not executed or failed, verify in **Appendix**.

Use the bottom-left control to switch light or dark mode. For PDF, use **Print / Export PDF**. For logs, thread stacks, and other files outside HTML, download the **diagnostic package** from inspection details. Before sharing, review host addresses, logs, and configuration; masked credentials in config preview do not mean the entire package is safe to publish.

To start from error clues, see [Errors](./error-center); for existing fixes, see [Troubleshooting library](./troubleshooting-memory).
