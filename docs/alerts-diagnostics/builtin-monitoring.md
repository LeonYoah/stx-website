---
title: 内置监控与首页大盘
sidebar_label: 内置监控与大盘
description: 了解 STX 内置监控的数据来源、首页大盘与趋势图，以及容量与保留策略。
---

本页适用于已包含内置监控的 STX 开发构建。指标采集、存储、查询和告警评估都在 STX Server 内完成，不需要额外部署监控组件。v1.4.0 仍使用外部监控组件；切换前请查看[升级指南](../get-started/upgrade)。

## 采集内容

| 来源 | 内容 | 方式 |
| :--- | :--- | :--- |
| SeaTunnel 引擎 | 每个受管集群在线节点的引擎指标（JVM 堆 / 非堆、GC、线程、CPU、FD、作业线程池、Hazelcast 分区与执行器、作业状态计数等） | STX Server 按 `observability.scrape_interval`（默认 15 秒）访问节点指标接口 `seatunnel_metrics.path`（默认 `/hazelcast/rest/instance/metrics`） |
| STX 作业 | 每个作业的读写条数 / 字节、提交条数、CDC 延迟、Checkpoint 耗时与失败次数、算子忙碌度、边背压、表级读写量 | 作业状态对账时写入；作业结束时写入最终值 |

节点不可达时，该节点在可用性相关视图中显示为不可用。

## 首页大盘与趋势图

Web UI 首页提供集群、作业、主机三个大盘，用于查看整体运行状态与关键指标。集群与作业相关页面的趋势图、作业详情的趋势页签，以及诊断报告中的指标快照，都使用同一份内置监控数据。

![集群大盘：节点可用性与引擎指标](/img/screenshots/41-dashboard-cluster.png)

**集群**页签按集群查看节点可用性、JVM 堆内存、进程 CPU 等引擎指标；**作业**页签汇总读写吞吐、数据量等作业指标。

![主机大盘：CPU、内存、负载与磁盘](/img/screenshots/43-dashboard-hosts.png)

**主机**页签按被纳管主机查看 CPU、内存、系统负载、网络与磁盘指标。

## 配置

在 `config.yaml` 的 `observability` 段配置（默认值见 `config.example.yaml`）：

```yaml
observability:
  enabled: true              # 总开关，默认开启
  storage:
    dir: "data/tsdb"         # 数据目录，相对安装目录
    retention: ""            # 默认不按时间清理；可填 31d 等时长
    # max_size: 32212254720  # 可选，显式设置存储上限（字节）
  scrape_interval: "15s"     # 引擎指标采集间隔
  eval_interval: "15s"       # 指标告警评估间隔
  query_timeout: "8s"        # 单次查询超时
  max_samples: 10000000      # 单次查询最多加载的样本数
```

修改后重启 STX Server 生效。Docker Compose 部署时，监控数据保存在挂载目录下的 `data/stx/tsdb`（以实际 Compose 挂载为准）。

## 容量与保留策略

- **保留时长**：默认不按时间清理。设置 `storage.retention`（例如 `31d`）后，超出时长的历史数据会被清理。
- **存储上限**：未设置 `storage.max_size` 时，取 30 GiB 和数据目录所在磁盘容量的 20% 中较小值。超出上限时优先清理最旧的数据块；设为 `0` 取消容量上限。
- **采集间隔**：`scrape_interval` 越短，数据越细，但占用空间和查询压力越大。

## 常见问题

| 现象 | 检查方向 |
| :--- | :--- |
| 趋势图显示监控数据暂不可用 | 数据目录权限或磁盘空间，或查询超时；查看 `logs/backend.log` 中 `[Observability]` 日志 |
| 某个节点图表为空 | 节点是否在线、Hazelcast 端口是否可达，以及 `seatunnel_metrics.path` 是否正确 |
| 作业趋势没有数据 | 作业需要处于运行中才持续写入；已结束作业可在作业详情按作业全程查看历史 |

STX Server 停止后，内置监控无法告警。要检测 STX Server 是否可用，可从外部定期探测其健康检查地址，例如 `http://10.0.0.10:17800/api/v1/health`。

告警相关配置见[告警策略与检测规则](./alert-policies-rules)和[告警中心](./alert-center)。
