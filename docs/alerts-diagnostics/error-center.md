---
title: 错误中心
sidebar_label: 错误中心
description: 按错误指纹聚合 SeaTunnel ERROR，按频次筛选；有沉淀方案时显示「已有方案」。
---

Web UI **告警与诊断** → **诊断中心** → **错误中心**（`/diagnostics`）。同页还有巡检中心、[排障经验库](./troubleshooting-memory)。

![错误中心](/img/screenshots/15-error-center-with-solutions.png)

## 列表

| 列 | 说明 |
| :--- | :--- |
| **错误组** | 按指纹聚合的摘要 |
| **已有方案** | 经验库里已有对应方案时显示 |
| **异常类 / 来源节点** | 如 `java.sql.SQLException`；主机与节点 |
| **出现次数 / 最近出现** | 累计次数与最近时间 |

频次筛选：**高频严重**（≥10）、**中频预警**（3～9）、**低频偶发**（&lt;3）。可按集群筛选，搜摘要 / 异常类 / 来源文件。点 **详情** 看事件样本与证据。

## 数据从哪来

**stx-agent** 增量扫描节点 SeaTunnel 日志中的 `ERROR` / `FATAL`，上报后按指纹归组。Agent 须在线；未写入这些日志的异常这里看不到。

## CLI

```bash
stx diagnostics error group list
stx diagnostics error group get <group-id>
stx diagnostics error event list --error-group-id <group-id>
```
