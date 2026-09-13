import React, { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import Link from '@docusaurus/Link';

/**
 * 指针跟随光晕（保留登录页交互手感，服务于一体舞台）。
 * Pointer-follow glow kept from login, tuned for the unified stage.
 */
function useInteractivePanel(panelRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let raf = 0;
    const current = { x: 50, y: 50, nx: 0, ny: 0 };
    const target = { x: 50, y: 50, nx: 0, ny: 0 };

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const render = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      current.nx += (target.nx - current.nx) * 0.08;
      current.ny += (target.ny - current.ny) * 0.08;

      panel.style.setProperty('--mouse-x', `${current.x}%`);
      panel.style.setProperty('--mouse-y', `${current.y}%`);
      panel.style.setProperty('--mouse-x-norm', String(current.nx));
      panel.style.setProperty('--mouse-y-norm', String(current.ny));

      raf = window.requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      const rect = panel.getBoundingClientRect();
      const xPct = ((event.clientX - rect.left) / rect.width) * 100;
      const yPct = ((event.clientY - rect.top) / rect.height) * 100;
      target.x = clamp(xPct, 0, 100);
      target.y = clamp(yPct, 0, 100);
      target.nx = clamp(xPct / 100 - 0.5, -0.18, 0.18);
      target.ny = clamp(yPct / 100 - 0.5, -0.18, 0.18);
    };

    const onLeave = () => {
      target.x = 50;
      target.y = 50;
      target.nx = 0;
      target.ny = 0;
    };

    raf = window.requestAnimationFrame(render);
    panel.addEventListener('pointermove', onMove, { passive: true });
    panel.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      panel.removeEventListener('pointermove', onMove);
      panel.removeEventListener('pointerleave', onLeave);
    };
  }, [panelRef]);
}

function useTypewriter(
  words: string[],
  options: {
    typingSpeed?: number;
    deleteSpeed?: number;
    hold?: number;
    nextHold?: number;
  } = {},
) {
  const {
    typingSpeed = 110,
    deleteSpeed = 56,
    hold = 1000,
    nextHold = 180,
  } = options;
  const [wordIndex, setWordIndex] = useState(0);
  const [display, setDisplay] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(words[0] ?? '');
      return;
    }

    const currentWord = words[wordIndex % words.length];
    let delay = deleting ? deleteSpeed : typingSpeed;
    if (!deleting && display === currentWord) delay = hold;
    if (deleting && display === '') delay = nextHold;

    const timer = window.setTimeout(() => {
      if (!deleting) {
        if (display.length < currentWord.length) {
          setDisplay(currentWord.slice(0, display.length + 1));
        } else {
          setDeleting(true);
        }
      } else if (display.length > 0) {
        setDisplay(currentWord.slice(0, display.length - 1));
      } else {
        setDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    deleteSpeed,
    deleting,
    display,
    hold,
    nextHold,
    typingSpeed,
    wordIndex,
    words,
  ]);

  return display;
}

function Icon({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <svg
      className="stx-pill-icon"
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <title>{label}</title>
      {children}
    </svg>
  );
}

function PackageIcon() {
  return (
    <Icon label="install">
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </Icon>
  );
}

function UpgradeIcon() {
  return (
    <Icon label="upgrade">
      <circle cx="12" cy="12" r="10" />
      <path d="m16 12-4-4-4 4" />
      <path d="M12 16V8" />
    </Icon>
  );
}

function MarketIcon() {
  return (
    <Icon label="marketplace">
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </Icon>
  );
}

function AgentIcon() {
  return (
    <Icon label="agent">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </Icon>
  );
}

function CheckpointIcon() {
  return (
    <Icon label="checkpoint">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </Icon>
  );
}

function DebugIcon() {
  return (
    <Icon label="debug">
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 11.3 3.8 14.4 4 17" />
      <path d="M17.47 9c1.93 2.3 2.73 5.4 2.53 8" />
    </Icon>
  );
}

