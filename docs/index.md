---
title: STX 文档中心
sidebar_label: 文档总览
description: 欢迎查阅 STX 官方文档，快速了解系统定位与使用路径。
---

欢迎查阅 **STX** 官方文档。面向 Apache SeaTunnel 的一站式运维平台，并原生提供 AI Agent 智能运维入口（CLI + Skill）。

## 快速导航

根据你的目标，选择最适合的阅读路径：

| 你的目标 | 推荐阅读 | 说明 |
| :--- | :--- | :--- |
| **初次接触** | [快速部署 STX](./get-started/quick-start) | 5 分钟在 Linux 上启动服务并登录 Web UI |
| **了解底层设计** | [系统架构](./architecture/overview) | 搞懂 STX Server、Web UI、Agent 与默认端口 |
| **了解命令行** | [CLI 设计](./architecture/cli) | 为何原生 CLI、审计可追溯、给 AI Agent 用 |
| **纳管主机** | [主机管理](./host-cluster/host-management) | 登记物理机 / 虚拟机、安装 Agent、理解在线与绑定规则 |
| **管理集群** | [集群管理](./host-cluster/cluster-management) | 纳管已有进程或一键安装，完成启停与扩节点 |
| **写同步作业** | [调试工作台](./workbench/overview) | 连接器模板、参数官方介绍、DAG / 测试连接 / 预览与一键恢复 |
| **看告警与错误** | [告警中心](./alerts-diagnostics/alert-center) | 列表、确认 / 静默 / 关闭、策略 |
| | [错误中心](./alerts-diagnostics/error-center) | ERROR 聚合、频次、「已有方案」 |
| | [排障经验库](./alerts-diagnostics/troubleshooting-memory) | 已验证方案检索与沉淀 |

---

## 核心功能一览

* **主机管理**：登记物理机 / 虚拟机，一键安装 `stx-agent`，按心跳判定在线并采集资源指标。
* **集群管理**：创建集群定义后，纳管已有 SeaTunnel 进程或一键分发安装；支持混合 / 分离部署与节点启停。
* **调试工作台**：动态解析连接器包生成模板与参数说明；DAG、测试连接、预览同屏调试；变量、Checkpoint 与 Savepoint 一键恢复。
* **告警与诊断**：告警中心统一处置进程事件与 Alertmanager；错误中心聚合日志 ERROR；排障经验库沉淀可复用方案。
* **配置中心**：在线维护 `seatunnel.yaml`、`hazelcast.yaml` 等核心配置，支持历史版本对比与回滚。
* **插件生态管理**：可视化查看当前集群已安装的 Connector 插件，支持一键下载与版本同步。
* **一体化监控**：对接 Prometheus 与 Grafana，监控作业同步速率与节点资源瓶颈。
