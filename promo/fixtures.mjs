/**
 * 截图夹具：演示环境里 Checkpoint 文件已被清理，这里按作业 #13（私有2，MySQL-CDC → Jdbc）当时的真实检查结果
 * 还原接口响应，只在截图用的无头浏览器内应答，不会写入服务端。
 * Capture fixtures: the demo's checkpoint files have been cleaned up, so these replay the real inspection result of
 * job #13 (私有2, MySQL-CDC → Jdbc) inside the capture browser only; nothing is written to the server.
 */

export const CK_JOB = { id: 13, engineJobId: '179000218632900000' };

const NAMESPACE = '/tmp/seatunnel/checkpoint3';
const LATEST_ID = 20;
const BASE_TS = Date.parse('2026-09-21T22:47:32+08:00');
// 每 10 秒一次 Checkpoint，耗时有自然起伏。/ One checkpoint every 10 s with natural duration jitter.
const DURATIONS = [88, 71, 64, 93, 58, 62, 77, 69, 54, 81, 66, 59, 72, 95, 61, 57, 68, 74, 63, 64];
const SIZES = [2318, 2324, 2331, 2336, 2342, 2347, 2351, 2356, 2360, 2364, 2369, 2373, 2377, 2380, 2383, 2385, 2387, 2389, 2390, 2391];

const record = (i) => ({
  pipelineId: 1,
  checkpoint: {
    checkpointId: i + 1,
    checkpointType: i + 1 === LATEST_ID ? 'SAVEPOINT_TYPE' : 'CHECKPOINT_TYPE',
    status: 'COMPLETED',
    triggerTimestamp: BASE_TS + i * 10000,
    completedTimestamp: BASE_TS + i * 10000 + DURATIONS[i],
    durationMillis: DURATIONS[i],
    stateSize: SIZES[i],
  },
});

const history = Array.from({ length: LATEST_ID }, (_, i) => record(i)).reverse();
const latest = history[0].checkpoint;

export const checkpointSnapshot = {
  job_instance_id: CK_JOB.id,
  platform_job_id: CK_JOB.engineJobId,
  engine_job_id: CK_JOB.engineJobId,
  status: 'canceled',
  overview: {
    jobId: CK_JOB.engineJobId,
    updatedAt: latest.completedTimestamp,
    pipelines: [{
      pipelineId: 1,
      counts: { triggered: LATEST_ID, completed: LATEST_ID, failed: 0, inProgress: 0 },
      latestCompleted: latest,
      latestSavepoint: latest,
      inProgress: [],
      history,
    }],
  },
  history,
};

const fileName = (id) => `${1790002246015 - (LATEST_ID - id) * 10000}-978-1-${id}.ser`;
const filePath = (id) => `${NAMESPACE}/${CK_JOB.engineJobId}/${fileName(id)}`;

// SeaTunnel 只保留最近几次 Checkpoint 文件。/ SeaTunnel retains only the latest few checkpoint files.
export const checkpointFiles = {
  cluster_id: 1,
  kind: 'checkpoint',
  path: `${NAMESPACE}/${CK_JOB.engineJobId}`,
  items: [LATEST_ID, LATEST_ID - 1, LATEST_ID - 2].map((id) => ({
    path: filePath(id),
    name: fileName(id),
    directory: false,
    size_bytes: SIZES[id - 1],
    modified_at: new Date(BASE_TS + (id - 1) * 10000 + DURATIONS[id - 1]).toISOString(),
  })),
};

export const checkpointInspect = {
  cluster_id: 1,
  path: `file:${filePath(LATEST_ID)}`,
  file_name: fileName(LATEST_ID),
  storage_type: 'LOCAL_FILE',
  size_bytes: latest.stateSize,
  binary: true,
  completed_checkpoint: { jobId: CK_JOB.engineJobId, pipelineId: 1, ...latest },
  pipeline_state: { jobId: CK_JOB.engineJobId, pipelineId: 1, checkpointId: LATEST_ID },
  source_state_inspect: {
    completed_checkpoint: { jobId: CK_JOB.engineJobId, pipelineId: 1, ...latest },
    sources: [{
      actionName: 'Source[0]-MySQL-CDC',
      pluginName: 'MySQL-CDC',
      configIndex: 0,
      subtaskCount: 1,
      stateBytesTotal: 1630,
      splitCountTotal: 1,
      normalizedProgress: {
        category: 'LOG_STREAM',
        primaryLabel: 'Binlog 位点',
        primaryValue: 'mysql-bin.000003 : 12584',
        secondaryLabel: '同步阶段',
        secondaryValue: '增量实时 (Incremental)',
        phaseBadge: 'INCREMENTAL',
        eventTime: Date.parse('2026-09-21T20:42:15+08:00'),
        lagSeconds: 7711,
        targetTables: ['stx_e2e.users_src'],
        subtaskProgress: [{ subtaskIndex: 0, target: 'stx_e2e.users_src', currentOffset: 'mysql-bin.000003:12584', status: 'NORMAL' }],
      },
    }],
    sinks: [{
      actionName: 'Sink[0]-Jdbc',
      pluginName: 'Jdbc',
      configIndex: 0,
      subtaskCount: 1,
      chunksTotal: 1,
      stateBytesTotal: 761,
      normalizedProgress: {
        category: 'SINK_2PC',
        primaryLabel: '提交机制',
        primaryValue: '两阶段提交 (2PC / Checkpoint)',
        secondaryValue: '已完成预提交 (Prepared)',
        subtaskProgress: [{ subtaskIndex: 0, target: 'stx_e2e.users_sink', chunks: 1, bytes: 761, status: 'PREPARED' }],
      },
    }],
  },
};
