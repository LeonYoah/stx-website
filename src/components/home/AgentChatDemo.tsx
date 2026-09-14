import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * STX Agent 对话演示：复刻 MiMo 嵌入演示的工作台动画骨架（侧栏 + 打字机 + 阶段卡片），
 * 内容与配色改为 STX / SeaTunnel 运维主题。非 MiMo 资产拷贝。
 * STX agent chat demo: MiMo-style workspace animation skeleton, STX-themed content.
 */

type Phase = {
  title: string;
  tool: string;
  detail: string;
  queries: string[];
  icon: 'cli' | 'jobs' | 'logs' | 'code';
};

type Finding = { number: string; title: string; quote: string };

const CONTENT = {
  agentName: 'STX Agent',
  modelLabel: 'CLI + Skill',
  chatTitle: 'SeaTunnel 集群诊断',
  projectName: 'zeta-prod 运维',
  recentActive: '线上集群健康巡检',
  recentIdle: ['配置 Diff 回滚演练', 'Connector 插件升级'],
  prompt:
    '帮我看看线上 SeaTunnel 现在有哪些集群在跑，任务是否健康；若有失败任务，拉错误日志并对照源码给出根因。',
  reply:
    '我会通过 STX Skill 编排 `stx` CLI：先列集群与运行中任务，再定位失败作业日志，最后对照 SeaTunnel 源码给出可执行修复建议。',
  phases: [
    {
      title: '拉取运行中集群',
      tool: 'stx cluster list',
      icon: 'cli',
      queries: [
        'zeta-prod · Zeta · healthy 3/3',
        'spark-batch · Spark · healthy 4/4',
        'flink-cdc · Flink · degraded 2/3',
      ],
      detail:
        '调用 `stx cluster list --format table`，经 STX API 读取控制面纳管集群状态与节点心跳。',
    },
    {
      title: '枚举运行 / 失败任务',
      tool: 'stx job list',
      icon: 'jobs',
      queries: [
        'job-1831 orders_cdc_sync · RUNNING',
        'job-1842 inventory_enrich · FAILED',
        'job-1850 user_profile_stream · RUNNING',
      ],
      detail:
        '调用 `stx job list --cluster zeta-prod --state RUNNING,FAILED`，锁定失败作业 job-1842。',
    },
    {
      title: '采集失败任务日志',
      tool: 'stx job logs',
      icon: 'logs',
      queries: [
        'Checkpoint barrier timeout 30s',
        'JDBC batch failed: Duplicate key',
        'JobMaster · SinkException',
      ],
      detail:
        '调用 `stx job logs --id job-1842 --tail 40`，从集群侧拉取最近错误栈。',
    },
    {
      title: '对照 SeaTunnel 源码',
      tool: 'skill.read',
      icon: 'code',
      queries: [
        'JdbcSinkWriter.java:214',
        'ignoreDuplicate / upsert 策略',
        '建议 stx job restart',
      ],
      detail:
        'Skill 读取 SeaTunnel `JdbcSinkWriter` 冲突分支，确认根因为主键冲突而非集群宕机。',
    },
  ] satisfies Phase[],
  completedTitle: '诊断完成',
  completedSummary:
    '根因是 JDBC Sink 主键冲突。可改为 upsert，或清理冲突数据后执行 `stx job restart --id job-1842`。',
  findings: [
    {
      number: '01',
      title: '集群面健康',
      quote: 'zeta-prod 节点 3/3 在线，控制面心跳正常。',
    },
    {
      number: '02',
      title: '任务面异常',
      quote: 'job-1842 inventory_enrich 失败，日志指向 Duplicate key。',
    },
    {
      number: '03',
      title: '源码可解释',
      quote: 'JdbcSinkWriter 在非 upsert 模式下对冲突直接抛 SinkException。',
    },
  ] satisfies Finding[],
  artifactTitle: 'job-1842 诊断纪要',
  artifactMeta: 'SeaTunnel · STX Agent',
  artifactDone: '已生成修复建议',
  composerIdle: '描述你想排查的集群或任务…',
  composerBusy: 'STX Agent 正在调用 stx…',
  footnoteLeft: 'STX Agent · Skill',
  footnoteRight: '演示剧本 · 非实时集群',
};

