import { useEffect, useState } from "react";
import { Panel, TechLabel, DemoBadge } from "@/components/demo/ui-bits";
import { IncomingMessageModal } from "@/components/demo/IncomingMessageModal";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileCheck2, ShieldCheck, Send, ScanLine, Lock, Cpu, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const reportStages = [
  { id: 0, icon: ScanLine, label: "擷取樣本", desc: "Capture sample" },
  { id: 1, icon: Lock, label: "匿名化", desc: "Anonymize PII" },
  { id: 2, icon: Cpu, label: "AI 分類", desc: "AI classification" },
  { id: 3, icon: Radio, label: "下架追蹤", desc: "Takedown & track" },
];

interface Props {
  score: number;
  onProceed: () => void;
  onBack: () => void;
}

export const ResultScreen = ({ score, onProceed, onBack }: Props) => {
  const pct = Math.round((score / 3) * 100);
  const tier = score >= 3 ? { label: "防詐高手", color: "text-success", grade: "A" } :
               score >= 2 ? { label: "尚需強化", color: "text-warning", grade: "B" } :
               { label: "高風險族群", color: "text-danger", grade: "C" };
  return (
    <div className="min-h-screen p-6 md:p-10 flex items-center">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <TechLabel>測驗結果 · QUIZ RESULT</TechLabel>
          <DemoBadge />
        </div>
        <Panel className="p-8 md:p-12 text-center" glow>
          <div className="font-mono text-xs tracking-widest text-primary mb-4">CITYGPT · ANTI-FRAUD CAPABILITY INDEX</div>
          <div className="text-7xl md:text-8xl font-black mb-2 text-gradient-cyan">{score}<span className="text-3xl text-muted-foreground"> / 3</span></div>
          <div className={cn("text-2xl font-bold mb-2", tier.color)}>{tier.label}</div>
          <div className="font-mono text-sm text-muted-foreground">綜合評等 · GRADE {tier.grade} · {pct} 分</div>

          <div className="grid grid-cols-3 gap-4 my-10 max-w-2xl mx-auto">
            {[{ k: "識別速度", v: "1.2s" }, { k: "證據強度", v: `${pct}%` }, { k: "風險評分", v: tier.grade }].map((s) => (
              <div key={s.k} className="panel panel-corners p-4">
                <div className="tech-label mb-1">{s.k}</div>
                <div className="text-2xl font-bold text-primary">{s.v}</div>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-8">
            您可選擇將本次擬真案例匿名提交至 CityGPT 防詐戰情室，協助 AI 進一步學習並回報下架追蹤，模擬通報至警政單位協作網路。
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={onBack} className="h-12 px-6">返回首頁</Button>
            <Button onClick={onProceed} className="h-12 px-8 font-medium" style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-cyan)" }}>
              送出匿名通報並查看戰情室 <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="mt-6 text-xs text-muted-foreground/60 font-mono">本通報為 DEMO 模擬資料，不會實際送至任何單位</div>
        </Panel>
      </div>
    </div>
  );
};

// Report packaging animation
export const ReportPackaging = ({ onDone }: { onDone: () => void }) => {
  const [stage, setStage] = useState(0);
  const [complete, setComplete] = useState(false);
  const [showIncoming, setShowIncoming] = useState(false);

  useEffect(() => {
    if (stage < reportStages.length - 1) {
      const t = setTimeout(() => setStage(stage + 1), 1100);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setComplete(true), 1100);
      return () => clearTimeout(t);
    }
  }, [stage]);

  return (
    <div className="min-h-screen p-6 md:p-10 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <TechLabel>訊息收集與下架追蹤 · INCIDENT PIPELINE</TechLabel>
          <DemoBadge />
        </div>

        <Panel className="p-8 md:p-10" glow>
          <div className="text-center mb-10">
            <div className="font-mono text-xs tracking-widest text-primary mb-3">CITYGPT · INCIDENT PIPELINE</div>
            <h2 className="text-3xl md:text-4xl font-bold">正在收集詐騙內容並回報下架追蹤…</h2>
          </div>

          {/* Pipeline */}
          <div className="flex items-center justify-between gap-2 mb-12 relative">
            <div className="absolute top-7 left-7 right-7 h-0.5 bg-primary/15">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${(stage / (reportStages.length - 1)) * 100}%` }} />
            </div>
            {reportStages.map((s, i) => {
              const Icon = s.icon;
              const active = i <= stage;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 flex-1 relative z-10">
                  <div className={cn("w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                    active ? "bg-primary border-primary text-primary-foreground" : "bg-card border-primary/30 text-primary/40",
                    i === stage && !complete && "animate-pulse-glow")} style={active ? { boxShadow: "var(--glow-cyan)" } : {}}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className={cn("text-sm font-bold", active ? "text-foreground" : "text-muted-foreground")}>{s.label}</div>
                    <div className="font-mono text-[10px] text-muted-foreground tracking-wider">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Case package */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="panel panel-corners p-5">
              <TechLabel className="mb-3">收集內容 · COLLECTED INFO</TechLabel>

              {/* 來源識別 */}
              <div className="mb-3">
                <div className="font-mono text-[10px] tracking-[0.2em] text-primary/80 mb-1.5">SOURCE · 來源識別</div>
                <div className="font-mono text-xs space-y-1.5">
                  <Row k="粉絲頁" v="@gov-relief-2025-tw" />
                  <Row k="電話" v="+886-905-XXX-228" />
                  <Row k="簡訊樣本" v="1 則 · sha256:9f3a…d7e1" />
                  <Row k="追蹤者數" v="12,480 人" />
                </div>
              </div>

              {/* 廣告資訊 */}
              <div className="mb-3">
                <div className="font-mono text-[10px] tracking-[0.2em] text-primary/80 mb-1.5">AD · 廣告投放資訊</div>
                <div className="font-mono text-xs space-y-1.5">
                  <Row k="廣告編號" v="AD-FB-2025-110824" />
                  <Row k="投放平台" v="Facebook · Meta Ads" />
                  <Row k="起始日期" v="2025-11-05" />
                  <Row k="Call to Action" v="立即領取紓困金" />
                </div>
              </div>

              {/* 風險判定 */}
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-danger/80 mb-1.5">RISK · 風險判定</div>
                <div className="font-mono text-xs space-y-1.5">
                  <Row k="偽冒風險程度" v="HIGH · 92%" tone="danger" />
                  <Row k="廣告詳情" v="冒用衛福部紓困名義" />
                </div>
                <div className="mt-2 space-y-1.5 font-mono text-[11px]">
                  <div className="bg-danger/10 border border-danger/30 px-2 py-1 rounded text-danger/90 truncate">
                    廣告連結：bit.ly/relief2025-tw
                  </div>
                  <div className="bg-card/40 border border-primary/20 px-2 py-1.5 rounded flex items-center gap-2 text-muted-foreground">
                    <ScanLine className="w-3.5 h-3.5 text-primary" />
                    截圖：evidence_001.png · 已上鏈存證
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel-corners p-5">
              <TechLabel className="mb-3">下架追蹤路徑 · TAKEDOWN ROUTING</TechLabel>
              <div className="space-y-3">
                {[
                  { name: "165 反詐騙專線", role: "中央通報", status: "已送達", icon: ShieldCheck },
                  { name: "地方警政單位", role: "區域分派", status: "處理中", icon: Send },
                  { name: "平台下架協作", role: "短網址 / 帳號封鎖", status: "處理中", icon: FileCheck2 },
                ].map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-primary/15 bg-card/30">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.role}</div>
                      </div>
                      <div className="text-xs font-mono">
                        <span className={cn("px-2 py-1 rounded", r.status === "已送達" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>{r.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-[10px] text-muted-foreground/70 font-mono leading-relaxed">
                ※ 本路徑與單位互動為 DEMO 模擬，僅作為概念展示。CityGPT 不含真實個資、不實際連線至政府單位。
              </div>
            </div>
          </div>

          {complete && (
            <div className="mt-8 text-center animate-fade-in">
              <Button onClick={() => setShowIncoming(true)} className="h-12 px-8" style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-cyan)" }}>
                進入 CityGPT 防詐戰情室 <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </Panel>
      </div>
      {showIncoming && <IncomingMessageModal onComplete={onDone} duration={4000} />}
    </div>
  );
};

const Row = ({ k, v, tone }: { k: string; v: string; tone?: "danger" }) => (
  <div className="flex justify-between items-center border-b border-primary/10 pb-1">
    <span className="text-muted-foreground tracking-wider">{k}</span>
    <span className={cn("font-bold", tone === "danger" ? "text-danger" : "text-primary")}>{v}</span>
  </div>
);
