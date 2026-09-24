---
title: 排障经验库
sidebar_label: 排障经验库
description: 沉淀已验证排障方案；错误组可显示「已有方案」，同类故障复用。
---

Web UI **告警与诊断** → **诊断中心** → **排障经验库**。

![排障经验库](/img/screenshots/16-troubleshooting-memory.png)

## 分类

| 类型 | 说明 |
| :--- | :--- |
| **内部经验** | 本环境沉淀 |
| **系统内置** | 产品预置（如 CPU 过高） |
| **错误日志** | 挂在 ERROR 指纹上 |
| **监控告警** | 挂在告警类信号上 |

卡片含标题、触发条件或异常摘要、**已验证排障方案**，以及根因、防范建议、标签等。

## 用法

- 错误中心出现 **已有方案** → 打开对应经验按步骤处理。  
- 搜索：标题、指纹、关键词、标签、记录人。  
- 新问题解决后点 **记录排障**，写入可复用步骤。

## CLI

```bash
stx diagnostics troubleshooting-memory create --request-file ./memory.json --confirm
stx diagnostics troubleshooting-memory update <id> --request-file ./memory.json --confirm
```
