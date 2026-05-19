import { useState, useMemo, type ElementType } from "react";
import { Panel, TechLabel, DemoBadge, PhoneFrame } from "@/components/demo/ui-bits";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, ShieldAlert, Mail, MessageCircle, Building2, Instagram, Facebook, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Verdict = "real" | "fake" | "unsure";
type DualVerdict = "both-real" | "both-fake" | "a-real-b-fake" | "a-fake-b-real";

interface BaseQ {
  id: number;
  kind: "single" | "dual";
  channel: string;
  channelIcon: ElementType;
  title: string;
  correct: Verdict | DualVerdict;
  verdictLabel: string;
  explanation: string;
  evidence: string[];
  risk: "HIGH" | "MEDIUM" | "LOW";
}

const questions: (BaseQ & { render: () => JSX.Element })[] = [
  {
    id: 1, kind: "single", channel: "簡訊 SMS", channelIcon: MessageCircle,
    title: "您收到下列簡訊，請判斷其真偽",
    correct: "fake", verdictLabel: "詐騙簡訊 · 政府紓困釣魚",
    risk: "HIGH",
    explanation: "政府紓困或補助金不會以簡訊+短網址要求民眾點擊「立即領取」。短網址 bit.ly 為高風險縮網址，連結目標非政府網域 (gov.tw)。",
    evidence: ["寄件號碼為 +886-9XX 一般門號，非 1955/1957 政府短碼", "短網址 bit.ly/relief2025 指向非 gov.tw 網域", "急迫語氣『限時 24 小時』為典型釣魚手法"],
    render: () => (
      <PhoneFrame className="w-[340px]">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">SMS</div>
          <div>
            <div className="text-base font-medium">+886 905-XXX-228</div>
            <div className="text-xs text-slate-400">未存連絡人</div>
          </div>
        </div>
        <div className="bg-slate-950 px-5 py-7 min-h-[340px]">
          <div className="text-center text-xs text-slate-500 mb-4">今日 上午 10:24</div>
          <div className="bg-slate-800 text-white rounded-2xl rounded-tl-sm px-5 py-4 text-base leading-relaxed">
            【行政院紓困】您符合 6,000 元現金發放資格，請於 24 小時內完成身份驗證，逾期作廢。
            <br /><br />
            立即領取：bit.ly/relief2025-tw
          </div>
        </div>
      </PhoneFrame>
    ),
  },
  {
    id: 2, kind: "single", channel: "銀行 App 推播", channelIcon: Building2,
    title: "您的銀行 App 跳出以下推播，請判斷",
    correct: "real", verdictLabel: "真實銀行通知",
    risk: "LOW",
    explanation: "此為合法的官方銀行交易通知。寄送來源為銀行 App 內部推播，並非可點擊外部連結；金額、卡末四碼、商店名稱皆完整。CityGPT 比對交易模式與您歷史一致。",
    evidence: ["推播來源為已驗證之銀行 App (Bundle ID 已核可)", "無外部短網址、未要求點擊輸入密碼", "金額、商店名稱、卡末四碼揭露完整"],
    render: () => (
      <PhoneFrame className="w-[340px]">
        <div className="bg-slate-950 px-5 py-7 min-h-[380px]">
          <div className="text-center text-sm text-slate-400 mb-5">今天 14:32</div>
          <div className="bg-slate-800/80 backdrop-blur rounded-2xl px-4 py-4 mb-2 border border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-emerald-600 flex items-center justify-center text-base font-bold">玉</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-slate-200">玉山銀行</span>
                  <span className="text-xs text-slate-500">14:32</span>
                </div>
                <div className="text-base font-semibold text-white mb-1">信用卡交易通知</div>
                <div className="text-sm text-slate-300 leading-relaxed">
                  您的玉山卡末四碼 **3826 已於 全家便利商店 消費 NT$ 158，授權成功。
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-7 text-xs text-slate-500 font-mono">— 本通知來自銀行官方 App —</div>
        </div>
      </PhoneFrame>
    ),
  },
  {
    id: 3, kind: "single", channel: "LINE 投資訊息", channelIcon: MessageCircle,
    title: "陌生人加入 LINE 後傳來下列訊息",
    correct: "fake", verdictLabel: "高風險投資詐騙",
    risk: "HIGH",
    explanation: "保證獲利、私人代操、要求加入「老師群組」皆為典型投資詐騙手法。合法投顧不會以 LINE 私訊招攬未成年/未開戶民眾。",
    evidence: ["「保證日獲利 8-15%」違反金管會規定", "誘導加入未公開的 LINE 群組「股神 VIP 第 47 期」", "頭像盜用知名財經人物，帳號註冊未滿 14 天"],
    render: () => (
      <PhoneFrame className="w-[340px]">
        <div className="bg-emerald-700 text-white px-5 py-3.5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center text-sm text-slate-900 font-bold">林</div>
          <div className="flex-1">
            <div className="text-base font-medium">林老師-財富自由</div>
            <div className="text-xs text-emerald-100">LINE</div>
          </div>
        </div>
        <div className="px-4 py-5 min-h-[340px] space-y-2.5" style={{ background: "linear-gradient(180deg, #4a6741 0%, #3d5535 100%)" }}>
          <div className="max-w-[85%] bg-white text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            您好！我是專業財富顧問 👨‍💼
          </div>
          <div className="max-w-[85%] bg-white text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            我們每日帶單<b>保證獲利 8-15%</b>，已有 3,287 位學員實現財富自由 💰
          </div>
          <div className="max-w-[85%] bg-white text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            限時開放最後 3 個名額，免費加入「股神 VIP 第 47 期」群組，先回覆 <b>「我要賺錢」</b> 拉您進群 🚀
          </div>
        </div>
      </PhoneFrame>
    ),
  },
  {
    id: 4, kind: "single", channel: "電子郵件 Email", channelIcon: Mail,
    title: "您收到下列電子郵件，請判斷",
    correct: "real", verdictLabel: "真實電子發票通知",
    risk: "LOW",
    explanation: "為財政部電子發票整合服務平台寄發之合法載具歸戶通知。寄件網域為 einvoice.nat.gov.tw，內容與您手機條碼載具歸屬一致。",
    evidence: ["寄件人網域為 einvoice.nat.gov.tw (政府單位)", "未要求點擊外部連結或輸入密碼", "對獎資訊與財政部官方期別一致"],
    render: () => (
      <div className="bg-white text-slate-900 rounded-xl w-[420px] overflow-hidden shadow-2xl border border-slate-300">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white text-xs font-bold">財</div>
          <div className="flex-1">
            <div className="text-xs font-semibold">財政部電子發票整合服務平台</div>
            <div className="text-[10px] text-slate-500">noreply@einvoice.nat.gov.tw</div>
          </div>
          <div className="text-[10px] text-slate-500">上午 09:12</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-sm font-semibold mb-3">您 2025 年 7-8 月 統一發票中獎通知</div>
          <div className="text-xs text-slate-700 leading-relaxed space-y-2">
            <p>親愛的會員您好：</p>
            <p>您於 2025 年 7-8 月期透過手機條碼載具索取之電子發票，經本部開獎結果如下：</p>
            <div className="bg-slate-50 border-l-4 border-red-600 px-3 py-2 my-2">
              <div>中獎張數：<b>2 張</b></div>
              <div>合計獎金：<b>NT$ 1,000 元</b></div>
            </div>
            <p className="text-slate-500">獎金將自動匯入您歸戶之銀行帳戶，無須點選任何連結。</p>
            <p className="text-slate-400 text-[10px] mt-3">本郵件為系統自動發送，請勿直接回覆。</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6, kind: "single", channel: "Instagram 私訊", channelIcon: Instagram,
    title: "Instagram 收到下列私訊邀約，請判斷",
    correct: "fake", verdictLabel: "IG 假網拍／盜帳號詐騙",
    risk: "HIGH",
    explanation: "陌生帳號以「廠商合作」「免費試用」誘導點擊外部連結並要求填寫 IG 帳密以「驗證身份」，是典型 Instagram 盜帳號手法，後續會用您帳號詐騙親友。",
    evidence: ["帳號開設未滿 30 天、追蹤者多為機器人", "連結網域為 ig-brand-verify.co (非 instagram.com)", "要求提供 IG 帳號密碼以「驗證合作身份」"],
    render: () => (
      <PhoneFrame className="w-[340px]">
        <div className="bg-white text-slate-900 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
          <div className="w-11 h-11 rounded-full" style={{ background: "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)", padding: 2 }}>
            <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-base font-bold text-slate-700">B</div>
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold flex items-center gap-1">brand_collab.tw <span className="text-xs text-slate-400">· 追蹤</span></div>
            <div className="text-xs text-slate-500">已啟用</div>
          </div>
        </div>
        <div className="bg-white px-4 py-5 min-h-[340px] space-y-2.5">
          <div className="max-w-[85%] bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            Hi～我們是知名美妝品牌行銷部 💄
          </div>
          <div className="max-w-[85%] bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            看到您的版面非常喜歡，邀請您成為合作 KOL，<b>免費寄送商品 + 月費 3 萬</b>！
          </div>
          <div className="max-w-[85%] bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            請先點此驗證身份：<span className="text-blue-600 underline">ig-brand-verify.co/kol</span>，並提供 IG 帳號密碼以開通合作後台 ✨
          </div>
        </div>
      </PhoneFrame>
    ),
  },
  {
    id: 7, kind: "single", channel: "Facebook Messenger", channelIcon: Facebook,
    title: "FB 好友傳來下列訊息，請判斷",
    correct: "fake", verdictLabel: "FB 帳號被盜借錢詐騙",
    risk: "HIGH",
    explanation: "好友帳號疑遭盜用，以急用為由要求代收簡訊驗證碼，實為盜走您的銀行 OTP 進行盜刷。即使是熟人帳號，凡涉及金錢、驗證碼皆應電話本人確認。",
    evidence: ["訊息語氣與該好友平時用語不同", "要求代收『驗證碼』為盜帳號／盜刷常見手法", "無法以電話本人核對，僅能透過 Messenger 對話"],
    render: () => (
      <PhoneFrame className="w-[340px]">
        <div className="bg-[#0866FF] text-white px-4 py-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-base font-bold">王</div>
          <div className="flex-1">
            <div className="text-base font-semibold">王小明（高中同學）</div>
            <div className="text-xs text-blue-100">Messenger · 線上</div>
          </div>
        </div>
        <div className="bg-white px-4 py-5 min-h-[340px] space-y-2.5">
          <div className="max-w-[85%] bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            欸 在嗎？臨時有急事拜託你 🙏
          </div>
          <div className="max-w-[85%] bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            我手機收不到簡訊，可以借你手機收個<b>驗證碼</b>嗎？等等傳給我號碼，麻煩把收到的 6 碼回我！
          </div>
          <div className="max-w-[85%] bg-slate-100 text-slate-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
            真的很急，拜託拜託 🥺 我等等請你喝飲料！
          </div>
        </div>
      </PhoneFrame>
    ),
  },
  {
    id: 5, kind: "dual", channel: "雙信件比對", channelIcon: Mail,
    title: "下列兩封信件，哪封為真？哪封為假？",
    correct: "a-fake-b-real", verdictLabel: "信件 A 為釣魚 / 信件 B 為真",
    risk: "HIGH",
    explanation: "信件 A 寄件網域為 中華電信-service.com（非 cht.com.tw），且包含可疑「驗證帳號」按鈕；信件 B 為合法帳單通知，寄件網域與企業官方一致。",
    evidence: ["A: 寄件網域 service-cht.online (非官方)", "A: CTA 按鈕「立即驗證」指向可疑網址", "B: 寄件網域 ebill@cht.com.tw 為官方", "B: 不含外部連結，只說明帳單資訊"],
    render: () => (
      <div className="flex gap-4 flex-wrap justify-center">
        {[
          { tag: "A", from: "中華電信客服 <service@service-cht.online>", subject: "【緊急】您的帳號將於 24 小時內停用", body: "親愛的客戶您好，系統偵測到您的帳號有異常登入，請立即點選下方按鈕完成驗證，否則帳號將被強制停用。", cta: true, tone: "from-rose-100" },
          { tag: "B", from: "中華電信電子帳單 <ebill@cht.com.tw>", subject: "您 2025 年 10 月份電信費電子帳單", body: "親愛的客戶您好，您 10 月份應繳金額為 NT$ 599，繳費截止日為 11/15。可至中華電信 App 或 ATM 繳費。", cta: false, tone: "from-emerald-100" },
        ].map((m) => (
          <div key={m.tag} className="bg-white text-slate-900 rounded-xl w-[320px] overflow-hidden shadow-2xl border border-slate-300 relative">
            <div className={cn("absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm", m.tag === "A" ? "bg-rose-500" : "bg-emerald-500")}>{m.tag}</div>
            <div className={cn("bg-gradient-to-b to-white px-4 py-3 border-b border-slate-200", m.tone)}>
              <div className="text-[10px] text-slate-600 mb-1">寄件者</div>
              <div className="text-xs font-medium break-all">{m.from}</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-sm font-semibold mb-2">{m.subject}</div>
              <div className="text-xs text-slate-700 leading-relaxed">{m.body}</div>
              {m.cta && (
                <button className="mt-3 w-full bg-rose-500 text-white text-xs py-2 rounded font-medium">立即驗證帳號 →</button>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

interface Props {
  onComplete: (score: number, answers: { qid: number; correct: boolean }[]) => void;
  onBack: () => void;
}

export const QuizMode = ({ onComplete, onBack }: Props) => {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ qid: number; correct: boolean }[]>([]);

  const quizQuestions = useMemo(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  const q = quizQuestions[idx];
  const isCorrect = answer === q.correct;
  const total = quizQuestions.length;

  const submitAnswer = (val: string) => setAnswer(val);

  const next = () => {
    const updated = [...answers, { qid: q.id, correct: isCorrect }];
    setAnswers(updated);
    setAnswer(null);
    if (idx === total - 1) {
      const score = updated.filter((a) => a.correct).length;
      onComplete(score, updated);
    } else {
      setIdx(idx + 1);
    }
  };

  const ChannelIcon = q.channelIcon;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
            <ChevronLeft className="w-4 h-4" /> 返回首頁
          </button>
          <DemoBadge />
        </div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
          {/* Left: Mockup — 問題區（深色舞台、暖色強調） */}
          <div
            className="panel panel-corners p-6 md:p-8 flex flex-col border-amber-500/30 relative"
            style={{ background: "linear-gradient(180deg, hsl(30 30% 6% / 0.6), hsl(220 50% 5% / 0.8))" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono tracking-widest">
                <HelpCircle className="w-3.5 h-3.5" /> QUESTION · 問題區
              </div>
              <div className="font-mono text-sm text-muted-foreground">
                第 <span className="text-amber-400 font-bold text-base">{String(idx + 1).padStart(2, "0")}</span> / {String(total).padStart(2, "0")} 題
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <ChannelIcon className="w-5 h-5 text-amber-400" /> 來源管道：<b className="text-foreground/90">{q.channel}</b>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-snug tracking-wide">{q.title}</h2>

            <div className="flex-1 flex items-center justify-center py-10 relative overflow-hidden rounded-lg" style={{ background: "radial-gradient(ellipse at center, hsl(220 50% 8%) 0%, hsl(220 60% 4%) 100%)" }}>
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="scanline" />
              <div className="relative animate-scale-in">{q.render()}</div>
            </div>

            {/* Progress */}
            <div className="mt-6 flex gap-1.5">
              {quizQuestions.map((_, i) => (
                <div key={i} className={cn("h-1 flex-1 rounded-full transition", i < idx ? "bg-amber-400" : i === idx ? "bg-amber-400/60" : "bg-amber-400/15")} />
              ))}
            </div>
          </div>

          {/* Right: answer / analysis — 回答區（青色科技感） */}
          <Panel className="p-6 md:p-8 flex flex-col border-primary/40" glow>
            {!answer ? (
              <>
                <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary text-xs font-mono tracking-widest mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> ANSWER · 您的判斷
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-wide">這是真的、假的，還是不確定？</h3>
                <p className="text-muted-foreground text-base mb-6 leading-relaxed">仔細觀察左側的訊息來源、網址、用詞與發送方式，再做出判斷。</p>

                <div className="space-y-3 mt-auto">
                  {q.kind === "single" ? (
                    <>
                      <AnswerButton onClick={() => submitAnswer("real")} tone="success" label="真的 · 正常通知" sub="這是合法的官方訊息" />
                      <AnswerButton onClick={() => submitAnswer("fake")} tone="danger" label="假的 · 是詐騙" sub="這是釣魚／詐騙訊息" />
                      <AnswerButton onClick={() => submitAnswer("unsure")} tone="muted" label="不確定" sub="需要更多資訊判斷" />
                    </>
                  ) : (
                    <>
                      <AnswerButton onClick={() => submitAnswer("both-real")} tone="success" label="兩封都是真的" />
                      <AnswerButton onClick={() => submitAnswer("both-fake")} tone="danger" label="兩封都是假的" />
                      <AnswerButton onClick={() => submitAnswer("a-real-b-fake")} tone="primary" label="A 真 · B 假" />
                      <AnswerButton onClick={() => submitAnswer("a-fake-b-real")} tone="primary" label="A 假 · B 真" />
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="animate-fade-in flex flex-col h-full">
                <TechLabel className="mb-3">CityGPT 即時分析</TechLabel>

                <div className={cn("rounded-lg p-4 mb-5 border", isCorrect ? "border-success/40 bg-success/5" : "border-danger/40 bg-danger/5")}>
                  <div className="flex items-center gap-3 mb-2">
                    {isCorrect ? <CheckCircle2 className="w-6 h-6 text-success" /> : <AlertTriangle className="w-6 h-6 text-danger" />}
                    <div className="font-bold text-lg">{isCorrect ? "判斷正確" : "判斷錯誤"}</div>
                    <span className={cn("ml-auto font-mono text-xs px-2 py-1 rounded border",
                      q.risk === "HIGH" ? "border-danger/50 text-danger bg-danger/10" :
                      q.risk === "MEDIUM" ? "border-warning/50 text-warning bg-warning/10" : "border-success/50 text-success bg-success/10")}>
                      RISK · {q.risk}
                    </span>
                  </div>
                  <div className="text-sm">CityGPT 判定：<b className="text-primary">{q.verdictLabel}</b></div>
                </div>

                <div className="mb-5">
                  <div className="tech-label mb-2">說明 / EXPLANATION</div>
                  <p className="text-sm leading-relaxed text-foreground/90">{q.explanation}</p>
                </div>

                <div className="mb-6">
                  <div className="tech-label mb-3">識詐證據 / EVIDENCE</div>
                  <ul className="space-y-2">
                    {q.evidence.map((e, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <ShieldAlert className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="font-mono text-xs text-foreground/80 leading-relaxed">{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={next} className="mt-auto h-12 font-medium text-base" style={{ background: "var(--gradient-primary)", boxShadow: "var(--glow-cyan)" }}>
                  {idx === questions.length - 1 ? "查看測驗結果" : "下一題"} <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

const AnswerButton = ({ onClick, label, sub, tone }: { onClick: () => void; label: string; sub?: string; tone: "success" | "danger" | "primary" | "muted" }) => {
  const styles: Record<string, string> = {
    success: "border-success/40 hover:border-success hover:bg-success/10 hover:shadow-[0_0_20px_hsl(var(--success)/0.3)]",
    danger: "border-danger/40 hover:border-danger hover:bg-danger/10 hover:shadow-[0_0_20px_hsl(var(--danger)/0.3)]",
    primary: "border-primary/40 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
    muted: "border-muted-foreground/30 hover:border-muted-foreground hover:bg-muted/40",
  };
  return (
    <button onClick={onClick} className={cn("w-full text-left p-4 rounded-lg border-2 bg-card/40 transition-all duration-200", styles[tone])}>
      <div className="font-bold text-base">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </button>
  );
};
