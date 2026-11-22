---
title: 升级 STX
sidebar_label: 升级指南
description: 在 Web UI 一键升级 STX 控制面与 stx-agent，或通过 Docker Compose 与安装脚本升级，附 v1.5.0 升级注意事项。
---

升级 STX 有三种方式：物理机 / 虚拟机部署推荐直接在 **Web UI「系统升级」** 内完成；Docker 部署直接更新镜像；也可通过安装脚本覆盖升级。

:::tip 升级不影响业务作业
STX 自升级仅重启 STX 控制面、前端、`stx-agent` 与 `stx-java-proxy`，**不会停止或重启 SeaTunnel 集群及正在运行的作业**。升级前建议先备份安装目录下的 `config.yaml` 与 `data/` 目录。
:::

## 方式一：Web UI 在线 / 离线自升级（推荐）

适用于物理机 / 虚拟机部署，需要**管理员账号**登录 Web UI。

### 1. 进入「系统升级」页

点击底部导航栏右侧的 **个人信息** 图标，在弹窗中下滑到底部，点击 **检查更新** 进入 **系统升级** 页：

![系统升级入口：点击底部栏个人信息，下滑弹窗点击检查更新](/img/screenshots/51-self-upgrade-entry.png)

### 2. 按四步完成升级

![系统升级四步引导：检查更新、预置资产、演练或开始升级、校验各节点 Agent 版本](/img/screenshots/52-self-upgrade-steps.png)

1. **检查版本**：点击右上角 **检查更新**，确认当前版本与目标最新版本。
2. **预置资产**：
   - **联网环境**：选 **联网自动下载**，点击 **下载到本地仓**。
   - **离线 / 弱网环境**：切换到 **离线导入**，拖入或选择 `.tar.gz` / `.tgz` / `.zip` 离线发布包。
   - 等待控制面、`stx-agent`、`stx-java-proxy` 与前端静态包全部变为 **已就绪**。
3. **部署升级**：
   - 建议先点击 **演练（不实际应用）** 校验流程（不修改任何版本与进程）。
   - 确认无误后点击 **开始升级**，在确认弹窗中核对目标版本与涉及节点后点击 **确认升级**。
   - 若新版本启动失败会自动回滚到旧版本；当前离线的被纳管主机在重连后会自动补升级。
4. **校验就绪**：控制面重启期间页面会短暂断开约 3~5 秒并自动重连。重连后在 **各节点 Agent 版本** 确认所有节点与控制面版本一致，底部可查看 **升级历史记录**。

## 方式二：Docker Compose 升级

Docker 部署时，**系统升级** 页会自动识别为 **Docker 容器部署** 并给出宿主机升级命令。在 STX 安装机执行：

```bash
docker compose pull
docker compose up -d --remove-orphans
```

容器镜像内置最新 `stx-agent` 与 `stx-java-proxy` 资产，重启后即可对齐各被纳管主机组件。

## 方式三：安装脚本覆盖升级

如果无法访问 Web UI，或需要从不支持自升级的较早版本升级，可直接重新执行一键安装命令（见 [快速部署](./quick-start)）或运行新版本离线包中的 `install.sh`：

- 脚本会自动停止旧服务、保留已有 `config.yaml` 与 `data/` 目录并重启服务。
- 完成后登录 Web UI，确认大盘、告警中心与各主机 `stx-agent` 状态正常。

## 版本升级注意事项

### 升级到 v1.5.0（自 v1.4.0 及更早版本）

`v1.5.0` 起监控能力内置进 STX Server，不再依赖外部 Prometheus / Alertmanager / Grafana，升级时需注意以下变更：

| 变化项 | 说明 |
| :--- | :--- |
| 监控组件 | 不再需要部署 Prometheus / Alertmanager / Grafana；采集、存储、查询与告警评估均在 STX Server 内完成。Docker Compose 升级时请带 `--remove-orphans` 清理旧监控容器。 |
| 数据目录 | 监控数据默认保存在 `data/tsdb`（Docker 为挂载目录下的 `data/stx/tsdb`），默认仅按容量清理，详见 [容量与保留策略](../alerts-diagnostics/builtin-monitoring#容量与保留策略)。 |
| 历史数据 | 旧版外部监控的历史指标不会自动迁移，升级后从零开始积累；旧的 `observability/` 目录会保留，确认不再需要后可手动删除。 |
| 配置与启动参数 | `config.yaml` 中旧的 `observability.prometheus` / `alertmanager` / `grafana` / `remote_ingest` 段会被忽略；`bin/start.sh` / `bin/stop.sh` 的 `--observability` 参数仅做兼容保留并被忽略，开关内置监控请改用 `observability.enabled`。 |
| 安装脚本参数 | `--with-observability`、`--prometheus-port`、`--alertmanager-port`、`--grafana-port` 已移除，传入会报错，请从自动化脚本中删除。 |
| 外部告警接入 | 原 `POST /api/v1/monitoring/alertmanager/webhook` 已移除（调用返回 404）；STX 对外发送的 Webhook / 邮件通知不受影响。 |

#### 面向二次开发的接口变更（v1.5.0）

以下监控接口已删除：

- `GET /api/v1/monitoring/prometheus/discovery`
- `GET /api/v1/monitoring/prometheus/jobs/metrics`
- `POST /api/v1/monitoring/alertmanager/webhook`
- `ANY /api/v1/monitoring/proxy/grafana`
- `ANY /api/v1/monitoring/proxy/grafana/*proxyPath`

告警 `source_type` 取值改为 `platform_health` / `metric` / `job`（旧值返回 400），Webhook 通知负载中的 `source_type` 同步变更。
