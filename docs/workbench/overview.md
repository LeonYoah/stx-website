---
title: 调试工作台
sidebar_label: 调试工作台
description: 连接器模板与参数官方介绍，以及 DAG、测试连接、预览、变量与 Checkpoint 一键恢复。
---

## 为什么要有调试工作台

两件事：

1. **连接器太多**，每次写配置都要翻文档。  
2. **脚本写完**，没有同屏地方测连通、看拓扑、看样本数据。

调试工作台专做这两件事。Web UI 底栏进 **工作台**（`/workbench`）。

![调试工作台](/img/screenshots/02-workbench.png)

### 1. 连接器太多，不想每次翻文档

SeaTunnel 连接器数量大，每个插件的必填项、枚举、默认值都不一样。工作台会**动态解析**目标集群安装目录里的连接器包，取出该插件的全部配置项。

用法：右侧 **配置模板** → 选 Source / Transform / Sink 插件名 → **一键把 HOCON 模板插入编辑区**（含必填 / 条件 / 可选分区注释）。

![选择插件后自动注入配置模板](/img/screenshots/12-workbench-template.png)

插入后，参数自带官方介绍，也不用再去翻文档：

| 能力 | 表现 |
| :--- | :--- |
| **悬停说明** | 光标停在参数名上：说明、默认值、是否必填、枚举列表 |
| **枚举补全** | 在 `=` 后弹出合法取值（如 `DROP_DATA` / `APPEND_DATA` / `CUSTOM_PROCESSING` / `ERROR_WHEN_DATA_EXISTS`） |

说明与枚举来自连接器包里的 Option 定义（经 **stx-java-proxy** 抽出），与当前集群版本对齐。右侧需选中**集群模式**下的具体集群；节点上 **stx-java-proxy** 默认 **18080**，须与 STX Server 打通。

![参数悬停：说明与枚举值](/img/screenshots/13-workbench-param-docs.png)

![枚举值智能补全](/img/screenshots/11-workbench-enum.png)

### 2. 写完脚本，需要同屏发现对不对

只靠提交到引擎再看失败日志成本太高。工作台提供三件调试能力：

| 能力 | 解决什么 | 怎么用 |
| :--- | :--- | :--- |
| **DAG** | 脚本依赖关系看不清 | 解析 Source / Transform / Sink，画成节点与边；Sink 侧还会解析将要执行的**建表语句** |
| **测试连接** | 还不需要看拓扑，只想验证连通与对象是否存在 | 点工具栏 **测试连接**：库能不能连、表在不在等 |
| **预览** | 想看真实数据长什么样，再写 Transform / Sink | 解析脚本后**抹掉原 Sink**，换成定制预览出口，按 Source → Transform 拉数，展示在预览面板 |

**DAG / 测试连接 / 预览**直接用当前编辑器草稿即可。  
**正式运行、Savepoint 恢复、开启定时**前须 **发布新版本**（见下节）。

#### DAG

看清「这条脚本在干什么」：上游从哪张表来、中间怎么变换、下游写到哪。点开算子可对表路径与字段；Sink 上能对照实际建表 DDL。

![DAG 预览与表结构](/img/screenshots/08-dag.png)

#### 测试连接

不跑完整作业。适合改完 `url` / 账号 / 表名后先探活：改完草稿 → **测试连接** → 按结果再改。

#### 预览

预览不是「再提交一次正式 Sink」。流程是：解析 HOCON → 去掉原 Sink、挂上预览出口 → 从 Source 取数（可经 Transform）→ 底部 **预览** 看行数据。

用来确认 Source 样本对不对、Transform 之后字段是否符合预期，再写正式 Sink。默认预览约 **100** 行；超时约 **10** 分钟。

## 保存与发布

| 动作 | 作用 |
| :--- | :--- |
| **保存** | 只更新草稿 |
| **发布新版本** | 生成可正式跑的版本 |

