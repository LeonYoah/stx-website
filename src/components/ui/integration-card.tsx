"use client";

import React, { useState, useId } from "react";
import useBaseUrl from '@docusaurus/useBaseUrl';
import { motion } from "motion/react";
import seatunnelLogo from '@site/static/img/seatunnel-logo.png';
import flinkLogo from '@site/static/img/flink-squirrel.png';
import stxMarkLogo from '@site/static/img/stx-mark.png';
import { cn } from "../../lib/utils";
import { useHomeLocale, type HomeLocale } from "../home/useHomeLocale";
import { Card, CardContent } from "./card";

/**
 * 拓扑架构节点类型定义
 * Topology architecture node type definition
 */
interface ArchNode {
  id: string;
  name: string;
  sub: string;
  category: "engine" | "infra" | "agent";
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  path: string;
  delay: number;
  /** 当前版本尚未适配 / Not adapted in the current release */
  comingSoon?: boolean;
}

/**
 * Apache SeaTunnel 官方海浪波涌与水珠气泡图标（Zeta 核心流批一体引擎）
 * Apache SeaTunnel official ocean wave & bubble splash logo (Zeta native engine)
 */
const ZetaLogo = ({ className }: { className?: string }) => {
  return (
    <img
      src={seatunnelLogo}
      alt="Apache SeaTunnel Zeta Logo"
      className={cn("object-contain", className)}
    />
  );
};

/**
 * Apache Spark 官方星芒火花矢量图标
 * Apache Spark official flame sparkburst SVG logo
 */
const SparkLogo = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="#e25a1c"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10.812 0c-.425.013-.845.215-1.196.605a3.593 3.593 0 00-.493.722c-.355.667-.425 1.415-.556 2.143a551.9 551.9 0 00-.726 4.087c-.027.16-.096.227-.244.273C5.83 8.386 4.06 8.94 2.3 9.514c-.387.125-.773.289-1.114.506-1.042.665-1.196 1.753-.415 2.71.346.422.79.715 1.284.936 1.1.49 2.202.976 3.3 1.47.019.01.036.013.053.019h-.004l1.306.535c0 .023.002.045 0 .073-.2 2.03-.39 4.063-.58 6.095-.04.419-.012.831.134 1.23.317.87 1.065 1.148 1.881.701.372-.204.666-.497.937-.818 1.372-1.623 2.746-3.244 4.113-4.872.111-.133.205-.15.363-.098.349.117.697.231 1.045.347h.001c.02.012.045.02.073.03l.142.042c1.248.416 2.68.775 3.929 1.19.4.132.622.164 1.045.098.311-.048.592-.062.828-.236.602-.33.995-.957.988-1.682-.005-.427-.154-.813-.35-1.186-.82-1.556-1.637-3.113-2.461-4.666-.078-.148-.076-.243.037-.375 1.381-1.615 2.756-3.236 4.133-4.855.272-.32.513-.658.653-1.058.308-.878-.09-1.57-1-1.741a2.783 2.783 0 00-1.235.069c-1.974.521-3.947 1.041-5.918 1.57-.175.047-.26.015-.355-.144a353.08 353.08 0 00-2.421-4.018 4.61 4.61 0 00-.652-.849c-.371-.37-.802-.549-1.227-.536zm.172 3.703a.592.592 0 01.189.211c.87 1.446 1.742 2.89 2.609 4.338.07.118.135.16.277.121 1.525-.41 3.052-.813 4.579-1.217.367-.098.735-.193 1.103-.289a.399.399 0 01-.1.2c-1.259 1.48-2.516 2.962-3.779 4.438-.11.13-.12.22-.04.37.937 1.803 1.768 3.309 2.498 4.76l-3.696-1.019c-.538-.18-1.077-.358-1.615-.539-.163-.055-.25-.03-.36.1-1.248 1.488-2.504 2.97-3.759 4.454a.398.398 0 01-.18.132c.035-.378.068-.757.104-1.136.149-1.572.297-3.144.451-4.716-.03-.318.117-.405-.322-.545-1.493-.593-3.346-1.321-4.816-1.905a.595.595 0 01.24-.134c1.797-.57 3.595-1.14 5.394-1.705.127-.04.199-.092.211-.233.013-.148.05-.294.076-.441.241-1.363.483-2.726.726-4.088.068-.386.14-.771.21-1.157z" />
  </svg>
);