const COPY = {
  eyebrow: 'Apache SeaTunnel 一站式运维',
  headline: '让 SeaTunnel 运维不再黑箱',
  subtitle:
    '配置、升级、诊断、恢复、调试同一入口；一键安装与插件治理，Checkpoint 可视化，原生 AI Agent（CLI + Skill）。',
  chipsLabel: '产品能力',
  capabilityPrefix: '此刻可见 ·',
  chips: [
    { key: 'install', label: '一键安装', Icon: PackageIcon },
    { key: 'upgrade', label: '一键升级', Icon: UpgradeIcon },
    { key: 'market', label: '插件市场', Icon: MarketIcon },
    { key: 'agent', label: 'AI Agent', Icon: AgentIcon },
    { key: 'checkpoint', label: 'Checkpoint 可视化', Icon: CheckpointIcon },
    { key: 'debug', label: '作业在线调试', Icon: DebugIcon },
  ],
  capabilities: [
    '集群感知与节点健康',
    '配置 Diff 与版本回滚',
    '任务一键恢复',
    'Connector 一键下载',
    'Checkpoint 可视化',
    'HOCON DAG 解析',
    'AI Agent 智能运维入口',
  ],
  footer: ['自动化部署', '任务提交', '巡检告警', '插件市场', 'AI Agent CLI'],
  installCmd: 'curl -fsSL https://stx.seatunnelx.com/install.sh | bash',
} as const;

/**
 * 文档站 Hero 左栏：登录页能力文案的文档站演绎（无重复品牌标）。
 * Docs hero left: login capability copy, adapted — no redundant brand mark.
 */
export function HeroBrandPanel(): React.JSX.Element {
  const panelRef = useRef<HTMLElement>(null);
  useInteractivePanel(panelRef);

  const capabilityWords = useMemo(() => [...COPY.capabilities], []);
  const typed = useTypewriter(capabilityWords);

  const [copied, setCopied] = useState(false);
  const handleCopyCommand = () => {
    void navigator.clipboard.writeText(COPY.installCmd);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside ref={panelRef} className="stx-brand-panel">
      <div className="stx-bw-spotlight" />
      <div className="stx-stage-scan" aria-hidden="true">
        <div className="stx-stage-scan-line" />
      </div>

      <div className="stx-brand-content">
        <div className="stx-brand-main">
          <p className="stx-brand-eyebrow">{COPY.eyebrow}</p>
          <h1 className="stx-brand-title">{COPY.headline}</h1>
          <p className="stx-brand-subtitle">{COPY.subtitle}</p>

          <div className="stx-pill-row" aria-label={COPY.chipsLabel}>
            {COPY.chips.map(({ key, label, Icon: ChipIcon }) => (
              <span key={key} className="stx-pill">
                <ChipIcon />
                {label}
              </span>
            ))}
          </div>

          <div className="stx-type-row" aria-live="polite">
            <span className="stx-type-label">{COPY.capabilityPrefix}</span>
            <span className="stx-type-text">{typed || '\u00A0'}</span>
            <span className="stx-type-caret" aria-hidden="true" />
          </div>

          <div className="stx-brand-actions">
            <Link className="button--glacier" to="/docs/get-started/quick-start">
              5 分钟快速部署
            </Link>
            <Link
              className="button--outline-glacier"
              href="https://github.com/LeonYoah/SeaTunnelX"
            >
              Star on GitHub
            </Link>
          </div>

          <div className="stx-install-command-bar stx-brand-install">
            <span className="stx-cmd-prefix">$</span>
            <code className="stx-cmd-code">{COPY.installCmd}</code>
            <button
              type="button"
              onClick={handleCopyCommand}
              className="stx-cmd-copy-btn"
              title="复制到剪贴板"
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>

        <div className="stx-brand-footer">
          {COPY.footer.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </aside>
  );
}
