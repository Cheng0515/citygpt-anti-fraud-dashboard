import { useEffect, useMemo, useState } from "react";
import { Panel, TechLabel } from "@/components/demo/ui-bits";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { TW_COUNTIES, TW_VIEWBOX, type Region } from "@/data/tw-map";

type Area = "雙北" | "台中" | "高雄" | "東部";

type Case = {
  id: string; type: string; area: Area; status: string;
  risk: "HIGH" | "MED"; summary: string; action: string;
};

// 精簡至 4 件（每區一件代表案）— 政府視角，量剛好不複雜
const cases: Case[] = [
  { id: "CGT-1108-0482", type: "政府紓困釣魚簡訊", area: "雙北", status: "已下架", risk: "HIGH",
    summary: "偽冒政府紓困名義誘導點擊短網址竊取個資。", action: "短網址已下架 · 同步 165" },
  { id: "CGT-1108-0480", type: "假購物網站", area: "台中", status: "已下架", risk: "MED",
    summary: "仿冒知名電商相似網域誘騙刷卡。", action: "TWNIC 已通報 · 主機商封鎖" },
  { id: "CGT-1108-0481", type: "假投資 LINE 群組", area: "高雄", status: "通報中", risk: "HIGH",
    summary: "高報酬假投資群組誘導加入釣魚交易所。", action: "LINE 已標記 · 平台協作下架" },
  { id: "CGT-1108-0475", type: "假交友投資（豬仔盤）", area: "東部", status: "通報中", risk: "MED",
    summary: "交友 APP 誘導加 LINE 後導入投資詐騙。", action: "帳號已通報 · 受害人轉介 165" },
];

const donutByArea: Record<Area | "ALL", { name: string; value: number; color: string }[]> = {
  ALL: [
    { name: "釣魚簡訊", value: 38, color: "hsl(188 95% 55%)" },
    { name: "假投資", value: 24, color: "hsl(42 95% 60%)" },
    { name: "假購物", value: 19, color: "hsl(355 90% 60%)" },
    { name: "其他", value: 19, color: "hsl(210 25% 55%)" },
  ],
  雙北: [
    { name: "釣魚簡訊", value: 52, color: "hsl(188 95% 55%)" },
    { name: "假投資", value: 22, color: "hsl(42 95% 60%)" },
    { name: "假購物", value: 14, color: "hsl(355 90% 60%)" },
    { name: "其他", value: 12, color: "hsl(210 25% 55%)" },
  ],
  台中: [
    { name: "假購物", value: 41, color: "hsl(355 90% 60%)" },
    { name: "釣魚簡訊", value: 28, color: "hsl(188 95% 55%)" },
    { name: "假投資", value: 18, color: "hsl(42 95% 60%)" },
    { name: "其他", value: 13, color: "hsl(210 25% 55%)" },
  ],
  高雄: [
    { name: "假投資", value: 46, color: "hsl(42 95% 60%)" },
    { name: "釣魚簡訊", value: 26, color: "hsl(188 95% 55%)" },
    { name: "假購物", value: 16, color: "hsl(355 90% 60%)" },
    { name: "其他", value: 12, color: "hsl(210 25% 55%)" },
  ],
  東部: [
    { name: "假交友", value: 44, color: "hsl(42 95% 60%)" },
    { name: "釣魚簡訊", value: 24, color: "hsl(188 95% 55%)" },
    { name: "假購物", value: 18, color: "hsl(355 90% 60%)" },
    { name: "其他", value: 14, color: "hsl(210 25% 55%)" },
  ],
};