/**
 * Apache Flink 官方正版彩尾松鼠图标（抱橡果与流式尾焰）
 * Apache Flink official squirrel mascot holding acorn with rainbow flame tail logo
 */
const FlinkLogo = ({ className }: { className?: string }) => {
  return (
    <img
      src={flinkLogo}
      alt="Apache Flink Squirrel Mascot Logo"
      className={cn("object-contain", className)}
    />
  );
};

/**
 * 虚拟机 / 物理机部署基础设施图标
 * Virtual Machine / Bare Metal chassis SVG icon
 */
const VMLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="8" rx="2" stroke="#64748b" />
    <rect x="2" y="14" width="20" height="8" rx="2" stroke="#64748b" />
    <line x1="6" y1="6" x2="6.01" y2="6" stroke="#10b981" strokeWidth="3" />
    <line x1="6" y1="18" x2="6.01" y2="18" stroke="#10b981" strokeWidth="3" />
    <line x1="10" y1="6" x2="14" y2="6" stroke="#94a3b8" />
    <line x1="10" y1="18" x2="14" y2="18" stroke="#94a3b8" />
  </svg>
);

/**
 * Docker 官方容器鲸鱼矢量图标
 * Docker official Moby whale & containers SVG logo
 */
const DockerLogo = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="#2496ed"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z" />
  </svg>
);

/**
 * Kubernetes 官方 CNCF 7 辐舵轮矢量图标
 * Kubernetes official CNCF 7-spoke helm wheel SVG logo
 */
