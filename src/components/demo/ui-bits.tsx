import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Panel = ({ children, className, glow = false, corners = true }: {
  children: ReactNode; className?: string; glow?: boolean; corners?: boolean;
}) => (
  <div className={cn("panel p-4 relative", glow && "panel-glow", corners && "panel-corners", className)}>
    {children}
  </div>
);

export const TechLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("tech-label flex items-center gap-2", className)}>
    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-blink" />
    {children}
  </div>
);

export const DemoBadge = ({ className }: { className?: string }) => (
  <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent text-xs font-mono tracking-widest", className)}>
    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-blink" />
    DEMO · 概念展示 · 模擬資料
  </div>
);

export const StatusDot = ({ tone = "primary" }: { tone?: "primary" | "danger" | "success" | "warning" }) => {
  const map: Record<string, string> = {
    primary: "bg-primary", danger: "bg-danger", success: "bg-success", warning: "bg-warning",
  };
  return <span className={cn("inline-block w-2 h-2 rounded-full animate-blink", map[tone])} />;
};

export const PhoneFrame = ({ children, className, title = "iPhone" }: { children: ReactNode; className?: string; title?: string }) => (
  <div className={cn("relative mx-auto", className)}>
    {/* Side buttons */}
    <div className="absolute left-[-13px] top-[88px] w-[3px] h-7 rounded-l bg-slate-700 z-30" />
    <div className="absolute left-[-13px] top-[130px] w-[3px] h-12 rounded-l bg-slate-700 z-30" />
    <div className="absolute left-[-13px] top-[190px] w-[3px] h-12 rounded-l bg-slate-700 z-30" />
    <div className="absolute right-[-13px] top-[110px] w-[3px] h-16 rounded-r bg-slate-700 z-30" />
    <div
      className="relative rounded-[3rem] border-[12px] border-slate-900 bg-slate-950 shadow-2xl overflow-hidden"
      style={{
        boxShadow:
          "0 30px 80px hsl(220 80% 2% / 0.85), 0 0 0 2px hsl(220 30% 12%), 0 0 0 3px hsl(195 60% 25% / 0.4), 0 0 60px hsl(188 95% 55% / 0.18)",
      }}
    >
      {/* Dynamic island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[110px] h-[26px] bg-black rounded-full z-20 flex items-center justify-end pr-2 gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
      </div>
      <div className="bg-slate-950 text-white">
        <div className="flex justify-between items-center px-7 pt-2.5 pb-1.5 text-[12px] font-semibold">
          <span>9:41</span>
          <span className="opacity-0">{title}</span>
          <span className="flex items-center gap-1.5 text-[10px]">
            <span>📶</span>
            <span>🔋</span>
          </span>
        </div>
        {children}
      </div>
      {/* Home indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[110px] h-[4px] rounded-full bg-slate-300/80 z-20" />
    </div>
  </div>
);
