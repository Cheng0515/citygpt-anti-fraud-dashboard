import { Shield, ChevronRight, Activity, ScanLine, Lock, Cpu, Radio } from "lucide-react";

export const HomeScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-primary/20 backdrop-blur-md bg-background/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-cyan)" }}>
            <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-mono text-sm tracking-[0.3em] text-primary/80">CITYGPT · ANTI-FRAUD</div>
            <div className="text-base font-bold">智慧城市防詐中樞</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20" style={{ background: "hsl(188 95% 55%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "hsl(42 95% 60%)" }} />

          {/* Subtle single sweep light bar */}
          <div
            className="absolute top-0 bottom-0 w-[20%]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, hsl(188 95% 55% / 0.05) 45%, hsl(188 100% 75% / 0.09) 50%, hsl(188 95% 55% / 0.05) 55%, transparent 100%)",
              filter: "blur(4px)",
              mixBlendMode: "screen",
              animation: "sweep-x 18s ease-in-out infinite",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center animate-fade-in">
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
            <span className="text-gradient-hero border-slate-50 rounded-lg mb-0">CityGPT</span>
            <br />
            <span className="text-foreground">智慧城市防詐中樞</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            以城市級 AI 防詐為核心 — 民眾即時識詐、情資主動回報、AI 分類後下架追蹤，
            <br className="hidden md:block" />
            打造可協作的城市防詐戰情室。
          </p>

          {/* Pipeline preview */}
          <div className="flex items-center justify-center gap-3 md:gap-5 mb-12 flex-wrap font-mono text-sm md:text-base text-muted-foreground">
            {[
              { i: ScanLine, l: "案件擷取" },
              { i: Lock, l: "個資匿名" },
              { i: Cpu, l: "AI 分類" },
              { i: Radio, l: "下架追蹤" },
            ].map((s, idx, arr) => {
              const Icon = s.i;
              return (
                <div key={s.l} className="flex items-center gap-3 md:gap-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-lg border border-primary/40 bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground/80">{s.l}</span>
                  </div>
                  {idx < arr.length - 1 && <span className="text-primary/40">→</span>}
                </div>
              );
            })}
          </div>

          <button onClick={onStart} className="group inline-flex items-center gap-3 px-12 py-6 rounded-xl font-bold text-lg md:text-xl transition-all hover:scale-[1.03]" style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-cyan)" }}>
            <Shield className="w-6 h-6 text-primary-foreground" />
            <span className="text-primary-foreground">啟動 識詐測驗</span>
            <ChevronRight className="w-6 h-6 text-primary-foreground transition-transform group-hover:translate-x-1" />
          </button>
          <div className="mt-5 font-mono text-sm tracking-widest text-muted-foreground/70">防詐辨識力測驗 → 情資主動回報 → CityGPT 戰情室</div>

          <div className="mt-14 flex items-center justify-center gap-6 text-sm font-mono text-muted-foreground/70 flex-wrap">
            <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> 不含真實個資</span>
            <span>·</span>
            <span>模擬上傳中央 / 地方警政單位</span>
            <span>·</span>
            <span>非實際政府服務</span>
          </div>
        </div>
      </main>
    </div>
  );
};