const K8sLogo = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="#326ce5"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10.204 14.35l.007.01-.999 2.413a5.171 5.171 0 0 1-2.075-2.597l2.578-.437.004.005a.44.44 0 0 1 .484.606zm-.833-2.129a.44.44 0 0 0 .173-.756l.002-.011L7.585 9.7a5.143 5.143 0 0 0-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 0 0 .699-.337l.01-.005.15-2.62a5.144 5.144 0 0 0-3.01 1.442l2.147 1.523.004-.002zm.76 2.75l.723.349.722-.347.18-.78-.5-.623h-.804l-.5.623.179.779zm1.5-3.095a.44.44 0 0 0 .7.336l.008.003 2.134-1.513a5.188 5.188 0 0 0-2.992-1.442l.148 2.615.002.001zm10.876 5.97l-5.773 7.181a1.6 1.6 0 0 1-1.248.594l-9.261.003a1.6 1.6 0 0 1-1.247-.596l-5.776-7.18a1.583 1.583 0 0 1-.307-1.34L2.1 5.573c.108-.47.425-.864.863-1.073L11.305.513a1.606 1.606 0 0 1 1.385 0l8.345 3.985c.438.209.755.604.863 1.073l2.062 8.955c.108.47-.005.963-.308 1.34zm-3.289-2.057c-.042-.01-.103-.026-.145-.034-.174-.033-.315-.025-.479-.038-.35-.037-.638-.067-.895-.148-.105-.04-.18-.165-.216-.216l-.201-.059a6.45 6.45 0 0 0-.105-2.332 6.465 6.465 0 0 0-.936-2.163c.052-.047.15-.133.177-.159.008-.09.001-.183.094-.282.197-.185.444-.338.743-.522.142-.084.273-.137.415-.242.032-.024.076-.062.11-.089.24-.191.295-.52.123-.736-.172-.216-.506-.236-.745-.045-.034.027-.08.062-.111.088-.134.116-.217.23-.33.35-.246.25-.45.458-.673.609-.097.056-.239.037-.303.033l-.19.135a6.545 6.545 0 0 0-4.146-2.003l-.012-.223c-.065-.062-.143-.115-.163-.25-.022-.268.015-.557.057-.905.023-.163.061-.298.068-.475.001-.04-.001-.099-.001-.142 0-.306-.224-.555-.5-.555-.275 0-.499.249-.499.555l.001.014c0 .041-.002.092 0 .128.006.177.044.312.067.475.042.348.078.637.056.906a.545.545 0 0 1-.162.258l-.012.211a6.424 6.424 0 0 0-4.166 2.003 8.373 8.373 0 0 1-.18-.128c-.09.012-.18.04-.297-.029-.223-.15-.427-.358-.673-.608-.113-.12-.195-.234-.329-.349-.03-.026-.077-.062-.111-.088a.594.594 0 0 0-.348-.132.481.481 0 0 0-.398.176c-.172.216-.117.546.123.737l.007.005.104.083c.142.105.272.159.414.242.299.185.546.338.743.522.076.082.09.226.1.288l.16.143a6.462 6.462 0 0 0-1.02 4.506l-.208.06c-.055.072-.133.184-.215.217-.257.081-.546.11-.895.147-.164.014-.305.006-.48.039-.037.007-.09.02-.133.03l-.004.002-.007.002c-.295.071-.484.342-.423.608.061.267.349.429.645.365l.007-.001.01-.003.129-.029c.17-.046.294-.113.448-.172.33-.118.604-.217.87-.256.112-.009.23.069.288.101l.217-.037a6.5 6.5 0 0 0 2.88 3.596l-.09.218c.033.084.069.199.044.282-.097.252-.263.517-.452.813-.091.136-.185.242-.268.399-.02.037-.045.095-.064.134-.128.275-.034.591.213.71.248.12.556-.007.69-.282v-.002c.02-.039.046-.09.062-.127.07-.162.094-.301.144-.458.132-.332.205-.68.387-.897.05-.06.13-.082.215-.105l.113-.205a6.453 6.453 0 0 0 4.609.012l.106.192c.086.028.18.042.256.155.136.232.229.507.342.84.05.156.074.295.145.457.016.037.043.09.062.129.133.276.442.402.69.282.247-.118.341-.435.213-.71-.02-.039-.045-.096-.065-.134-.083-.156-.177-.261-.268-.398-.19-.296-.346-.541-.443-.793-.04-.13.007-.21.038-.294-.018-.022-.059-.144-.083-.202a6.499 6.499 0 0 0 2.88-3.622c.064.01.176.03.213.038.075-.05.144-.114.28-.104.266.039.54.138.87.256.154.06.277.128.448.173.036.01.088.019.13.028l.009.003.007.001c.297.064.584-.098.645-.365.06-.266-.128-.537-.423-.608zM16.4 9.701l-1.95 1.746v.005a.44.44 0 0 0 .173.757l.003.01 2.526.728a5.199 5.199 0 0 0-.108-1.674A5.208 5.208 0 0 0 16.4 9.7zm-4.013 5.325a.437.437 0 0 0-.404-.232.44.44 0 0 0-.372.233h-.002l-1.268 2.292a5.164 5.164 0 0 0 3.326.003l-1.27-2.296h-.01zm1.888-1.293a.44.44 0 0 0-.27.036.44.44 0 0 0-.214.572l-.003.004 1.01 2.438a5.15 5.15 0 0 0 2.081-2.615l-2.6-.44-.004.005z" />
  </svg>
);

/**
 * AI Agent 协同入口图标（神经智能芯片与微光流向）
 * AI Agent collaboration entrance SVG icon (neural smart chip & stream spark)
 */
const AIAgentLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="4"
      stroke="#a855f7"
      strokeWidth="2"
      fill="rgba(168, 85, 247, 0.15)"
    />
    <circle cx="8.5" cy="11.5" r="2" fill="#8ecad6" />
    <circle cx="15.5" cy="11.5" r="2" fill="#a855f7" />
    <path
      d="M8 16s1.5 1.5 4 1.5 4-1.5 4-1.5"
      stroke="#8ecad6"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="1"
      x2="12"
      y2="4"
      stroke="#a855f7"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="1" r="1" fill="#a855f7" />
  </svg>
);

