import React, { useState, useEffect, useRef } from 'react';

/**
 * 终端标签页配置项定义
 * Terminal tab configuration item definitions
 */
interface TerminalTab {
  id: string;
  label: string;
  command: string;
  output: React.ReactNode;
}

/**
 * 终端预置演示命令与对应色彩输出
 * Terminal preset demo commands and colored outputs
 */
const TERMINAL_TABS: TerminalTab[] = [
  {
    id: 'status',
    label: '集群状态 / cluster status',
    command: 'stx cluster status --id zeta-prod',
    output: (
      <div style={{ lineHeight: '1.6', fontSize: '0.82rem' }}>
        <div style={{ color: '#8ecad6', fontWeight: 600 }}>[Cluster: zeta-prod] HEALTHY (HA Active)</div>
        <div style={{ color: '#94a3b8' }}>───────────────────────────────────────────────────────────</div>
        <div>
          <span style={{ color: '#4ade80' }}>●</span> Master Node: <span style={{ color: '#e2e8f0' }}>192.168.10.11:5801</span>{' '}
          <span style={{ color: '#8ecad6' }}>(Leader, Uptime: 28d 14h)</span>
        </div>
        <div>
          <span style={{ color: '#4ade80' }}>●</span> Worker Nodes:{' '}
          <span style={{ color: '#4ade80' }}>3 / 3 Online</span>
        </div>
        <div style={{ paddingLeft: '1.2rem', color: '#94a3b8' }}>
          <div>├─ worker-01 (192.168.10.12) <span style={{ color: '#4ade80' }}>[Healthy]</span> Slots: 8/16</div>
          <div>├─ worker-02 (192.168.10.13) <span style={{ color: '#4ade80' }}>[Healthy]</span> Slots: 12/16</div>
          <div>└─ worker-03 (192.168.10.14) <span style={{ color: '#4ade80' }}>[Healthy]</span> Slots: 4/16</div>
        </div>
        <div style={{ marginTop: '6px' }}>
          <span style={{ color: '#facc15' }}>⚡</span> Active Jobs: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>12 Running</span>{' '}
          | Total TPS: <span style={{ color: '#8ecad6', fontWeight: 600 }}>142,800 rec/sec</span>
        </div>
        <div>
          <span style={{ color: '#38bdf8' }}>📊</span> Cluster Memory: <span style={{ color: '#e2e8f0' }}>28.4 GB / 48.0 GB (59.1%)</span>
        </div>
      </div>
    ),
  },
  {
    id: 'probe',
    label: '探针巡检 / agent probe',
    command: 'stx agent probe --host 192.168.10.12',
    output: (
      <div style={{ lineHeight: '1.6', fontSize: '0.82rem' }}>
        <div style={{ color: '#8ecad6', fontWeight: 600 }}>[STX Agent Probe: 192.168.10.12]</div>
        <div style={{ color: '#94a3b8' }}>───────────────────────────────────────────────────────────</div>
        <div><span style={{ color: '#4ade80' }}>✔</span> gRPC Bi-directional Stream: <span style={{ color: '#4ade80' }}>ESTABLISHED</span></div>
        <div><span style={{ color: '#4ade80' }}>✔</span> Heartbeat Round-trip: <span style={{ color: '#8ecad6' }}>1.2 ms</span> (Every 5s)</div>
        <div><span style={{ color: '#4ade80' }}>✔</span> Process Guard: <span style={{ color: '#e2e8f0' }}>SeaTunnelServer (PID: 38291, Active)</span></div>
        <div><span style={{ color: '#4ade80' }}>✔</span> Host Metrics: CPU 14.2% | Mem 38.6% | Disk I/O Normal</div>
        <div style={{ color: '#94a3b8', marginTop: '4px' }}>Last Check: 2026-09-13 13:10:00 UTC (0 packet loss)</div>
      </div>
    ),
  },
  {
    id: 'config',
    label: '配置对比 / config diff',
    command: 'stx config diff --version-a v1.2 --version-b v1.3',
    output: (
      <div style={{ lineHeight: '1.6', fontSize: '0.82rem', fontFamily: 'monospace' }}>
        <div style={{ color: '#8ecad6', fontWeight: 600 }}>--- seatunnel.yaml (v1.2)</div>
        <div style={{ color: '#8ecad6', fontWeight: 600 }}>+++ seatunnel.yaml (v1.3 - Pending Deploy)</div>
        <div style={{ color: '#94a3b8' }}>@@ -12,4 +12,6 @@</div>
        <div style={{ color: '#94a3b8' }}>  hazelcast:</div>
        <div style={{ color: '#f87171' }}>-   cluster-name: seatunnel-default</div>
        <div style={{ color: '#4ade80' }}>+   cluster-name: stx-zeta-prod</div>
        <div style={{ color: '#4ade80' }}>+   engine:</div>
        <div style={{ color: '#4ade80' }}>+     backup-count: 2</div>
        <div style={{ color: '#e2e8f0' }}>      slot-num: 16</div>
      </div>
    ),
  },
];

/**
 * 终端交互模拟器组件
 * Interactive terminal simulator component
 */
export function LiveTerminal(): React.JSX.Element {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTab = TERMINAL_TABS[activeTabIdx];

  // 模拟打字机动效
  // Simulate typewriter typing effect
  useEffect(() => {
    setIsTyping(true);
    setShowOutput(false);
    setTypedCommand('');

    let charIndex = 0;
    const fullText = currentTab.command;

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    typingTimerRef.current = setInterval(() => {
      if (charIndex <= fullText.length) {
        setTypedCommand(fullText.slice(0, charIndex));
        charIndex++;
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
        setTimeout(() => setShowOutput(true), 250);
      }
    }, 35);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [activeTabIdx]);

  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(142, 202, 214, 0.35)',
        backgroundColor: '#070d15',
        color: '#f8fafc',
        boxShadow: '0 16px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(142, 202, 214, 0.2)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 终端顶部标题栏与窗口控制按钮 */}
      {/* Terminal window top control bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: '#0c1420',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#eab308' }} />
          <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
            stx-ctl (zsh)
          </span>
        </div>

        {/* 标签页切换 */}
        {/* Terminal tab switcher */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {TERMINAL_TABS.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabIdx(idx)}
              style={{
                background: activeTabIdx === idx ? 'rgba(142, 202, 214, 0.2)' : 'transparent',
                border: activeTabIdx === idx ? '1px solid #8ecad6' : '1px solid transparent',
                color: activeTabIdx === idx ? '#8ecad6' : '#64748b',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label.split('/')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 终端正文命令行区域 */}
      {/* Terminal command execution view */}
      <div style={{ padding: '16px 18px', minHeight: '230px', fontFamily: 'monospace', position: 'relative' }}>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#38bdf8', marginRight: '8px', fontWeight: 700 }}>➜</span>
          <span style={{ color: '#8ecad6', marginRight: '8px', fontWeight: 600 }}>~</span>
          <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.88rem' }}>{typedCommand}</span>
          {isTyping && <span className="stx-cursor" />}
        </div>

        {/* 输出结果 */}
        {/* Command output display */}
        {showOutput && (
          <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
            {currentTab.output}
          </div>
        )}
      </div>
    </div>
  );
}
