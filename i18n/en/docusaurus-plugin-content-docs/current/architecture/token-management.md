---
title: Token management
sidebar_label: Token management
description: Admins issue CLI tokens for scripts and scheduler workers. The plaintext is shown only once.
---

An administrator issues a CLI token for an account on **User management**. Scripts, CI, and Dolphin workers call STX with that token instead of a password. Tokens start with `stx_`. The plaintext appears only when the token is issued; the list shows a prefix.

## Open token management

Web UI dock **User management** → tab **Token management** (`/admin/users?tab=tokens`). The subtitle is "Issue tokens for CLI, scripts, and scheduler workers".

| Filter | Meaning |
| :--- | :--- |
| **All / Active / Expired / Revoked** | The counts at the top switch the list |
| **Search token name** | Filter by name, for example `dolphin-worker` |

| Column | What it shows |
| :--- | :--- |
| **Name** | Name entered when issuing |
| **Owner** | Which user this token acts as |
| **Prefix** | Like `stx_xxxx******`, not the plaintext |
| **Expiration** | Expiry time, or **Never expires** |
| **Last used** | Last time this token called STX |
| **Status** | **Active** / **Expired** / **Revoked** |

## Issue a token

Click **Issue Token**. The default lifetime for an admin-issued token is **Never**.

| Field | Meaning |
| :--- | :--- |
| **Name** | Required. For example `dolphin-worker` on a worker, `ops-laptop` on a laptop |
| **Owner** | Required. The token calls STX as this user |
| **Expiration** | **7 days** / **30 days** / **90 days** / **Never** / **Custom** (1 to 3650 days) |

After issue, **Copy token** appears. The UI says the plaintext is shown only once and cannot be retrieved later. Copy it now into the worker or local config.

You can also issue from the CLI:

```bash
stx admin token create --user-id 1 --name dolphin-worker --expires-in never --confirm
stx admin token list --current 1 --size 20 --output table
```

`--expires-in` accepts `7d`, `30d`, `90d`, `never`, or a custom value such as `60d`.

## Use it on the CLI or a worker

If the STX install host is `10.0.0.10`, bind the `stx_` plaintext on the machine that will run commands:

```bash
stx login --server http://10.0.0.10:17800 --token stx_...
stx whoami
```

To keep it out of shell history, read it from stdin:

```bash
printenv STX_TOKEN | stx login --server http://10.0.0.10:17800 --token-stdin
```

A worker only needs `STX_SERVER` and `STX_TOKEN`. Token login cannot be combined with a username or password.

Password login is the other path: `stx login --server http://10.0.0.10:17800` prompts for credentials and issues a **7-day** token by default. Use `--expires-in 30d` or `--expires-in never` for a longer lifetime.

When you attach a job to DolphinScheduler, push writes the SHELL node only. It does not issue or write `STX_TOKEN` for the worker. Bind the token as above. See [DolphinScheduler external schedule](../workbench/dolphin-scheduler).

## Revoke

On an **Active** token, click **Revoke Token**. The confirm text says logins and scripts using it will fail immediately.

```bash
stx admin token revoke 1 --confirm
```

`stx logout` revokes the login token **this machine** is currently using.

## Audit log

The Web UI **Audit log** adds a **Token** column: CLI shows the token name and prefix; Web shows **Session**. Source is still **CLI** / **Web** / **System**.

How to read the audit page: [STX CLI](./cli#audit-logs).