/**
 * 拓扑架构节点配置（画布 600 x 450，中心 STX 精准居中在 300, 175）
 * Topology architecture node definitions (Canvas 600 x 450, Center STX strictly at 300, 175)
 */
const NODE_COPY: Record<HomeLocale, Record<string, { name: string; sub: string }>> = {
  zh: {
    zeta: { name: "Zeta", sub: "自研流批一体" },
    spark: { name: "Spark", sub: "批/微批引擎" },
    flink: { name: "Flink", sub: "流计算引擎" },
    vm: { name: "虚拟机 / 主机", sub: "探针直连纳管" },
    docker: { name: "Docker", sub: "容器化集群" },
    k8s: { name: "Kubernetes", sub: "Operator 编排" },
  },
  en: {
    zeta: { name: "Zeta", sub: "Unified stream & batch" },
    spark: { name: "Spark", sub: "Batch / micro-batch" },
    flink: { name: "Flink", sub: "Stream engine" },
    vm: { name: "VM / Host", sub: "Probe onboarding" },
    docker: { name: "Docker", sub: "Container clusters" },
    k8s: { name: "Kubernetes", sub: "Operator orchestration" },
  },
};

const ARCH_LAYOUT = [
  {
    id: "zeta",
    category: "engine" as const,
    icon: ZetaLogo,
    x: 85,
    y: 58,
    path: "M 112 74 H 195 Q 215 74 215 110 V 155 Q 215 175 235 175 H 262",
    delay: 0.1,
  },
  {
    id: "spark",
    category: "engine" as const,
    icon: SparkLogo,
    x: 85,
    y: 155,
    path: "M 112 171 H 200 V 175 H 262",
    delay: 0.2,
    comingSoon: true,
  },
  {
    id: "flink",
    category: "engine" as const,
    icon: FlinkLogo,
    x: 85,
    y: 252,
    path: "M 112 268 H 195 Q 215 268 215 230 V 195 Q 215 175 235 175 H 262",
    delay: 0.3,
    comingSoon: true,
  },
  {
    id: "vm",
    category: "infra" as const,
    icon: VMLogo,
    x: 515,
    y: 58,
    path: "M 338 175 H 365 Q 385 175 385 140 V 110 Q 385 74 405 74 H 488",
    delay: 0.4,
  },
  {
    id: "docker",
    category: "infra" as const,
    icon: DockerLogo,
    x: 515,
    y: 155,
    path: "M 338 175 H 400 V 171 H 488",
    delay: 0.5,
    comingSoon: true,
  },
  {
    id: "k8s",
    category: "infra" as const,
    icon: K8sLogo,
    x: 515,
    y: 252,
    path: "M 338 175 H 365 Q 385 175 385 210 V 240 Q 385 268 405 268 H 488",
    delay: 0.6,
    comingSoon: true,
  },
];

function getArchNodes(locale: HomeLocale): ArchNode[] {
  const copy = NODE_COPY[locale];
  return ARCH_LAYOUT.map((node) => ({
    ...node,
    name: copy[node.id].name,
    sub: copy[node.id].sub,
  }));
}

/**
 * 带有高光流向光束的拓扑连线组件（纯 CSS drop-shadow 发光，杜绝零宽 SVG 渐变渲染异常）
 * Animated topology connection path with flowing data beam (CSS drop-shadow glow, robust across all browsers)
 */
const AnimatedPath = ({
  d,
  reverse = false,
  color = "#8ecad6",
  strokeWidth = 2,
  pulseWidth = 3,
  dashArray = "40 160",
}: {
  d: string;
  reverse?: boolean;
  color?: string;
  strokeWidth?: number;
  pulseWidth?: number;
  dashArray?: string;
}) => {
  return (
    <g>
      {/* 底层静态导轨连线 */}
      {/* Base static guide trace line */}
      <path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ opacity: 0.38 }}
      />
      {/* 动态流动高光脉冲 */}
      {/* Animated moving gradient pulse beam */}
      <motion.path
        d={d}
        stroke={color}
        strokeWidth={pulseWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={dashArray}
        initial={{ strokeDashoffset: reverse ? -200 : 200 }}
        animate={{ strokeDashoffset: reverse ? 200 : -200 }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
    </g>
  );
};

