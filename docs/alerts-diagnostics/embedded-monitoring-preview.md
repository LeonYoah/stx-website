---
title: 内置监控（未发布）
sidebar_label: 内置监控（未发布）
description: 试用内置监控时，了解数据保留、告警分类以及从旧监控栈迁移的注意事项。
---

:::caution 仅适用于开发构建
内置监控尚未随正式版发布。使用 v1.4.0 时，请按[快速部署](../get-started/quick-start)和[告警中心](./alert-center)操作。
:::

STX Server 直接采集并保存主机、SeaTunnel 节点与作业指标，并在进程内评估指标告警。无需另装 Prometheus、Alertmanager 或 Grafana。首页大盘汇总集群、作业和主机状态；平台自监控还能查看 STX Server、stx-agent 和监控存储的状态。STX Server 停机时无法自行告警；需要检测停机时，从另一台机器探测其健康检查地址，例如 `http://10.0.0.10:17800/api/v1/health`。

## 采集与保留

| 配置项 | 默认值与行为 |
| :--- | :--- |
| `observability.enabled` | 默认 `true`。设为 `false` 会关闭内置指标采集、趋势图和指标告警。 |
| `observability.scrape_interval` / `observability.eval_interval` | 引擎指标采集与指标告警评估默认都是 `15s`。 |
| `observability.storage.dir` | 默认 `data/tsdb`，相对于 STX 安装目录。发版 Docker Compose 的宿主机路径为 `data/stx/tsdb`。 |
| `observability.storage.retention` | 默认不按时间清理。可设为 `90d` 等上限。 |
| `observability.storage.max_size` | 指标存储块的容量上限，默认按数据盘总容量的 20% 计算，最低 1 GiB、最高 30 GiB。可指定字节数；`0` 表示不限容量。 |

在 `config.yaml` 中修改后重启 STX。若同时设置时间与容量上限，先达到哪项就按哪项清理。

## 告警类别

告警与通知路由按 **平台健康**、**指标告警**、**作业告警** 分类。例如，stx-agent 版本不一致属于平台健康，节点资源指标持续超阈值属于指标告警，同步任务的 CDC 延迟过高属于作业告警。STX 仍可通过邮件、Webhook 和机器人渠道发送通知。

## 从外部监控升级

1. 升级前备份 STX 元数据库与配置。旧 `observability/` 目录会保留，但外部 Prometheus 的历史指标和 Grafana 面板不会自动迁移。
2. 从安装命令中移除 `--with-observability` 和三个旧端口参数（`--prometheus-port`、`--alertmanager-port`、`--grafana-port`）。`--without-observability` 仍可用，作用改为关闭内置监控；旧的 `start.sh --observability off` 不再能关闭采集。
3. 应用内升级后首次启动时，STX 会更新启停脚本并尝试停止旧监控进程。若回滚到旧版本并仍需本机三件套，先从 `bin/` 中选对时间戳的脚本备份（含 `bin/lib/observability.sh` 的备份），恢复原文件名后再重启旧服务。Docker Compose 则在使用新包的配置启动时加 `--remove-orphans`，停止并移除该 Compose 项目中遗留的监控容器。
4. 检查升级后被标记为失效的通知路由和自动巡检策略，重新选择告警类别或规则。旧 Alertmanager 未恢复事件会一次性标记为已恢复，不发送恢复通知。若通知接收端按 `source_type` 分类，改为使用 `platform_health`、`metric`、`job`。
5. 更新被纳管主机上的 stx-agent，才能完整采集主机指标与节点时区。未取得节点时区时，引擎时间回退到 STX Server 进程所在时区，不再使用 Web UI 的展示时区。