/** MiMo 嵌入演示同款阶段时间戳（ms） / Same stage marks as MiMo embedded demo */
const MARKS = [2400, 3500, 4800, 6300, 7800, 9300, 10500];
const END_TIME = MARKS[MARKS.length - 1];
const TYPE_START = 350;
const TYPE_DURATION = 1350;

type Mode = 'welcome' | 'running' | 'complete';

function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}): React.JSX.Element {
  const common = {
    className,
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  const paths: Record<string, ReactNode> = {
    panel: <path d="M4 6h16M4 12h10M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </>
    ),
    bell: (
      <>
        <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </>
    ),
    plus: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    plugin: (
      <path d="M12 3l7 4v10l-7 4-7-4V7l7-4zM12 12l7-4M12 12v10M12 12L5 8" />
    ),
    box: (
      <path d="M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7" />
    ),
    folder: (
      <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    ),
    chevron: <path d="M6 9l6 6 6-6" />,
    send: <path d="M5 12h14M13 6l6 6-6 6" />,
    check: <path d="M5 12l5 5L20 7" />,
    replay: (
      <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
    ),
    cli: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="M7 10l3 2-3 2M12 14h5" />
      </>
    ),
    jobs: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
    logs: (
      <>
        <path d="M8 6h13v14H8z" />
        <path d="M4 6h4v14H4z" />
        <path d="M11 10h6M11 14h6" />
      </>
    ),
    code: (
      <>
        <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] ?? null}</svg>;
}

/**
 * 首页 Agent 对话演示工作台
 * Homepage agent conversation demo workspace
 */
