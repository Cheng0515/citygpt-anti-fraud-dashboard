import { useEffect, useState, useRef } from "react";
import { Radio, Signal } from "lucide-react";

interface Props {
  onComplete: () => void;
  duration?: number;
}

const STAGES = [
  { en: "DECRYPTING PAYLOAD", zh: "解碼通報資料…" },
  { en: "RISK ANALYSIS", zh: "風險特徵比對…" },
  { en: "CROSS-REFERENCE", zh: "關聯案件查詢…" },
  { en: "INJECT TO WAR ROOM", zh: "導入戰情室…" },
];

export const IncomingMessageModal = ({ onComplete, duration = 4000 }: Props) => {
  const [closing, setClosing] = useState(false);
  const [stage, setStage] = useState(0);
  const [textKey, setTextKey] = useState(0);
  const stageRef = useRef(0);

  useEffect(() => {
    const fadeT = setTimeout(() => setClosing(true), duration - 400);
    const doneT = setTimeout(onComplete, duration);
    return () => {
      clearTimeout(fadeT);
      clearTimeout(doneT);
    };
  }, [duration, onComplete]);

  useEffect(() => {
    const interval = duration / STAGES.length; // 1000ms
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 1; i < STAGES.length; i++) {
      const t = setTimeout(() => {
        stageRef.current = i;
        setStage(i);
        setTextKey((k) => k + 1);
      }, i * interval);
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, [duration]);

  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  const current = STAGES[stage];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100 animate-fade-in"
      }`}
      style={{ backdropFilter: "blur(8px)", background: "hsl(220 50% 3% / 0.7)" }}
    >
      <div
        className="panel panel-corners panel-glow relative w-[440px] max-w-[92vw] p-6"
        style={{ boxShadow: "var(--glow-cyan)" }}
      >
        {/* header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-danger animate-blink" />
          <div className="font-mono text-[10px] tracking-[0.3em] text-danger/90">
            INCOMING TRANSMISSION
          </div>
          <div className="flex-1" />
          <Signal className="w-3.5 h-3.5 text-primary animate-pulse" />
        </div>

        {/* body */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-foreground mb-1">
              戰情室收到新訊息
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              CityGPT WAR ROOM · 正在建立連線通道…
            </div>
          </div>
        </div>

        {/* meta */}
        <div className="font-mono text-[11px] space-y-1 mb-5 bg-card/40 border border-primary/15 rounded p-3">
          <MetaRow k="CASE ID" v="CGT-2025-110824-A1" />
          <MetaRow k="SOURCE" v="Anonymous Citizen Report" />
          <MetaRow k="CHANNEL" v="CITYGPT-SECURE-CH-03" />
          <MetaRow k="TIMESTAMP" v={ts} />
        </div>

        {/* progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-widest">
            <span
              key={textKey}
              className="text-primary/80 animate-stage-text inline-block"
            >
              {current.en}
            </span>
            <span className="text-muted-foreground animate-blink">●●●</span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground/80 tracking-wider h-4">
            <span key={`zh-${textKey}`} className="animate-stage-text inline-block">
              {current.zh}
            </span>
          </div>
          <div className="h-1 rounded bg-primary/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{
                animation: `incoming-progress ${duration}ms linear forwards`,
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes incoming-progress {
            from { width: 0%; }
            to { width: 100%; }
          }
          @keyframes stage-text-in {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-stage-text {
            animation: stage-text-in 0.35s ease-out both;
          }
        `}</style>
      </div>
    </div>
  );
};

const MetaRow = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-muted-foreground tracking-[0.15em]">{k}</span>
    <span className="text-primary truncate">{v}</span>
  </div>
);
