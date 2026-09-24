---
title: STX CLI
sidebar_label: STX CLI
description: Use the stx command line to query and manage an STX environment.
hide_table_of_contents: true
---

import ChineseGuideLink from '@site/src/components/docs/ChineseGuideLink';

:::note English guide in progress
This is a short overview. <ChineseGuideLink docId="architecture/cli" />
:::

The same `stx` binary can start STX Server (`stx api`) or work as a CLI (`stx login`, `stx cluster list`). Copy it to a Linux machine with the same CPU architecture to inspect remote clusters, jobs, and logs. Like the `hadoop` command after installing Hadoop, the command is a client when you use it to query a running service.

## Try it

```bash
stx login --server http://10.0.0.10:17800
stx whoami
stx cluster list --output table
stx sync job list --status FAILED --output table
```

`login` prompts for your username and password. To investigate a failed job, use `stx sync job logs <job-id> --lines 40`. The CLI does not diagnose the issue by itself. An AI Agent can read the bundled command guide with `stx skill show` and use the CLI with your approval. See [Install STX CLI](../get-started/quick-start#install-stx-cli) for both installation layouts.

## At a glance

- The CLI connects to STX Server over HTTP.
- Read-only commands can be used to inspect an environment before changing it.
- Commands that change state require explicit confirmation.
