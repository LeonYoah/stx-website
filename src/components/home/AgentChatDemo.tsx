import Link from '@docusaurus/Link';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import logoLight from '@site/static/img/stx-logo.png';
import logoDark from '@site/static/img/stx-logo-dark.png';
import {
  getAgentChrome,
  getAgentScenarios,
  type Scenario,
} from './agentDemoCopy';
import {useHomeLocale} from './useHomeLocale';

/**
 * STX 多场景演示：诊断 / MySQL-CDC→Hive 提交 / 2.3.8→2.3.13 升级验证。
 * stx 是 CLI 命令 + Skill，不是独立 AI Agent。
 * Multi-scenario demo; stx is a CLI command + Skill, not a standalone AI agent.
 */

/** 放慢节奏；阶段更多的场景仍保持可跟读 / Slow timeline for readability */
const TYPE_START = 200;
const TYPE_DURATION = 2800;
const START_AT = 4800;
const PHASE_GAP = 3200;
const MID_USER_GAP = 1600;
const FINISH_GAP = 2800;

type Mode = 'welcome' | 'running' | 'complete';

/**
 * stx Skill 提及胶囊：完整青鸾 Logo（图形 + STX 字样，仅提问时）。
 * Skill mention chip: full Qingluan logo (mark + STX wordmark, asks only).
 */
function StxMentionChip({
  className = '',
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <span className={`stx-mention ${className}`.trim()} title="STX">
      <img
        className="stx-mention__logo stx-mention__logo--light"
        src={logoLight}
        alt="STX"
        height={18}
        draggable={false}
      />
      <img
        className="stx-mention__logo stx-mention__logo--dark"
        src={logoDark}
        alt="STX"
        height={18}
        draggable={false}
      />
    </span>
  );
}

/** 对话区内完整青鸾 Logo（图形 + STX） / Full Qingluan logo inside chat shell */
function StxBrandMark({
  className = '',
  height = 28,
}: {
  className?: string;
  height?: number;
}): React.JSX.Element {
  return (
    <span className={`stx-brand-mark ${className}`.trim()}>
      <img
        className="stx-brand-mark__img stx-brand-mark__img--light"
        src={logoLight}
        alt="STX"
        height={height}
        draggable={false}
      />
      <img
        className="stx-brand-mark__img stx-brand-mark__img--dark"
        src={logoDark}
        alt="STX"
        height={height}
        draggable={false}
      />
    </span>
  );
}

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
    box: <path d="M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7" />,
    folder: (
      <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    ),
    chevron: <path d="M6 9l6 6 6-6" />,
    send: <path d="M5 12h14M13 6l6 6-6 6" />,
    check: <path d="M5 12l5 5L20 7" />,
    replay: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
    stop: <path d="M7 7h10v10H7z" />,
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
    sync: (
      <>
        <path d="M4 12a8 8 0 0 1 14-5" />
        <path d="M18 4v4h-4" />
        <path d="M20 12a8 8 0 0 1-14 5" />
        <path d="M6 20v-4h4" />
      </>
    ),
    upgrade: (
      <>
        <path d="M12 19V5" />
        <path d="M6 11l6-6 6 6" />
        <path d="M5 19h14" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] ?? null}</svg>;
}

type TimelineEvent =
  | { at: number; kind: 'start' }
  | { at: number; kind: 'phase'; index: number }
  | { at: number; kind: 'midUser'; text: string }
  | { at: number; kind: 'finish' };

function buildTimeline(scenario: Scenario): {
  events: TimelineEvent[];
  endAt: number;
} {
  const events: TimelineEvent[] = [{ at: START_AT, kind: 'start' }];
  let t = START_AT + 1400;
  let phasesDone = 0;

  scenario.phases.forEach((_, index) => {
    events.push({ at: t, kind: 'phase', index });
    phasesDone += 1;
    t += PHASE_GAP;

    const mids = scenario.midUsers.filter((m) => m.afterPhases === phasesDone);
    mids.forEach((m) => {
      events.push({ at: t, kind: 'midUser', text: m.text });
      t += MID_USER_GAP;
    });
  });

  events.push({ at: t + FINISH_GAP - PHASE_GAP, kind: 'finish' });
  return { events, endAt: t + FINISH_GAP - PHASE_GAP };
}

