---
title: Debug workbench
sidebar_label: Debug workbench
description: Write jobs with curated templates and raw default parameter templates, test connections, preview data, and view Checkpoints.
---

Open **Workbench** from the Web UI bottom bar. Select a cluster first, then create a new job or open an existing one. You can insert connector templates, test connections, view the DAG and preview data; you must publish a version before a formal run.

## Open the workbench

![Debug workbench](/img/screenshots/02-workbench.png)

## Use templates

After selecting a cluster, open **Templates** on the right. There are two tabs:

| Tab | Usage |
| :--- | :--- |
| **Curated templates** | Open by default. Filter by `env`, `source`, `transform`, `sink`, or a combination; select a template to preview it, then click **Insert**. |
| **Raw default parameter templates** | Choose a Source, Transform, or Sink plugin and insert the HOCON parameter template it provides. Switch here when you need the full raw parameters for a plugin. |

Curated templates can be combined as fragments. When you insert `env`, an existing `env` block in the script is replaced; inserting a **combined template** replaces the entire editor. If the script is not empty, you are asked to confirm first. After inserting, check sample addresses, databases, tables, paths, and credential variables before saving or publishing.

**Template management** lets you create, duplicate, edit, and delete your own curated templates. System templates are read-only; click **Duplicate** to edit your own copy. To save part of the current script, select text in the editor, right-click **Save as curated template**, then enter a name and category. Use `{{variable_name}}` for passwords or secrets—do not write them in plain text.

While editing configuration, you can use:

| Capability | Behavior |
| :--- | :--- |
| **Hover docs** | Hover over a parameter name to see its description, default value, whether it is required, and enum values |
| **Enum completion** | After `=`, valid values appear (for example `DROP_DATA` / `APPEND_DATA` / `CUSTOM_PROCESSING` / `ERROR_WHEN_DATA_EXISTS`) |

Descriptions and enum values come from the connector package on the selected cluster. To use these features, select a specific cluster. On nodes, `stx-java-proxy` listens on **18080** by default; STX Server must be able to reach it.

![Parameter hover: description and enum values](/img/screenshots/13-workbench-param-docs.png)

![Enum value completion](/img/screenshots/11-workbench-enum.png)

## Debug script

After writing configuration, use the current script to check connections, job structure, and data samples:

| Capability | What it solves | How to use |
| :--- | :--- | :--- |
| **DAG** | Hard to see script dependencies | Parses Source / Transform / Sink into nodes and edges; on the Sink side, also parses the **CREATE TABLE** statements that would run |
| **Test connection** | Verify connectivity and object existence without viewing topology | Click **Test connection** in the toolbar: whether the database connects, whether tables exist, and so on |
| **Preview** | See what real data looks like before writing Transform / Sink | Reads sample rows from Source with the current script, optionally through Transform; does not write to the configured Sink |

:::tip
DAG, test connection, and preview use the current script in the editor—you do not need to publish first. A formal run, Savepoint recovery, and enabling scheduling require at least one published version.
:::

### DAG

See what the script does: which upstream table data comes from, how it is transformed, and where it is written downstream. Click an operator to inspect table paths and fields; on Sink nodes, compare the actual CREATE TABLE DDL.

![DAG preview and table structure](/img/screenshots/08-dag.png)

### Test connection

Does not run the full job. Useful after changing `url`, credentials, or table names: edit the script → **Test connection** → adjust based on the result.

### Preview

After clicking **Preview**, view sample rows from Source and after Transform in the bottom panel. Preview does not write to the formal Sink in the configuration.

Use this to confirm Source samples and post-Transform fields before writing the formal Sink. Preview defaults to about **100** rows; timeout is about **10** minutes.

## Save and publish

| Action | Effect |
| :--- | :--- |
| **Save** | Updates the draft only |
| **Publish new version** | Creates a version that can run formally |

Before a **formal run, Savepoint recovery, or enabling scheduling**, publish at least once; saving alone does not remove the restriction (consistent with the UI message "Publish a version first").  
**DAG / test connection / preview** use the current editor script and do not require publishing first.

## Variable management

Reference variables with double curly braces in configuration, for example `{{mysql_password}}` or `{{system.biz.date}}`.

| Type | Purpose |
| :--- | :--- |
| **Built-in time variables** | Date/time expressions provided by the platform (such as business date); hover to preview the resolved value under the current baseline |
| **Custom variables** | Plain text at job level, useful for extracting database names, paths, and so on |
| **Password / secret variables** | Masked in the UI after saving; plaintext is not shown again |
| **Global variables** | Platform-level variables reused across jobs |

Use **Job variables** on the right to maintain custom variables for this job; placeholders in the script are summarized under "Variables detected in script". Do not use variable names that conflict with built-in time variables.

## Scheduling (lightweight, not production orchestration)

The workbench includes simple **scheduling** (cron). After changing schedule settings, click **Save** for them to take effect; before **Enable scheduling**, the job must have at least one **published version**. When triggered, the latest published content runs—not unsaved drafts.

This is **single-machine lightweight** periodic triggering, not validated for production-grade distributed scheduling. For complex workflows, high availability, and unified alerting, use a professional scheduler (such as Apache DolphinScheduler or Apache Airflow) and integrate with STX / SeaTunnel.

## Checkpoint and one-click recovery

When Checkpoint is enabled for a streaming job, after an abnormal or normal stop, recovering via HTTP or CLI alone means finding the job ID and passing parameters—long steps, easy to get wrong. The workbench provides:

- Toolbar **Savepoint recovery**  
- Row-level **Recover** in the bottom job list (for that historical instance)

```bash
stx sync job recover <job-id> --confirm
stx sync job cancel <job-id> --savepoint --confirm
```

The engine's built-in Checkpoint UI often shows little detail. STX parses via **stx-java-proxy** deserialization; open **CK file details** to see directly, for example:

- **Binlog position** for sources such as MySQL CDC  
- **Lag** of read progress relative to event time  
- Sink-side two-phase commit (2PC) state  
- Trigger / complete / failure counts and per-run duration waveforms  

![CK file details: Binlog position and lag](/img/screenshots/14-checkpoint-detail.png)

Switch to **Checkpoint** at the bottom to open it. Streaming jobs usually need to wait for `checkpoint.interval` before the first checkpoint; **BATCH** does not trigger checkpoints by default.

## From debugging to running

1. Select an online cluster on the right.  
2. Create or open a job → insert fragments such as `MySQL-CDC` / `Jdbc` from **Curated templates**, or choose a plugin under **Raw default parameter templates**.
3. Edit parameters with hover docs and enum completion; put passwords in secret variables.  
4. **Test connection** → **DAG** to verify topology and table creation → **Preview** sample rows (you can **Save** at any time).
5. **Publish new version** → **Run**; for streaming jobs, view position and lag on the Checkpoint page; use **Recover** / Savepoint stop when needed.

New jobs default to a `FakeSource` → `Console` skeleton so you can practice editing and preview. You can also [install a cluster in one click](../host-cluster/cluster-management) for integration testing.

For CLI usage, see [CLI design](../architecture/cli). For cluster onboarding, see [Cluster management](../host-cluster/cluster-management).