export function AgentChatDemo(): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('welcome');
  const [promptText, setPromptText] = useState('');
  const [phaseCount, setPhaseCount] = useState(0);
  const [phaseDone, setPhaseDone] = useState<boolean[]>([]);
  const [showFinish, setShowFinish] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    playing: true,
    elapsed: 0,
    stage: -1,
    mode: 'welcome' as Mode,
  });
  const reducedMotion = useRef(false);

  const resetPlay = useCallback(() => {
    stateRef.current = {
      playing: true,
      elapsed: 0,
      stage: -1,
      mode: 'welcome',
    };
    setMode('welcome');
    setPromptText('');
    setPhaseCount(0);
    setPhaseDone([]);
    setShowFinish(false);
    setShowTyping(false);
    setHeaderTitle('');
    setExpanded(null);
    setRunId((n) => n + 1);
  }, []);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    let frameId: number | null = null;
    let previous = performance.now();
    let cancelled = false;

    const beginTask = () => {
      stateRef.current.mode = 'running';
      setMode('running');
      setHeaderTitle(CONTENT.chatTitle);
      setShowTyping(true);
      setPhaseCount(0);
      setPhaseDone([]);
      setShowFinish(false);
      setPromptText('');
    };

    const addPhase = (index: number) => {
      setPhaseDone((prev) => {
        const next = [...prev];
        for (let i = 0; i < index; i += 1) next[i] = true;
        return next;
      });
      setPhaseCount(index + 1);
    };

    const finish = () => {
      setPhaseDone(CONTENT.phases.map(() => true));
      setShowTyping(false);
      setShowFinish(true);
      stateRef.current.mode = 'complete';
      setMode('complete');
      stateRef.current.playing = false;
    };

    const advance = (stage: number) => {
      if (stage === 0) beginTask();
      else if (stage < 5) addPhase(stage - 1);
      else if (stage === 5) finish();
    };

    const completeImmediately = () => {
      while (stateRef.current.stage < 5) {
        stateRef.current.stage += 1;
        advance(stateRef.current.stage);
      }
      stateRef.current.stage = 6;
      stateRef.current.elapsed = END_TIME;
      stateRef.current.playing = false;
    };

    const tick = () => {
      frameId = null;
      if (cancelled) return;
      const now = performance.now();
      const delta = Math.max(0, Math.min(now - previous, 100));
      previous = now;
      const s = stateRef.current;
      if (!s.playing) return;

      if (reducedMotion.current) {
        completeImmediately();
        return;
      }

      s.elapsed = Math.min(END_TIME, s.elapsed + delta);

      if (s.mode === 'welcome') {
        const progress = Math.max(
          0,
          Math.min(1, (s.elapsed - TYPE_START) / TYPE_DURATION),
        );
        const chars = Array.from(CONTENT.prompt);
        setPromptText(chars.slice(0, Math.floor(chars.length * progress)).join(''));
      }

      while (s.stage + 1 < MARKS.length && s.elapsed >= MARKS[s.stage + 1]) {
        s.stage += 1;
        advance(s.stage);
      }

      if (s.playing && s.elapsed < END_TIME) {
        frameId = window.requestAnimationFrame(tick);
      } else if (s.mode === 'complete') {
        // 播完后停顿再循环 / Pause then loop
        window.setTimeout(() => {
          if (!cancelled) resetPlay();
        }, 3800);
      }
    };

    previous = performance.now();
    frameId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [runId, resetPlay]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || mode === 'welcome') return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [mode, phaseCount, showFinish, showTyping]);

  const composerPlaceholder =
    mode === 'running' ? CONTENT.composerBusy : CONTENT.composerIdle;

  return (
    <section className="stx-agent-demo" aria-labelledby="stx-agent-demo-title">
      <div className="stx-agent-demo__intro">
        <p className="stx-agent-demo__eyebrow">AI Agent · CLI + Skill</p>
        <h2 id="stx-agent-demo-title" className="stx-agent-demo__title">
          对话即运维，Agent 替你调用 stx
        </h2>
        <p className="stx-agent-demo__sub">
          复刻 MiMo 官方演示的丝滑工作台节奏：打字机提问、阶段任务卡、调用过程可见——主题换成
          STX 与 SeaTunnel 集群。
        </p>
      </div>

      <div className={`stx-mimo ${mode !== 'welcome' ? 'is-active' : ''}`}>
        <aside className="stx-mimo__sidebar" aria-label="Agent 导航">
          <div className="stx-mimo__toolbar">
            <button type="button" className="stx-mimo__icon-btn" tabIndex={-1} aria-hidden>
              <Icon name="panel" />
            </button>
            <button type="button" className="stx-mimo__icon-btn" tabIndex={-1} aria-hidden>
              <Icon name="search" />
            </button>
            <button type="button" className="stx-mimo__icon-btn" tabIndex={-1} aria-hidden>
              <Icon name="bell" />
            </button>
          </div>

          <nav className="stx-mimo__nav">
            <span className="stx-mimo__nav-item">
              <Icon name="plus" />
              新建任务
            </span>
            <span className="stx-mimo__nav-item">
              <Icon name="plugin" />
              插件 / Skill
            </span>
            <span className="stx-mimo__nav-item">
              <Icon name="box" />
              产物中心
              {showFinish ? <em className="stx-mimo__badge">1</em> : null}
            </span>
          </nav>

          <div className="stx-mimo__side-scroll">
            <div className="stx-mimo__section-label">
              <Icon name="folder" />
              项目
            </div>
            <div className="stx-mimo__project">
              <Icon name="folder" />
              {CONTENT.projectName}
            </div>

            <div className="stx-mimo__section-label">最近</div>
            <button type="button" className="stx-mimo__recent is-selected" tabIndex={-1}>
              {CONTENT.recentActive}
            </button>
            {CONTENT.recentIdle.map((item) => (
              <button key={item} type="button" className="stx-mimo__recent" tabIndex={-1}>
                {item}
              </button>
            ))}
          </div>

          <div className="stx-mimo__user">
            <span className="stx-mimo__avatar" aria-hidden>
              SX
            </span>
            <div>
              <strong>STX 运维</strong>
              <small>个人空间</small>
            </div>
          </div>
        </aside>

        <div className="stx-mimo__main">
          <header className="stx-mimo__header">
            <span
              className="stx-mimo__header-title"
              style={{ opacity: headerTitle ? 1 : 0 }}
            >
              {headerTitle || CONTENT.chatTitle}
            </span>
            <div className="stx-mimo__header-actions">
              {mode === 'running' ? (
                <span className="stx-mimo__status">
                  <i />
                  调用中
                </span>
              ) : null}
              <button
                type="button"
                className="stx-mimo__icon-btn"
                onClick={resetPlay}
                title="重播演示"
                aria-label="重播演示"
              >
                <Icon name="replay" />
              </button>
            </div>
          </header>

          <div ref={scrollerRef} className="stx-mimo__viewport">
            {mode === 'welcome' ? (
              <div className="stx-mimo__welcome">
                <div className="stx-mimo__welcome-mark" aria-hidden>
                  STX
                </div>
                <h3>让 SeaTunnel 运维不再黑箱</h3>
                <p>用自然语言驱动 stx CLI：集群、任务、日志与源码一气呵成。</p>
              </div>
            ) : (
              <div className="stx-mimo__conversation" role="log" aria-live="polite">
                <div className="stx-mimo__user-msg stx-mimo__reveal">
                  {CONTENT.prompt}
                </div>

                <div className="stx-mimo__assistant-head stx-mimo__reveal">
                  <span className="stx-mimo__agent-mark" aria-hidden>
                    STX
                  </span>
                  <strong>{CONTENT.agentName}</strong>
                  <small>{CONTENT.modelLabel}</small>
                </div>
                <p className="stx-mimo__assistant-text stx-mimo__reveal">{CONTENT.reply}</p>

                <div className="stx-mimo__phases">
                  {CONTENT.phases.slice(0, phaseCount).map((phase, index) => {
                    const done = Boolean(phaseDone[index]);
                    const open = expanded === index;
                    return (
                      <section key={phase.title} className="stx-mimo__phase stx-mimo__reveal">
                        <button
                          type="button"
                          className="stx-mimo__phase-toggle"
                          aria-expanded={open}
                          onClick={() => setExpanded(open ? null : index)}
                        >
                          <span className="stx-mimo__phase-icon">
                            <Icon name={phase.icon} />
                          </span>
                          <span className="stx-mimo__phase-title">
                            <strong>{phase.title}</strong>
                            <small>{phase.tool}</small>
                          </span>
                          <span className="stx-mimo__phase-state">
                            {done ? <Icon name="check" /> : '进行中'}
                          </span>
                          <Icon name="chevron" className="stx-mimo__phase-arrow" />
                        </button>
                        {open ? (
                          <div className="stx-mimo__phase-detail">
                            <p>{phase.detail}</p>
                            <div className="stx-mimo__queries">
                              {phase.queries.map((q) => (
                                <span key={q}>{q}</span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>

                {showTyping ? (
                  <div className="stx-mimo__typing" aria-label="生成中">
                    <i />
                    <i />
                    <i />
                  </div>
                ) : null}

                {showFinish ? (
                  <div className="stx-mimo__finish stx-mimo__reveal">
                    <h4>{CONTENT.completedTitle}</h4>
                    <p>{CONTENT.completedSummary}</p>
                    <ol className="stx-mimo__findings">
                      {CONTENT.findings.map((f) => (
                        <li key={f.number}>
                          <span>{f.number}</span>
                          <div>
                            <strong>{f.title}</strong>
                            <p>{f.quote}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <div className="stx-mimo__artifact">
                      <span className="stx-mimo__artifact-cover" aria-hidden>
                        STX
                      </span>
                      <span className="stx-mimo__artifact-copy">
                        <strong>{CONTENT.artifactTitle}</strong>
                        <small>{CONTENT.artifactMeta}</small>
                        <em>
                          <Icon name="check" />
                          {CONTENT.artifactDone}
                        </em>
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="stx-mimo__composer-wrap">
            <div className="stx-mimo__composer">
              <textarea
                readOnly
                rows={3}
                value={promptText}
                placeholder={composerPlaceholder}
                aria-label="演示输入框"
              />
              <div className="stx-mimo__composer-bar">
                <div className="stx-mimo__composer-left">
                  <span className="stx-mimo__chip">
                    <Icon name="plus" />
                  </span>
                  <span className="stx-mimo__chip stx-mimo__chip--label">默认权限</span>
                </div>
                <div className="stx-mimo__composer-right">
                  <span className="stx-mimo__model">{CONTENT.modelLabel}</span>
                  <span
                    className={`stx-mimo__send ${promptText || mode !== 'welcome' ? 'is-on' : ''}`}
                    aria-hidden
                  >
                    <Icon name="send" />
                  </span>
                </div>
              </div>
            </div>
            <div className="stx-mimo__footnote">
              <span>{CONTENT.footnoteLeft}</span>
              <span>{CONTENT.footnoteRight}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
