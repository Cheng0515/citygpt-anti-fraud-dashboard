import { useState, useEffect } from "react";
import { HomeScreen } from "@/components/demo/HomeScreen";
import { QuizMode } from "@/components/demo/QuizMode";
import { ResultScreen, ReportPackaging } from "@/components/demo/ResultAndReport";
import { WarRoom } from "@/components/demo/WarRoom";

type Screen = "home" | "quiz" | "result" | "report" | "warroom";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [score, setScore] = useState(0);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [screen]);

  const goHome = () => setScreen("home");

  return (
    <div className="min-h-screen">
      {screen === "home" && <HomeScreen onStart={() => setScreen("quiz")} />}
      {screen === "quiz" && (
        <QuizMode onBack={goHome} onComplete={(s) => { setScore(s); setScreen("result"); }} />
      )}
      {screen === "result" && (
        <ResultScreen score={score} onBack={goHome} onProceed={() => setScreen("report")} />
      )}
      {screen === "report" && <ReportPackaging onDone={() => setScreen("warroom")} />}
      {screen === "warroom" && <WarRoom onBack={goHome} />}
    </div>
  );
};

export default Index;