// 每個 Region 的代表縣市（指向用）與標籤錨點
const regionDotConfig: Record<Region, {
  county: string;
  label: string;
  toneVar: string;
  anchor: { x: number; y: number; align: "start" | "end" };
}> = {
  雙北: { county: "台北市", label: "雙北", toneVar: "--danger",  anchor: { x: 196, y: 58,  align: "end" } },
  台中: { county: "台中市", label: "台中", toneVar: "--warning", anchor: { x: 4,   y: 150, align: "start" } },
  高雄: { county: "高雄市", label: "高雄", toneVar: "--danger",  anchor: { x: 4,   y: 260, align: "start" } },
  東部: { county: "花蓮縣", label: "花蓮", toneVar: "--primary", anchor: { x: 196, y: 178, align: "end" } },
};
const regionToneVar: Record<Region, string> = {
  雙北: "--danger", 台中: "--warning", 高雄: "--danger", 東部: "--primary",
};
const regionDots = (Object.keys(regionDotConfig) as Region[]).map((r) => {
  const cfg = regionDotConfig[r];
  const c = TW_COUNTIES.find((c) => c.name === cfg.county)!;
  return { region: r, label: cfg.label, x: c.cx, y: c.cy, toneVar: cfg.toneVar, anchor: cfg.anchor };
});

const filterLabel: Record<Area, string> = { 雙北: "雙北", 台中: "台中", 高雄: "高雄", 東部: "花蓮" };
const filters: ("ALL" | Area)[] = ["ALL", "雙北", "台中", "高雄", "東部"];