/**
 * 首页 stx Skill 对话演示工作台（多场景）
 */
export function AgentChatDemo({
  embedded = false,
}: {
  embedded?: boolean;
}): React.JSX.Element {
  const locale = useHomeLocale();
  const scenarios = useMemo(() => getAgentScenarios(locale), [locale]);
  const chrome = useMemo(() => getAgentChrome(locale), [locale]);

  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const scenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];

  // 切换语言时保持同一场景 id，必要时回退到首个 / Keep scenario id across locale switches
  useEffect(() => {
    if (!scenarios.some((s) => s.id === scenarioId)) {
      setScenarioId(scenarios[0].id);
    }
  }, [scenarios, scenarioId]);

  const [mode, setMode] = useState<Mode>('welcome');
  const [promptText, setPromptText] = useState('');
  const [phaseCount, setPhaseCount] = useState(0);
  const [phaseDone, setPhaseDone] = useState<boolean[]>([]);
  /** 按时间顺序的会话流（含阶段占位） / Chronological feed including phase slots */
  const [feed, setFeed] = useState<
    Array<
      | { kind: 'user'; text: string; mention?: boolean }
      | { kind: 'assistant'; text: string }
      | { kind: 'phase'; index: number }
    >
  >([]);
  const [showFinish, setShowFinish] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [runId, setRunId] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [artifactOpen, setArtifactOpen] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  /** 是否已滚入视口，未进入前不自动开播 / Gate autoplay until section is in view */
  const inViewRef = useRef(false);
  const stateRef = useRef({
    playing: false,
    elapsed: 0,
    eventIdx: -1,
    mode: 'welcome' as Mode,
  });
  const reducedMotion = useRef(false);
  const toastTimer = useRef<number | null>(null);
  const timelineRef = useRef(buildTimeline(scenario));

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const flashPress = useCallback((id: string) => {
    setPressedId(id);
    window.setTimeout(() => setPressedId((cur) => (cur === id ? null : cur)), 160);
  }, []);

  const resetPlay = useCallback(() => {
    timelineRef.current = buildTimeline(
      scenarios.find((s) => s.id === scenarioId) ?? scenarios[0],
    );
    stateRef.current = {
      // 手动重播立即开播；未入屏时的自动演示仍由 IntersectionObserver 解锁
      // Manual replay starts now; autoplay still waits for IntersectionObserver
      playing: true,
      elapsed: 0,
      eventIdx: -1,
      mode: 'welcome',
    };
    setMode('welcome');
    setPromptText('');
    setPhaseCount(0);
    setPhaseDone([]);
    setFeed([]);
    setShowFinish(false);
    setShowTyping(false);
    setHeaderTitle('');
    setExpanded(new Set());
    setArtifactOpen(false);
    setRunId((n) => n + 1);
  }, [scenarioId, scenarios]);

  const selectScenario = useCallback((id: string) => {
    setScenarioId(id);
  }, []);

  useEffect(() => {
    // 切换场景后重建时间线；已入屏则开播，否则等滑入 / Rebuild; play only if already in view
    timelineRef.current = buildTimeline(scenario);
    stateRef.current = {
      playing: inViewRef.current,
      elapsed: 0,
      eventIdx: -1,
      mode: 'welcome',
    };
    setMode('welcome');
    setPromptText('');
    setPhaseCount(0);
    setPhaseDone([]);
    setFeed([]);
    setShowFinish(false);
    setShowTyping(false);
    setHeaderTitle('');
    setExpanded(new Set());
    setArtifactOpen(false);
    setRunId((n) => n + 1);
  }, [scenario]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // 无 IO 时直接开播，避免演示永远卡住 / Fallback: start without observer
      inViewRef.current = true;
      stateRef.current.playing = true;
      setRunId((n) => n + 1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const visible =
          entry.isIntersecting && entry.intersectionRatio >= 0.55;
        inViewRef.current = visible;
        if (!visible) return;
        if (stateRef.current.playing) return;
        if (stateRef.current.mode === 'complete') return;
        // 滑到第二屏后再开始打字机与后续演示 / Start demo after scrolling into view
        stateRef.current.playing = true;
        setRunId((n) => n + 1);
      },
      {threshold: [0, 0.35, 0.55, 0.7], rootMargin: '0px 0px -12% 0px'},
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stopPlayback = useCallback(() => {
    stateRef.current.playing = false;
    setShowTyping(false);
    if (stateRef.current.mode === 'running') showToast(chrome.pauseDemo);
  }, [chrome.pauseDemo, showToast]);

  const togglePhase = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
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
    const { events, endAt } = timelineRef.current;
    const current = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];

    const applyEvent = (ev: TimelineEvent) => {
      if (ev.kind === 'start') {
        stateRef.current.mode = 'running';
        setMode('running');
        setHeaderTitle(current.chatTitle);
        setShowTyping(true);
        setPhaseCount(0);
        setPhaseDone([]);
        setShowFinish(false);
        setPromptText('');
        setExpanded(new Set());
        setArtifactOpen(false);
        setFeed([
          { kind: 'user', text: current.prompt, mention: true },
          { kind: 'assistant', text: current.reply },
        ]);
      } else if (ev.kind === 'phase') {
        setPhaseDone((prev) => {
          const next = [...prev];
          for (let i = 0; i < ev.index; i += 1) next[i] = true;
          return next;
        });
        setPhaseCount(ev.index + 1);
        setFeed((prev) => [...prev, { kind: 'phase', index: ev.index }]);
      } else if (ev.kind === 'midUser') {
        setFeed((prev) => [...prev, { kind: 'user', text: ev.text }]);
        setShowTyping(true);
      } else if (ev.kind === 'finish') {
        setPhaseDone(current.phases.map(() => true));
        setShowTyping(false);
        setShowFinish(true);
        stateRef.current.mode = 'complete';
        setMode('complete');
        stateRef.current.playing = false;
      }
    };

    const completeImmediately = () => {
      while (stateRef.current.eventIdx + 1 < events.length) {
        stateRef.current.eventIdx += 1;
        applyEvent(events[stateRef.current.eventIdx]);
      }
      stateRef.current.elapsed = endAt;
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

      s.elapsed = Math.min(endAt, s.elapsed + delta);

      if (s.mode === 'welcome') {
        const progress = Math.max(
          0,
          Math.min(1, (s.elapsed - TYPE_START) / TYPE_DURATION),
        );
        const chars = Array.from(current.prompt);
        setPromptText(chars.slice(0, Math.floor(chars.length * progress)).join(''));
      }

      while (
        s.eventIdx + 1 < events.length &&
        s.elapsed >= events[s.eventIdx + 1].at
      ) {
        s.eventIdx += 1;
        applyEvent(events[s.eventIdx]);
      }

      if (s.playing && s.elapsed < endAt) {
        frameId = window.requestAnimationFrame(tick);
      }
      // 播完停在结果页，不自动重播；切换「最近」场景或点重播才再动
      // Stay on final result; only scenario switch / replay restarts
    };

    previous = performance.now();
    frameId = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [runId, scenarioId, scenarios]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || mode === 'welcome') return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [mode, phaseCount, showFinish, showTyping, feed]);

  /**
   * 对话区内滚到顶/底后，把滚轮交给页面，避免困在内部滚动条。
   * Forward wheel to the page at scroll edges so users aren't trapped.
   */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const canScroll = maxScroll > 1;
      const scrollingUp = event.deltaY < 0;
      const scrollingDown = event.deltaY > 0;
      const atTop = scrollTop <= 1;
      const atBottom = scrollTop >= maxScroll - 1;

      if (!canScroll || (atTop && scrollingUp) || (atBottom && scrollingDown)) {
        event.preventDefault();
        window.scrollBy(0, event.deltaY);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleSend = () => {
    flashPress('send');
    const s = stateRef.current;
    if (s.mode === 'welcome') {
      s.elapsed = START_AT;
      s.playing = true;
      showToast(chrome.sendStartedToast);
      return;
    }
    if (s.mode === 'running') {
      stopPlayback();
      return;
    }
    resetPlay();
  };

  const composerPlaceholder =
    mode === 'running'
      ? chrome.placeholderRunning
      : chrome.placeholderIdle;

  const shellClass = [
    'stx-mimo',
    mode !== 'welcome' ? 'is-active' : '',
    sidebarCollapsed ? 'is-sidebar-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      ref={sectionRef}
      id="stx-agent-section"
      className={`stx-agent-demo${embedded ? ' stx-agent-demo--embedded' : ''}`}
      aria-label={chrome.ariaDemo}
    >
      {!embedded ? (
        <div className="stx-agent-demo__intro">
          <p className="stx-agent-demo__eyebrow">STX CLI + Skill · {locale === 'en' ? 'Interactive example' : '交互演示'}</p>
          <p className="stx-agent-demo__sub">
            {locale === 'en'
              ? 'The scenarios use example data and real STX CLI commands; no live environment is connected.'
              : '场景使用示例数据和真实的 STX CLI 命令，不连接实际环境。'}{' '}
            <Link to="/docs/architecture/cli" className="stx-agent-demo__guide-link">
              {locale === 'en' ? 'How the CLI works\u00A0↗' : '查看 CLI 用法\u00A0↗'}
            </Link>
          </p>
        </div>
      ) : null}
      <div className={shellClass}>
        <aside className="stx-mimo__sidebar" aria-label={chrome.ariaNav}>
          <div className="stx-mimo__toolbar">
            <button
              type="button"
              className={`stx-mimo__icon-btn${pressedId === 'panel' ? ' is-pressed' : ''}`}
              title={sidebarCollapsed ? chrome.expandSidebar : chrome.collapseSidebar}
              aria-label={sidebarCollapsed ? chrome.expandSidebar : chrome.collapseSidebar}
              onClick={() => {
                flashPress('panel');
                setSidebarCollapsed((v) => !v);
              }}
            >
              <Icon name="panel" />
            </button>
            <button
              type="button"
              className={`stx-mimo__icon-btn${pressedId === 'search' ? ' is-pressed' : ''}`}
              title="Search"
              aria-label="Search"
              onClick={() => {
                flashPress('search');
                showToast(chrome.searchToast);
              }}
            >
              <Icon name="search" />
            </button>
            <button
              type="button"
              className={`stx-mimo__icon-btn${pressedId === 'bell' ? ' is-pressed' : ''}`}
              title={chrome.notifyTitle}
              aria-label={chrome.notifyTitle}
              onClick={() => {
                flashPress('bell');
                showToast(chrome.notifyToast);
              }}
            >
              <Icon name="bell" />
            </button>
          </div>

          <nav className="stx-mimo__nav">
            <button
              type="button"
              className="stx-mimo__nav-item"
              onClick={() => {
                resetPlay();
                showToast(chrome.newTaskToast);
              }}
            >
              <Icon name="plus" />
              {chrome.newTask}
            </button>
            <button
              type="button"
              className="stx-mimo__nav-item"
              onClick={() => showToast(chrome.pluginsToast)}
            >
              <Icon name="plugin" />
              {chrome.plugins}
            </button>
            <button
              type="button"
              className="stx-mimo__nav-item"
              onClick={() => {
                if (showFinish) {
                  setArtifactOpen(true);
                  showToast(chrome.openArtifactToast);
                } else {
                  showToast(chrome.artifactPendingToast);
                }
              }}
            >
              <Icon name="box" />
              {chrome.artifacts}
              {showFinish ? <em className="stx-mimo__badge">1</em> : null}
            </button>
          </nav>

          <div className="stx-mimo__side-scroll">
            <div className="stx-mimo__section-label">
              <Icon name="folder" />
              {chrome.projects}
            </div>
            <button
              type="button"
              className="stx-mimo__project"
              onClick={() => showToast(scenario.projectName)}
            >
              <Icon name="folder" />
              {scenario.projectName}
            </button>

            <div className="stx-mimo__section-label">{chrome.recent}</div>
            {scenarios.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`stx-mimo__recent${scenarioId === item.id ? ' is-selected' : ''}`}
                onClick={() => {
                  selectScenario(item.id);
                  showToast(chrome.scenarioToast(item.label));
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="stx-mimo__user"
            aria-label="STX"
            onClick={() => showToast('STX')}
          >
            <StxBrandMark className="stx-mimo__user-logo" height={28} />
          </button>
        </aside>

        <div className="stx-mimo__main">
          <header className="stx-mimo__header">
            <button
              type="button"
              className="stx-mimo__icon-btn stx-mimo__header-panel"
              title={sidebarCollapsed ? chrome.expandSidebar : chrome.collapseSidebar}
              aria-label={sidebarCollapsed ? chrome.expandSidebar : chrome.collapseSidebar}
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              <Icon name="panel" />
            </button>
            <span
              className="stx-mimo__header-title"
              style={{ opacity: headerTitle ? 1 : 0 }}
            >
              {headerTitle || scenario.chatTitle}
            </span>
            <div className="stx-mimo__header-actions">
              {mode === 'running' ? (
                <span className="stx-mimo__status">
                  <i />
                  {chrome.running}
                </span>
              ) : null}
              {mode === 'running' ? (
                <button
                  type="button"
                  className="stx-mimo__icon-btn"
                  onClick={stopPlayback}
                  title={chrome.pause}
                  aria-label={chrome.pauseDemo}
                >
                  <Icon name="stop" />
                </button>
              ) : null}
              <button
                type="button"
                className={`stx-mimo__icon-btn${pressedId === 'replay' ? ' is-pressed' : ''}`}
                onClick={() => {
                  flashPress('replay');
                  resetPlay();
                }}
                title={chrome.replay}
                aria-label={chrome.replay}
              >
                <Icon name="replay" />
              </button>
            </div>
          </header>

          <div className="stx-mimo__scenario-strip" aria-label={chrome.recent}>
            {scenarios.map((item) => (
              <button
                key={`m-${item.id}`}
                type="button"
                className={`stx-mimo__scenario-chip${scenarioId === item.id ? ' is-selected' : ''}`}
                onClick={() => {
                  selectScenario(item.id);
                  showToast(chrome.scenarioToast(item.label));
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div ref={scrollerRef} className="stx-mimo__viewport">
            {mode === 'welcome' ? (
              <div className="stx-mimo__welcome">
                <div className="stx-mimo__welcome-mark" aria-hidden>
                  <StxBrandMark height={28} />
                </div>
                <h3>{scenario.welcomeTitle}</h3>
                <p>{scenario.welcomeSub}</p>
              </div>
            ) : (
              <div className="stx-mimo__conversation" role="log" aria-live="polite">
                {feed.map((item, i) => {
                  if (item.kind === 'user') {
                    return (
                      <div key={`u-${i}`} className="stx-mimo__user-msg stx-mimo__reveal">
                        {item.mention ? (
                          <StxMentionChip className="stx-mention--inline" />
                        ) : null}
                        {item.text}
                      </div>
                    );
                  }
                  if (item.kind === 'assistant') {
                    return (
                      <div key={`a-${i}`} className="stx-mimo__assistant stx-mimo__reveal">
                        <p className="stx-mimo__assistant-text">{item.text}</p>
                      </div>
                    );
                  }

                  const phase = scenario.phases[item.index];
                  if (!phase) return null;
                  const done = Boolean(phaseDone[item.index]);
                  const open = expanded.has(item.index);
                  return (
                    <section
                      key={`p-${scenario.id}-${item.index}`}
                      className="stx-mimo__phase stx-mimo__reveal"
                    >
                      <button
                        type="button"
                        className="stx-mimo__phase-toggle"
                        aria-expanded={open}
                        onClick={() => togglePhase(item.index)}
                      >
                        <span className="stx-mimo__phase-icon">
                          <Icon name={phase.icon} />
                        </span>
                        <span className="stx-mimo__phase-title">
                          <strong>{phase.title}</strong>
                          <small>{phase.tool}</small>
                        </span>
                        <span className="stx-mimo__phase-state">
                          {done ? <Icon name="check" /> : chrome.inProgress}
                        </span>
                        <Icon name="chevron" className="stx-mimo__phase-arrow" />
                      </button>
                      {open ? (
                        <div className="stx-mimo__phase-detail">
                          <p style={{ whiteSpace: 'pre-wrap' }}>{phase.detail}</p>
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

                {showTyping ? (
                  <div className="stx-mimo__typing" aria-label={chrome.generating}>
                    <i />
                    <i />
                    <i />
                  </div>
                ) : null}

                {showFinish ? (
                  <div className="stx-mimo__finish stx-mimo__reveal">
                    <h4>{scenario.completedTitle}</h4>
                    <p>{scenario.completedSummary}</p>
                    <ol className="stx-mimo__findings">
                      {scenario.findings.map((f) => (
                        <li key={f.number}>
                          <span>{f.number}</span>
                          <div>
                            <strong>{f.title}</strong>
                            <p>{f.quote}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      className={`stx-mimo__artifact${artifactOpen ? ' is-open' : ''}`}
                      onClick={() => {
                        setArtifactOpen((v) => !v);
                        showToast(
                          artifactOpen
                            ? chrome.collapseArtifact
                            : chrome.expandArtifact,
                        );
                      }}
                    >
                      <span className="stx-mimo__artifact-cover" aria-hidden>
                        <StxBrandMark className="stx-mimo__artifact-logo" height={22} />
                      </span>
                      <span className="stx-mimo__artifact-copy">
                        <strong>{scenario.artifactTitle}</strong>
                        <small>{scenario.artifactMeta}</small>
                        <em>
                          <Icon name="check" />
                          {chrome.generated}
                        </em>
                      </span>
                    </button>
                    {artifactOpen ? (
                      <pre className="stx-mimo__artifact-body">{scenario.artifactBody}</pre>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="stx-mimo__composer-wrap">
            <div className="stx-mimo__composer">
              {/* 提问态始终展示 stx 胶囊（不依赖打字进度，避免第一屏 logo 缺失） */}
              <div
                className="stx-mimo__composer-editor"
                aria-label={chrome.ariaComposer}
                role="textbox"
                aria-readonly="true"
              >
                {mode === 'welcome' ? (
                  <>
                    <StxMentionChip className="stx-mention--composer" />
                    {promptText ? (
                      <span className="stx-mimo__composer-text">{promptText}</span>
                    ) : (
                      <span className="stx-mimo__composer-placeholder">
                        {composerPlaceholder}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="stx-mimo__composer-placeholder">
                    {composerPlaceholder}
                  </span>
                )}
              </div>
              <div className="stx-mimo__composer-bar">
                <div className="stx-mimo__composer-left">
                  <button
                    type="button"
                    className="stx-mimo__chip"
                    title={chrome.addAttachment}
                    aria-label={chrome.addAttachment}
                    onClick={() => showToast(chrome.attachmentToast)}
                  >
                    <Icon name="plus" />
                  </button>
                  <button
                    type="button"
                    className="stx-mimo__chip stx-mimo__chip--label"
                    onClick={() => showToast(chrome.permissionToast)}
                  >
                    {chrome.defaultPermission}
                  </button>
                </div>
                <div className="stx-mimo__composer-right">
                  <button
                    type="button"
                    className={`stx-mimo__send${
                      promptText || mode !== 'welcome' ? ' is-on' : ''
                    }${pressedId === 'send' ? ' is-pressed' : ''}`}
                    aria-label={mode === 'running' ? chrome.pause : chrome.send}
                    onClick={handleSend}
                  >
                    <Icon name={mode === 'running' ? 'stop' : 'send'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast ? (
          <div className="stx-mimo__toast" role="status">
            {toast}
          </div>
        ) : null}
      </div>
    </section>
  );
}
