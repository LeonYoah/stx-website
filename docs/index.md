---
title: STX 文档中心
sidebar_label: 文档总览
description: 欢迎查阅 STX 官方文档，快速了解系统定位与使用路径。
---

欢迎查阅 **STX** 官方文档。STX 是专为 Apache SeaTunnel 打造的轻量级、可视化集群管理与作业运维平台。

## 快速导航

根据你的目标，选择最适合的阅读路径：

| 你的目标 | 推荐阅读 | 说明 |
| :--- | :--- | :--- |
| **初次接触** | [快速部署 STX](./get-started/quick-start) | 5 分钟在单机或测试服务器上启动 STX 并接入集群 |
| **了解底层设计** | [架构与进程模型](./architecture/overview) | 搞懂 Control Plane、Scheduler、Worker 与 Agent 的协作关系 |
| **纳管现有集群** | [集群全生命周期管理](./features/cluster-management) | 掌握集群接入、节点扩缩容与健康探针机制 |

---

## 核心功能一览

* **主机与探针纳管**：一键分发并安装 `stx-agent`，实时采集主机负载与 SeaTunnel 进程状态。
* **集群管理**：支持一键安装 SeaTunnel Zeta 集群，提供 Master/Worker 节点的平滑启停与状态流转。
* **配置中心**：在线维护 `seatunnel.yaml`、`hazelcast.yaml` 等核心配置，支持历史版本 diff 比对与回滚。
* **插件生态管理**：可视化查看当前集群已安装的 Connector 插件，支持一键下载与版本同步。
* **一体化监控**：内置 Prometheus 与 Grafana 指标对接，精准监控作业同步速率与节点资源瓶颈。
