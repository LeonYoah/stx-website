---
title: System architecture
sidebar_label: System architecture
description: See where STX Server, the Web UI, and stx-agent run.
hide_table_of_contents: true
---

import ChineseGuideLink from '@site/src/components/docs/ChineseGuideLink';

:::note English guide in progress
This is a short overview. <ChineseGuideLink docId="architecture/overview" />
:::

This guide explains the STX installation host, managed hosts, default ports, and the connections between them.

## At a glance

- STX Server and the Web UI run on the STX installation host.
- Each managed host runs stx-agent. A SeaTunnel node can also run stx-java-proxy.
- The default ports are 17880 for the Web UI, 17800 for the API, and 17890 for agent gRPC.