**正式运行、Savepoint 恢复、开启定时**前，至少发布一次；仅保存不会解除限制（与界面「请先发布版本」一致）。  
**DAG / 测试连接 / 预览**用当前编辑器草稿即可，不必先发布。

## 变量管理

配置里用双花括号引用，例如 `{{mysql_password}}`、`{{system.biz.date}}`。

| 类型 | 用途 |
| :--- | :--- |
| **内置时间变量** | 平台提供的日期 / 时间表达式（如业务日），悬停可预览当前基准下的解析结果 |
| **自定义变量** | 任务级普通文本，方便把库名、路径等抽出去 |
| **密码 / 保密变量** | 保存后界面加星，不再回显明文 |
| **全局变量** | 跨任务复用的平台级变量 |

右侧 **任务变量** 可维护本任务自定义项；脚本里出现的占位会在「脚本识别变量」里汇总。变量名不要与内置时间变量冲突。

## 定时（轻量，非生产编排）

工作台带简易 **定时**（cron）。改定时配置后要点 **保存** 才会生效；**开启定时**前任务须至少有一个**已发布版本**，触发时跑的是最新已发布内容，不会用未保存草稿。

这是**单机轻量**周期触发，没有按生产级分布式调度去验证。复杂工作流、高可用与统一告警，用专业调度系统编排（如 Apache DolphinScheduler、Apache Airflow），再对接 STX / SeaTunnel。

## Checkpoint 与一键恢复

实时作业开了 Checkpoint 时，异常或正常停掉后，若只能调 HTTP 或命令行先找作业 ID、再带参数恢复，步骤长、易错。工作台提供：

- 工具栏 **Savepoint 恢复**  
- 底部任务列表行内 **恢复**（按该次历史实例）

```bash
stx sync job recover <job-id> --confirm
stx sync job cancel <job-id> --savepoint --confirm
```

引擎自带的 Checkpoint 界面信息往往偏少。STX 经 **stx-java-proxy** 做反序列化解析，打开 **CK 文件详情** 可直接看到，例如：

- MySQL CDC 等源的 **Binlog 位点**  
- 读取进度相对事件时间的 **延迟**  
- Sink 侧两阶段提交（2PC）状态  
- 触发 / 完成 / 失败次数、单次耗时波形  

![CK 文件详情：Binlog 位点与延迟](/img/screenshots/14-checkpoint-detail.png)

底部切到 **Checkpoint** 即可进入。流作业通常要等 `checkpoint.interval` 后才有首个点；**BATCH** 默认不触发检查点。

## 日常操作顺序（举例）

1. 右侧选中在线集群。  
2. 新建或打开任务 → 用配置模板插入 `MySQL-CDC` / `Jdbc` 等。  
3. 用悬停与枚举补全改参数；密码放进保密变量。  
4. **测试连接** → **DAG** 核对拓扑与建表 → **预览** 看样本行（可随时 **保存** 草稿）。  
5. **发布新版本** → **运行**；流作业可在 Checkpoint 页看位点与延迟；需要时用 **恢复** / Savepoint 停止。

新建任务默认带 `FakeSource` → `Console` 骨架，可先练编辑与预览。也可先[一键装一套集群](../host-cluster/cluster-management)做联调。

## 和 CLI 的关系

人和 AI Agent 可用同一套 `stx sync …`。CLI 设计与审计见 [CLI 设计](../architecture/cli)。

| 场景 | 示例 |
| :--- | :--- |
| 列任务 / 提交 | `stx sync task list`、`stx sync task submit <id> --confirm` |
| 测试连接 / DAG / 预览 | `stx sync task test-connections <id>`、`stx sync task dag <id>`、`stx sync task preview <id>` |
| 插件模板 | `stx sync plugin template --cluster-id <id> --type source --name MySQL-CDC` |
| 作业恢复 | `stx sync job recover <job-id> --confirm` |

主机与集群见 [主机管理](../host-cluster/host-management)、[集群管理](../host-cluster/cluster-management)；**18080** 见 [系统架构](../architecture/overview)。
