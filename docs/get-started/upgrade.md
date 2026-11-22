---
title: 升级 STX
sidebar_label: 升级指南
description: 从旧版本升级 STX，了解内置监控替代旧监控组件后的变化与注意事项。
---

本页适用于升级到已包含内置监控的 STX 开发构建。若目标版本是 v1.4.0，请按其[发布说明](https://github.com/LeonYoah/stx/releases/tag/v1.4.0)升级，不要按本页移除外部监控组件。

## 升级前准备

- 备份安装目录中的配置与数据（尤其是 `config.yaml` 和数据库 / `data` 目录）。
- 确认当前版本与目标版本的发布说明，安排维护窗口。
- 如通过 Docker Compose 部署，准备在升级后清理不再使用的监控容器。

## 升级步骤（Linux 安装包）

1. 停止当前 STX 服务：执行 `bin/stop.sh` 或 `systemctl stop stx`。
2. 使用新版本安装包覆盖安装（或按发布说明执行升级脚本），保留现有 `config.yaml` 与数据目录。
3. 检查 `config.yaml`：旧的 `observability.prometheus` / `alertmanager` / `grafana` / `remote_ingest` 配置段会被忽略，可按需清理。
4. 启动服务：执行 `bin/start.sh` 或 `systemctl start stx`。
5. 登录 Web UI，确认首页大盘、告警中心与集群状态正常。

`bin/start.sh` / `bin/stop.sh` 的 `--observability` 参数仅为兼容旧版保留并会被忽略。内置监控开关请在 `config.yaml` 中设置 `observability.enabled`。

## 升级步骤（Docker Compose）

1. 拉取或解压新版本 Compose 包，更新镜像与配置。
2. 执行 `docker compose up -d --remove-orphans`，启动新服务并移除不再使用的 prometheus / alertmanager / grafana 容器。
3. 监控数据默认写在挂载目录下的 `data/stx/tsdb`（以实际挂载为准）。

## 监控相关变化

| 变化项 | 说明 |
| :--- | :--- |
| 监控组件 | 不再需要 Prometheus / Alertmanager / Grafana；采集、存储、查询与告警评估在 STX Server 内完成。 |
| 数据目录 | 监控数据默认保存在 `data/tsdb`。默认只按容量清理，详见[容量与保留策略](../alerts-diagnostics/builtin-monitoring#容量与保留策略)。 |
| 历史数据 | 旧版监控历史数据不会自动迁移，升级后从零开始积累。 |
| 旧配置 | `observability.prometheus` / `alertmanager` / `grafana` / `remote_ingest` 配置段会被忽略并提示清理。 |
| 旧安装参数 | `--with-observability`、`--prometheus-port`、`--alertmanager-port`、`--grafana-port` 不再被接受，传入会报错，请从安装命令中移除。 |
| 外部告警接入 | 原 `/api/v1/monitoring/alertmanager/webhook` 已移除；指向该地址的外部推送会收到 404。STX 对外发送的 webhook / 邮件等通知渠道不受影响。 |

升级后旧版留下的 `observability/` 目录与数据会保留，可在确认不再需要后手动删除。

## 升级后检查

- 首页集群 / 作业 / 主机大盘能正常显示。
- 告警中心来源显示为平台健康 / 指标告警 / 作业告警。
- 通知通道与投递记录正常。
- 如有自定义脚本或外部系统调用旧监控接口，请按[接口变更](#面向二次开发的接口变更)调整。

## 面向二次开发的接口变更

以下接口已删除：

- `GET /api/v1/monitoring/prometheus/discovery`
- `GET /api/v1/monitoring/prometheus/jobs/metrics`
- `POST /api/v1/monitoring/alertmanager/webhook`
- `ANY /api/v1/monitoring/proxy/grafana`
- `ANY /api/v1/monitoring/proxy/grafana/*proxyPath`

告警 `source_type` 取值改为 `platform_health` / `metric` / `job`，旧值返回 400；Webhook 通知负载中的 `source_type` 取值同步变化。