export const WarRoom = ({ onBack }: { onBack: () => void }) => {
  const [filter, setFilter] = useState<"ALL" | Area>("ALL");
  const filteredCases = useMemo(
    () => (filter === "ALL" ? cases : cases.filter((c) => c.area === filter)),
    [filter]
  );
  const [expandedId, setExpandedId] = useState<string | null>(filteredCases[0]?.id ?? null);

  useEffect(() => {
    setExpandedId(filteredCases[0]?.id ?? null);
  }, [filteredCases]);

  const donut = donutByArea[filter];

  return (
    <div className="h-screen flex flex-col overflow-hidden p-3 md:p-4">
      <div className="mx-auto max-w-[1400px] w-full flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2 shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ChevronLeft className="w-4 h-4" /> 返回首頁
          </button>
          <div></div>
        </div>

        {/* Title + KPIs */}
        <div className="panel panel-corners p-3 mb-2 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-primary/80">CITYGPT · ANTI-FRAUD COMMAND CENTER</div>
            <h1 className="text-xl md:text-2xl font-black">CityGPT 防詐戰情室</h1>
            <div className="text-xs text-muted-foreground">中央／地方政府防詐治理參考儀表</div>
          </div>
          <div className="flex gap-6 font-mono">
            <Metric label="本月阻詐金額（估）" value="NT$ 4.2 億" tone="success" />
            <Metric label="新增案件" value="1,284" tone="primary" />
            <Metric label="平均下架時間" value="2.4 hr" tone="accent" />
            <Metric label="AI 準確率" value="96.4%" tone="accent" />
          </div>
        </div>

        {/* Region filter */}
        <div className="flex items-center gap-2 mb-2 shrink-0 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground mr-1">區域篩選</span>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-md font-mono text-sm border transition",
                filter === f
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-primary/15 bg-card/30 text-muted-foreground hover:text-primary hover:border-primary/40"
              )}
            >
              {f === "ALL" ? "全部" : filterLabel[f]}
            </button>
          ))}
        </div>

        {/* Main content — 2 columns, no scroll */}
        <div className="flex-1 overflow-hidden grid grid-cols-12 gap-2">
          {/* Left: Radar (top) + Donut (bottom) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-2 overflow-hidden">
            {/* Radar — 較小 */}
            <Panel className="flex-[1.1] p-2 overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-1 shrink-0 px-1">
                <TechLabel>縣市風險熱區</TechLabel>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {filter === "ALL" ? "全國即時" : `聚焦 · ${filterLabel[filter]}`}
                </div>
              </div>
              <div
                className="flex-1 min-h-0 relative rounded-lg overflow-hidden"
                style={{ background: "radial-gradient(ellipse at center, hsl(220 60% 7%) 0%, hsl(225 70% 3%) 100%)" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(hsl(var(--primary) / 0.09) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.09) 1px, transparent 1px)",
                    backgroundSize: "24px 24px, 24px 24px",
                    maskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
                    animation: "grid-pulse 4s ease-in-out infinite, grid-drift 12s linear infinite",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{
                    maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
                  }}
                >
                  <div
                    className="absolute inset-x-0 h-24"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.16) 50%, transparent)",
                      animation: "grid-scan 4s linear infinite",
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-0">
                  <div
                    className="relative h-full max-w-full"
                    style={{ aspectRatio: `${TW_VIEWBOX.w} / ${TW_VIEWBOX.h}` }}
                  >
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox={`0 0 ${TW_VIEWBOX.w} ${TW_VIEWBOX.h}`}
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient id="tw-scan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary) / 0)" />
                          <stop offset="50%" stopColor="hsl(var(--primary) / 0.55)" />
                          <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
                        </linearGradient>
                        <linearGradient id="tw-focus-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary) / 0)" />
                          <stop offset="45%" stopColor="hsl(var(--primary) / 0.95)" />
                          <stop offset="55%" stopColor="hsl(var(--primary-glow) / 0.9)" />
                          <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
                        </linearGradient>
                        <radialGradient id="tw-focus-halo" cx="0.5" cy="0.5" r="0.5">
                          <stop offset="0%" stopColor="hsl(var(--primary) / 0.35)" />
                          <stop offset="60%" stopColor="hsl(var(--primary) / 0.08)" />
                          <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
                        </radialGradient>
                        <clipPath id="tw-clip">
                          {TW_COUNTIES.map((c) => (
                            <path key={c.name} d={c.d} />
                          ))}
                        </clipPath>
                        {filter !== "ALL" && (
                          <clipPath id="tw-focus-clip">
                            {TW_COUNTIES.filter((c) => c.region === filter).map((c) => (
                              <path key={c.name} d={c.d} />
                            ))}
                          </clipPath>
                        )}
                      </defs>

                      {/* 經緯參考線 */}
                      <line x1={TW_VIEWBOX.w / 2} y1="10" x2={TW_VIEWBOX.w / 2} y2={TW_VIEWBOX.h - 10} stroke="hsl(var(--primary) / 0.08)" strokeDasharray="2 3" />
                      <line x1="20" y1={TW_VIEWBOX.h / 2} x2={TW_VIEWBOX.w - 20} y2={TW_VIEWBOX.h / 2} stroke="hsl(var(--primary) / 0.08)" strokeDasharray="2 3" />


                      {/* 縣市多邊形 */}
                      {TW_COUNTIES.map((c) => {
                        const inRegion = c.region !== null;
                        const dim = filter !== "ALL" && filter !== c.region;
                        const focus = inRegion && filter === c.region;
                        const toneVar = c.tone ? `--${c.tone}` : null;

                        let fill = "hsl(var(--primary) / 0.04)";
                        let stroke = "hsl(var(--primary) / 0.35)";
                        let sw = 0.4;
                        if (inRegion && toneVar) {
                          fill = `hsl(var(${toneVar}) / ${focus ? 0.5 : dim ? 0.06 : 0.22})`;
                          stroke = `hsl(var(${toneVar}) / ${dim ? 0.25 : focus ? 1 : 0.75})`;
                          sw = focus ? 0.9 : 0.6;
                        } else if (filter !== "ALL") {
                          fill = "hsl(var(--primary) / 0.02)";
                          stroke = "hsl(var(--primary) / 0.2)";
                        }
                        return (
                          <path
                            key={c.name}
                            d={c.d}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={sw}
                            style={{
                              cursor: inRegion ? "pointer" : "default",
                              transition: "all .25s",
                              animation: focus ? "tw-focus-stroke 1.6s ease-in-out infinite" : undefined,
                              filter: focus && toneVar ? `drop-shadow(0 0 3px hsl(var(${toneVar}) / 0.9))` : undefined,
                            }}
                            onClick={() => {
                              if (!inRegion) return;
                              setFilter(focus ? "ALL" : (c.region as Region));
                            }}
                          >
                            <title>{c.name}{c.region ? ` · ${c.region}` : ""}</title>
                          </path>
                        );
                      })}

                      {/* 全島輕掃描光帶 */}
                      <g clipPath="url(#tw-clip)" opacity={filter === "ALL" ? 1 : 0.35}>
                        <rect
                          x="0"
                          width={TW_VIEWBOX.w}
                          height="40"
                          fill="url(#tw-scan)"
                          style={{ animation: `tw-map-scan 4s linear infinite` }}
                        />
                      </g>

                      {/* 聚焦掃描：選中區域內加強光帶 + halo */}
                      {filter !== "ALL" && (
                        <g clipPath="url(#tw-focus-clip)">
                          <rect
                            x="0"
                            y="0"
                            width={TW_VIEWBOX.w}
                            height={TW_VIEWBOX.h}
                            fill="url(#tw-focus-halo)"
                            opacity="0.9"
                          />
                          <rect
                            x="0"
                            width={TW_VIEWBOX.w}
                            height="28"
                            fill="url(#tw-focus-grad)"
                            style={{ animation: `tw-focus-scan 1.6s linear infinite` }}
                          />
                        </g>
                      )}


                      {/* 風險點 + 標籤 */}
                      {regionDots.map((d) => {
                        const dim = filter !== "ALL" && filter !== d.region;
                        const focus = filter === d.region;
                        return (
                          <g
                            key={`dot-${d.region}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setFilter(focus ? "ALL" : d.region)}
                          >
                            {focus && (
                              <>
                                <circle cx={d.x} cy={d.y} r="4" fill="none" stroke={`hsl(var(${d.toneVar}))`} strokeWidth="0.6">
                                  <animate attributeName="r" values="4;18;4" dur="1.4s" repeatCount="indefinite" />
                                  <animate attributeName="opacity" values="0.9;0;0.9" dur="1.4s" repeatCount="indefinite" />
                                </circle>
                                <circle cx={d.x} cy={d.y} r="4" fill="none" stroke={`hsl(var(${d.toneVar}))`} strokeWidth="0.5">
                                  <animate attributeName="r" values="4;18;4" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                                  <animate attributeName="opacity" values="0.7;0;0.7" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                                </circle>
                              </>
                            )}
                            {!dim && (
                              <circle cx={d.x} cy={d.y} r="3" fill={`hsl(var(${d.toneVar}) / 0.4)`}>
                                <animate
                                  attributeName="r"
                                  values={`${focus ? 4 : 3};${focus ? 11 : 9};${focus ? 4 : 3}`}
                                  dur="1.8s"
                                  repeatCount="indefinite"
                                />
                                <animate
                                  attributeName="opacity"
                                  values="0.75;0;0.75"
                                  dur="1.8s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            )}
                            <circle
                              cx={d.x}
                              cy={d.y}
                              r={focus ? 2.6 : 2}
                              fill={`hsl(var(${d.toneVar}))`}
                              opacity={dim ? 0.3 : 1}
                              style={{ filter: dim ? "none" : `drop-shadow(0 0 4px hsl(var(${d.toneVar})))` }}
                            />
                            <line
                              x1={d.x}
                              y1={d.y}
                              x2={d.anchor.x}
                              y2={d.anchor.y}
                              stroke={`hsl(var(${d.toneVar}) / ${dim ? 0.15 : 0.5})`}
                              strokeWidth="0.4"
                              strokeDasharray="1.5 1.5"
                            />
                            <text
                              x={d.anchor.x}
                              y={d.anchor.y - 3}
                              fontSize="8"
                              fontFamily="ui-monospace, monospace"
                              fill={`hsl(var(${d.toneVar}) / ${dim ? 0.35 : 1})`}
                              textAnchor={d.anchor.align}
                              style={{ fontWeight: focus ? 700 : 500 }}
                            >
                              {d.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 flex gap-2 font-mono text-[10px]">
                  <Legend tone="danger" l="HIGH" />
                  <Legend tone="warning" l="MED" />
                  <Legend tone="primary" l="LOW" />
                </div>
              </div>
            </Panel>

            {/* Donut — 緊湊 */}
            <Panel className="shrink-0 p-3">
              <div className="flex items-center justify-between mb-1">
                <TechLabel>主要詐騙手法分布</TechLabel>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {filter === "ALL" ? "全國" : filter}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 flex-shrink-0">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={donut} dataKey="value" innerRadius={22} outerRadius={30} stroke="hsl(220 50% 5%)">
                        {donut.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1">
                  {donut.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
                      <span>{d.name}</span>
                      <span className="font-mono text-muted-foreground ml-auto">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* Right: Cases — 不滾動 */}
          <Panel className="col-span-12 lg:col-span-6 p-3 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0 flex-wrap gap-1">
              <TechLabel>
                近期下架案件
                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                  {filter === "ALL" ? "全國" : filter} · {filteredCases.length} 件
                </span>
              </TechLabel>
              <div className="font-mono text-[10px] text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-blink" /> LIVE
              </div>
            </div>

            {filteredCases.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground font-mono">
                該區域目前無案件
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-auto pr-1">
                {filteredCases.map((c) => {
                  const open = expandedId === c.id;
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "panel flex flex-col transition",
                        open && "glow-border"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(open ? null : c.id)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-primary/5 transition"
                      >
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded font-bold font-mono text-xs shrink-0",
                            c.risk === "HIGH"
                              ? "bg-danger/15 text-danger"
                              : "bg-warning/15 text-warning"
                          )}
                        >
                          {c.risk}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-bold truncate">{c.type}</div>
                          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                            <span>{c.area}</span>
                            <span>·</span>
                            <span className={c.status === "已下架" ? "text-success" : "text-warning"}>
                              ● {c.status}
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                            open && "rotate-180 text-primary"
                          )}
                        />
                      </button>

                      {open && (
                        <div className="px-3 pb-3 space-y-5 border-t border-primary/15">
                          <div className="rounded-md border-l-2 border-primary/60 pl-3 py-1 mt-2">
                            <div className="text-xs text-muted-foreground mb-1 tracking-[0.2em] font-mono">風險摘要 / SUMMARY</div>
                            <p className="text-base text-foreground leading-[2]">
                              {c.summary}
                            </p>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1 tracking-[0.2em] font-mono">最新處置 / ACTION</div>
                            <div className="flex items-start gap-2.5 p-2.5 rounded-md border border-primary/20 bg-primary/5">
                              <span className="w-2 h-2 rounded-full bg-success animate-blink mt-2 flex-shrink-0" />
                              <p className="text-base text-foreground leading-[2]">
                                {c.action}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <div className="text-center mt-1 shrink-0 text-[10px] text-muted-foreground/60 font-mono">
          ※ 本戰情室資料皆為模擬，不含真實個資、不涉及政府正式系統。
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value, tone }: { label: string; value: string; tone: string }) => {
  const c: Record<string, string> = {
    primary: "text-primary",
    success: "text-success",
    accent: "text-accent",
  };
  return (
    <div>
      <div className="text-[10px] tracking-widest text-muted-foreground">{label}</div>
      <div className={cn("text-lg font-bold", c[tone])}>{value}</div>
    </div>
  );
};

const Legend = ({ tone, l }: { tone: string; l: string }) => {
  const c: Record<string, string> = {
    danger: "bg-danger",
    warning: "bg-warning",
    primary: "bg-primary",
  };
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <span className={cn("w-1.5 h-1.5 rounded-full", c[tone])} />
      {l}
    </span>
  );
};
