---
title: 错误
sidebar_label: 错误
description: 按错误指纹聚合 SeaTunnel ERROR，按频次筛选；有匹配的处理方法时显示「已有方案」。
---

Web UI **告警与诊断** → **诊断中心** → **错误**（`/diagnostics`）。同页还有[巡检](./diagnostic-report)和[经验库](./troubleshooting-memory)。

![错误组和已有方案标记](/img/screenshots/20-error-groups.png)

## 查看错误组

| 列 | 说明 |
| :--- | :--- |
| **错误组** | 按指纹聚合的摘要 |
| **已有方案** | 经验库里已有对应方案时显示 |
| **异常类 / 来源节点** | 如 `java.sql.SQLException`；主机与节点 |
| **出现次数 / 最近出现** | 累计次数与最近时间 |

:::tip
列表中的 **已有方案** 表示经验库中有匹配的处理方法。打开详情核对日志样本，再决定是否使用。
:::

频次筛选：**高频严重**（≥10）、**中频预警**（3～9）、**低频偶发**（&lt;3）。可按集群筛选，搜摘要 / 异常类 / 来源文件。点 **详情** 看事件样本与证据；需要继续采集现场时，转到 **巡检** 查看检查记录和[诊断报告](./diagnostic-report)。

## 哪些错误会出现

**stx-agent** 增量扫描节点 SeaTunnel 日志中的 `ERROR` / `FATAL`，上报后按指纹归组。stx-agent 须在线；未写入这些日志的异常这里看不到。

命令行查询见 [STX CLI](../architecture/cli)。