/**
 * 核心拓扑图展示组件：
 * - STX 控制面严格绝对居中 (300, 175)
 * - 左侧 SeaTunnel 引擎生态 (Zeta / Spark / Flink)
 * - 右侧 SeaTunnel 部署形态 (虚拟机 / Docker / K8s)
 * - 下方 AI Agent 智能体入口 (自下而上注入 STX 控制面，纯净导轨绝不穿顶 STX)
 * 
 * Core topology diagram:
 * - STX strictly centered at (300, 175)
 * - Left: SeaTunnel engines (Zeta / Spark / Flink)
 * - Right: SeaTunnel environments (VM / Docker / K8s)
 * - Bottom: AI Agent entrance (injected into STX from bottom up, clean rail never penetrating STX)
 */
export function Integration() {
  const locale = useHomeLocale();
  const archNodes = getArchNodes(locale);
  const labels =
    locale === "en"
      ? {
          engines: "SeaTunnel engines",
          deploys: "Deployment shapes",
          control: "STX ops platform",
          agent: "AI Agent entry",
          agentSub: "stx CLI · Skill",
          notYet: "Not yet",
        }
      : {
          engines: "SeaTunnel 引擎",
          deploys: "SeaTunnel 部署形态",
          control: "STX 运维平台",
          agent: "AI Agent 入口",
          agentSub: "stx CLI · Skill",
          notYet: "未适配",
        };

  return (
    <div className="relative h-full w-full">
      {/* 顶部左右分类微标签 */}
      {/* Top Left & Right category micro labels */}
      <div className="absolute top-2 left-4 z-30 rounded-full bg-black/[0.04] border border-black/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700 backdrop-blur-sm shadow-sm dark:bg-white/[0.06] dark:border-white/15 dark:text-white/75">
        {labels.engines}
      </div>
      <div className="absolute top-2 right-4 z-30 max-w-[46%] truncate rounded-full bg-black/[0.04] border border-black/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700 backdrop-blur-sm shadow-sm dark:bg-white/[0.06] dark:border-white/15 dark:text-white/75">
        {labels.deploys}
      </div>

      {/* SVG 动画流动拓扑链路 */}
      {/* SVG animated topology flow links */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 600 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 左侧引擎 ➔ 中间 STX 链路 */}
        {/* Left engines -> Center STX links */}
        {archNodes.map((node) => (
          <AnimatedPath
            key={node.id}
            d={node.path}
            reverse={node.category === "engine"}
            color={
              node.comingSoon
                ? "var(--stx-topo-muted, #94a3b8)"
                : node.category === "engine"
                  ? "var(--stx-topo-engine, #8ecad6)"
                  : "var(--stx-topo-infra, #38bdf8)"
            }
            strokeWidth={node.comingSoon ? 1.2 : 1.8}
            pulseWidth={node.comingSoon ? 2 : 3}
          />
        ))}

        {/* 底部 AI Agent 入口 ➔ 中间 STX 垂直高光实体导轨（从 Agent 顶部 341 像素注入至 STX 底部 246 像素，留足安全呼吸位，绝不顶入 STX） */}
        {/* Bottom AI Agent Entrance -> Center STX vertical glow bus rail (from 341px up to 246px, with clean margin, never penetrating STX) */}
        <AnimatedPath
          d="M 300 341 V 246"
          reverse={false}
          color="#a855f7"
          strokeWidth={2.6}
          pulseWidth={3.8}
          dashArray="45 155"
        />
      </svg>

      {/* 中心核心：STX 控制面（严格绝对居中在 (300, 175)，即 50%, 38.89% 视觉重心） */}
      {/* Center Core: STX Control Plane (strictly centered at 300, 175) */}
      <div
        className="absolute flex flex-col items-center justify-center cursor-pointer"
        style={{
          left: "50%",
          top: "38.89%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
        }}
      >
        <div className="relative flex items-center justify-center">
          <img
            src={stxMarkLogo}
            alt="STX Qingluan Brand Mark"
            width={48}
            height={48}
            className="size-10 sm:size-12 object-contain drop-shadow-sm"
          />
          {/* 雷达脉冲扩散光环 */}
          {/* Radar ripple expansion ring */}
          <motion.div
            className="absolute inset-[-6px] rounded-full border border-black/20 pointer-events-none dark:border-white/30"
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        {/* 中心微标签 */}
        {/* Center micro label badge */}
        <div className="mt-1.5 rounded-full bg-background/95 border border-black/15 px-2.5 py-0.5 text-[10.5px] font-mono font-bold text-foreground backdrop-blur-sm whitespace-nowrap shadow-sm flex items-center gap-1.5 dark:border-white/25 dark:bg-black/70 dark:text-white">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {labels.control}
        </div>
      </div>

      {/* 左右两侧节点：顶边锚点 + 固定图标槽，文案永远在图标下方 */}
      {/* Side nodes: top-anchored with fixed icon slot so labels always sit below */}
      {archNodes.map((node) => {
        const Icon = node.icon;
        return (
          <div
            key={node.id}
            className={cn(
              "group absolute flex flex-col items-center gap-1 cursor-pointer",
              node.comingSoon && "opacity-55",
            )}
            style={{
              left: `${(node.x / 600) * 100}%`,
              top: `${(node.y / 450) * 100}%`,
              transform: "translateX(-50%)",
              zIndex: 10,
              width: "7.5rem",
            }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Icon className="h-7 w-7 max-h-7 max-w-7" />
            </div>
            <span className="px-0.5 text-center text-[10.5px] sm:text-[11px] font-mono font-bold leading-tight text-slate-800 transition-colors group-hover:text-foreground whitespace-nowrap dark:text-slate-100">
              {node.name}
            </span>
            {node.comingSoon ? (
              <span className="rounded border border-amber-500/35 bg-amber-500/10 px-1.5 py-px text-[8.5px] font-mono font-bold leading-tight text-amber-700 whitespace-nowrap dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300">
                {labels.notYet}
              </span>
            ) : (
              <span className="px-0.5 text-center text-[9px] font-mono leading-tight text-muted-foreground whitespace-nowrap">
                {node.sub}
              </span>
            )}
          </div>
        );
      })}

      {/* 底部节点：AI Agent 入口（聚焦 CLI + Skill，自下而上连入 STX 控制面） */}
      {/* Bottom Node: AI Agent Entrance (Focus on CLI + Skill, seamlessly connecting into STX Control Plane) */}
      <div
        style={{
          left: "50%",
          top: "84.44%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
        }}
        className="group absolute flex flex-col items-center cursor-pointer"
      >
        <div className="relative flex items-center gap-3 rounded-xl border-2 border-purple-400/80 bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:scale-105 group-hover:border-purple-400 group-hover:shadow-purple-500/30 dark:bg-slate-900/95 dark:border-purple-500/80">
          <AIAgentLogo className="h-7 w-7 text-purple-500 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-mono font-bold text-purple-700 dark:text-purple-300">
                {labels.agent}
              </span>
              <span className="rounded bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[9.5px] font-mono font-bold text-purple-700 dark:text-purple-300 shadow-sm">
                CLI + Skill
              </span>
            </div>
            <span className="text-[9.5px] font-mono text-muted-foreground mt-0.5">
              {labels.agentSub}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 视觉外层容器组件（保持固定 600:450 高宽比与科技点阵网格）
 * Visual outer container component (600:450 aspect ratio and high-tech dot grid)
 */
export function VisualContainer({
  children,
  className,
  fill = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** 嵌入 Hero 时铺满可用高度，不再锁死 600:450 / Fill hero height instead of fixed ratio */
  fill?: boolean;
}) {
  return (
    <div
      style={
        fill
          ? { flex: 1, minHeight: 0, height: '100%' }
          : { aspectRatio: '600 / 450', minHeight: '330px' }
      }
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden bg-muted/15 dark:bg-muted/5',
        className,
      )}
    >
      {/* 科技点阵底纹 */}
      {/* Tech dot-matrix background */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--stx-topo-dot, var(--stx-glacier-300)) 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* 上下边缘柔和过渡渐变 */}
      {/* Subtle top/bottom edge gradient transition */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/**
 * 集成卡片完整呈现组件（精炼无冗余文案，全图解+极简运维遥测指标条）
 * IntegrationCard complete presentation component (Clean, zero fluff, diagram + minimalist Ops HUD)
 */
export const IntegrationCard = ({
  embedded = false,
}: {
  /** 嵌入一体 Hero 壳时去掉外层 Card 边框与阴影 / Drop Card chrome when inside unified hero */
  embedded?: boolean;
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const locale = useHomeLocale();
  const architectureUrl = useBaseUrl('/docs/architecture/overview');
  const statusCopy =
    locale === "en"
      ? {
          engines: "Engines: 1/3",
          env: "Env: VM / Host",
          agent: "AI entry: CLI + Skill",
          architecture: "Architecture ➔",
        }
      : {
          engines: "引擎: 1/3",
          env: "环境: 虚拟机 / 主机",
          agent: "AI 入口: CLI + Skill",
          architecture: "架构设计 ➔",
        };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Card
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative mx-auto flex w-full flex-col overflow-hidden p-0 bg-transparent transition-all duration-300',
        embedded
          ? 'h-full max-w-none rounded-none border-0 shadow-none'
          : 'max-w-[535px] rounded-2xl border border-border/80 shadow-2xl bg-card/95 backdrop-blur-xl hover:border-primary/50',
      )}
      style={
        embedded
          ? undefined
          : {
              boxShadow: isHovered
                ? '0 22px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(142, 202, 214, 0.25)'
                : '0 12px 36px rgba(0, 0, 0, 0.25)',
            }
      }
    >
      {!embedded && (
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#8ecad6] to-transparent opacity-80" />
      )}

      {/* 21st.dev 光标跟随探照光晕 (Spotlight overlay) */}
      {/* 21st.dev cursor spotlight glow overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-200"
          style={{
            background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, var(--stx-stage-accent-soft, rgba(142, 202, 214, 0.15)), transparent 80%)`,
          }}
        />
      )}

      {/* 顶部运维遥测 HUD 状态栏 */}
      {/* Top Ops Telemetry HUD Status Bar */}
      <div
        className={cn(
          'flex items-center justify-between px-4 sm:px-5 py-2.5',
          embedded
            ? 'border-b border-[color:var(--stx-stage-line)] bg-transparent'
            : 'border-b border-border/60 bg-muted/30 backdrop-blur-md',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-xs font-semibold text-foreground">
            STX Control Plane{" "}
            <span className="text-muted-foreground font-normal">
              (Master Leader)
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">1.2ms</span> RTT
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="font-semibold text-foreground">Active</span> Telemetry
          </span>
        </div>
      </div>

      {/* 中部拓扑架构动态画布 */}
      {/* Middle topology architecture dynamic canvas */}
      <VisualContainer fill={embedded}>
        <Integration />
      </VisualContainer>

      {/* 底部极简状态指示条（纯技术状态，无多余描述废话） */}
      {/* Bottom minimalist status strip (Technical status only, zero redundant copy) */}
      <CardContent
        className={cn(
          'px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-muted-foreground',
          embedded
            ? 'bg-transparent border-t border-[color:var(--stx-stage-line)]'
            : 'bg-card/90 backdrop-blur-md border-t border-border/60',
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-emerald-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {statusCopy.engines}
          </span>
          <span className="text-border">|</span>
          <span className="text-foreground/70">{statusCopy.env}</span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="hidden sm:inline text-foreground/55">
            {statusCopy.agent}
          </span>
        </div>
        <a
          href={architectureUrl}
          className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline ml-auto dark:text-white"
        >
          {statusCopy.architecture}
        </a>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
