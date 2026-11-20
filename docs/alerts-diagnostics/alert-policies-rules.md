---
title: 告警策略与检测规则
sidebar_label: 告警策略与检测规则
description: 配置告警策略模板、检测规则与通知路由，控制告警何时触发、如何发送。
---

Web UI **告警与诊断** → **告警中心** → **告警策略与通知** 中，可管理告警策略、通知通道与投递记录。告警事件的查看与处理见[告警中心](./alert-center)。

## 告警来源与类别

告警按来源分为三类，在策略与路由中对应 `source_type`：

| 类别 | `source_type` | 说明 |
| :--- | :--- | :--- |
| 平台健康 | `platform_health` | 平台与集群运行状态告警，如节点异常、Agent 链路异常、作业状态获取失败、事件通道降级等。 |
| 指标告警 | `metric` | 基于内置监控指标评估触发的告警，如 CPU、内存、FD、线程池积压等。 |
| 作业告警 | `job` | 面向具体作业的告警，如作业运行失败、CDC 延迟过高等任务级规则。 |

## 告警策略

![告警策略列表与新建入口](/img/screenshots/44-alert-policies.png)

告警策略用于定义“什么情况下发出告警、发给谁”。配置时通常包括：

| 配置项 | 说明 |
| :--- | :--- |
| 模板 | 选择平台健康模板或指标模板，快速生成策略。 |
| 作用范围 | 指定策略生效的集群或对象范围。 |
| 级别与冷却时间 | 设置告警级别，以及重复通知的冷却间隔。 |
| 通知渠道 | 选择接收告警的通知通道。 |

## 检测规则

检测规则定义具体的触发条件（指标、阈值与时间窗口），在创建或编辑告警策略时随模板与作用集群一起配置。指标告警由内置监控按评估间隔计算，规则不再满足时告警可自动恢复。

命令行可查看规则目录：

```bash
stx monitoring alert-rule catalog
```

## 通知通道与路由

通知通道支持**邮件**和 **Webhook**。企业微信、钉钉或飞书机器人可按平台要求填写 Webhook 地址。

通知路由可按告警类别（`source_type`：`platform_health` / `metric` / `job`）匹配不同通道，便于将平台健康、指标告警、作业告警分别发送到不同接收方。

## 投递记录

![投递记录列表与失败原因](/img/screenshots/45-delivery-history.png)

**投递记录**页签按策略与通道核对每次通知是否送达，可查看事件类型、响应码与失败原因。

## 相关命令

```bash
# 告警实例处理
stx monitoring alert-instance list
stx monitoring alert-instance ack <id> --confirm
stx monitoring alert-instance silence <id> --confirm
stx monitoring alert-instance close <id> --confirm

# 检测规则目录
stx monitoring alert-rule catalog

# 通知通道与路由
stx monitoring notification-channel list
stx monitoring notification-route list
```

更多参数与写操作说明见 [STX CLI](../architecture/cli)。
