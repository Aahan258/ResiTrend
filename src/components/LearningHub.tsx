import React, { useState, useEffect, useMemo } from "react";
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Zap, 
  HelpCircle, 
  Award, 
  Flame, 
  Sparkles,
  BookOpen,
  Info,
  Calendar,
  Trophy,
  Volume2,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Users,
  Compass,
  CheckCircle2,
  Bell
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { QUIZ_QUESTIONS, QuizQuestion } from "../data/quizQuestions";

interface ScoreRecord {
  uid: string;
  name: string;
  year: string;
  score: number;
  total: number;
  time: string;
  avatar: string;
}

export const LearningHub: React.FC = () => {
  const { profile, addAchievement } = useAuth();
  
  // Saturday mode state (persisted in localStorage to sync globally with other panels)
  const [isSaturdayMode, setIsSaturdayMode] = useState<boolean>(() => {
    return localStorage.getItem("saturday_simulation_active") === "true";
  });

  // Track if user completed this Saturday's quiz
  const [saturdayCompleted, setSaturdayCompleted] = useState<boolean>(() => {
    return localStorage.getItem(`saturday_quiz_completed_${profile?.uid || "guest"}`) === "true";
  });

  const [saturdayScore, setSaturdayScore] = useState<number>(() => {
    return Number(localStorage.getItem(`saturday_quiz_score_${profile?.uid || "guest"}`) || "0");
  });

  // Category filtering for self-study mode
  const allTags = useMemo(() => {
    return Array.from(new Set(QUIZ_QUESTIONS.map(q => q.tag))).filter(Boolean);
  }, []);

  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedSubtag, setSelectedSubtag] = useState<string>("all");

  const subtagsForTag = useMemo(() => {
    if (selectedTag === "all") return [];
    return Array.from(
      new Set(
        QUIZ_QUESTIONS
          .filter(q => q.tag === selectedTag)
          .map(q => q.subtag)
          .filter(Boolean)
      )
    );
  }, [selectedTag]);

  // Handle Tag change
  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setSelectedSubtag("all");
  };

  // Determine Saturday Quiz Settings
  const saturdayTag = "Refractive Surgery"; // This week's core saturday evaluation theme!
  
  // Filter questions based on active mode
  const activeQuestions = useMemo<QuizQuestion[]>(() => {
    if (isSaturdayMode) {
      // Pull questions specifically from the Saturday theme
      const list = QUIZ_QUESTIONS.filter(q => q.tag === saturdayTag);
      return list.length > 0 ? list.slice(0, 5) : QUIZ_QUESTIONS.slice(0, 5);
    } else {
      // Self-study mode filtering
      let list = QUIZ_QUESTIONS;
      if (selectedTag !== "all") {
        list = list.filter(q => q.tag === selectedTag);
        if (selectedSubtag !== "all") {
          list = list.filter(q => q.subtag === selectedSubtag);
        }
      }
      // Shuffle/take 5 for optimal attention span
      return list.slice(0, 5);
    }
  }, [isSaturdayMode, selectedTag, selectedSubtag]);

  // Quiz running states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // Simulated static Saturday leaderboard for peers
  const initialPeerScores: ScoreRecord[] = [
    { uid: "peer_sneha", name: "Dr. Sneha Sharma", year: "Junior Resident (Y1)", score: 5, total: 5, time: "09:42 AM", avatar: "S" },
    { uid: "peer_priya", name: "Dr. Priya Nair", year: "Junior Resident (Y3)", score: 4, total: 5, time: "10:15 AM", avatar: "P" },
    { uid: "peer_rohan", name: "Dr. Rohan Mehta", year: "Junior Resident (Y2)", score: 3, total: 5, time: "08:30 AM", avatar: "R" },
    { uid: "peer_ganguly", name: "Dr. Ananya Sen", year: "Senior Resident (Cornea)", score: 4, total: 5, time: "11:02 AM", avatar: "A" }
  ];

  const [peerScores, setPeerScores] = useState<ScoreRecord[]>(() => {
    const cached = localStorage.getItem("saturday_leaderboard_data");
    if (cached) return JSON.parse(cached);
    return initialPeerScores;
  });

  const saturdayLeaderboardSorted = useMemo(() => {
    let list = [...peerScores];
    // Add user's score if completed
    if (saturdayCompleted && profile) {
      const userRecord: ScoreRecord = {
        uid: profile.uid,
        name: profile.displayName,
        year: profile.year,
        score: saturdayScore,
        total: 5,
        time: "Just Now",
        avatar: profile.displayName[0]
      };
      // Prevent duplicates
      list = list.filter(r => r.uid !== profile.uid);
      list.push(userRecord);
    }
    return list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time.localeCompare(b.time); // faster time wins tie-break
    });
  }, [peerScores, saturdayCompleted, saturdayScore, profile]);

  const toggleSaturdayMode = () => {
    const nextVal = !isSaturdayMode;
    setIsSaturdayMode(nextVal);
    localStorage.setItem("saturday_simulation_active", String(nextVal));
    
    // Trigger global event for header and dashboard banners
    window.dispatchEvent(new Event("saturday_mode_change"));

    // Reset current quiz states to accommodate fresh mode swap
    handleRestart();
  };

  const handleSelectOption = (opt: "A" | "B" | "C" | "D") => {
    if (hasSubmitted) return;
    setSelectedOpt(opt);
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null || hasSubmitted) return;
    setHasSubmitted(true);
    
    const currentQuestion = activeQuestions[currentIdx];
    const isCorrect = selectedOpt === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setXpGained(prev => prev + 25);
    }
  };

  const handleNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setHasSubmitted(false);
    } else {
      setQuizFinished(true);

      const finalScore = score + (selectedOpt === activeQuestions[currentIdx].correctAnswer ? 1 : 0);
      const totalCount = activeQuestions.length;
      const pct = Math.round((finalScore / totalCount) * 100);

      // Handle custom points & merits
      if (isSaturdayMode) {
        setSaturdayCompleted(true);
        setSaturdayScore(finalScore);
        localStorage.setItem(`saturday_quiz_completed_${profile?.uid || "guest"}`, "true");
        localStorage.setItem(`saturday_quiz_score_${profile?.uid || "guest"}`, String(finalScore));

        // Create official high-yielding Verified Academic Achievement for Merit
        const xpEarned = finalScore * 30 + (finalScore === 5 ? 100 : 0); // +30 XP per question, +100 XP perfect score!
        addAchievement(
          `Scored ${finalScore}/${totalCount} (${pct}%) on Weekly Saturday Board Quiz [Theme: ${saturdayTag}]`,
          "Academic Achievement",
          new Date().toISOString().split("T")[0],
          ""
        );

        // Dispatches custom event so AuthContext can automatically trigger score update or visual celebration
        window.dispatchEvent(new CustomEvent("saturday_quiz_submitted", { detail: { score: finalScore, xp: xpEarned } }));
      } else {
        // Self-Study Achievement
        addAchievement(
          `Self-Study Evaluation - ${selectedTag !== "all" ? selectedTag : "General"}: ${finalScore}/${totalCount} (${pct}%)`,
          "Academic Achievement",
          new Date().toISOString().split("T")[0],
          ""
        );
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setHasSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setXpGained(0);
  };

  const currentQuestion = activeQuestions[currentIdx];

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white font-sans" id="quiz_center_container">
      
      {/* Dynamic Schedule Banner & Simulation Controller */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-sm font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 font-mono">Academic Quiz & Evaluation Center</h1>
          </div>
          <p className="text-slate-600 dark:text-white/60 text-xs max-w-xl leading-relaxed">
            Participate in standardized, high-yield boards quizzes mapped by tag categories. Every Saturday clinical evaluation results directly influence resident merit ranks!
          </p>
        </div>

        {/* Saturday Simulation Trigger (Fulfilling USER INTENT of testing scheduling) */}
        <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-white/5 p-3 rounded-xl flex items-center justify-between gap-4 w-full md:w-auto self-stretch md:self-auto shrink-0 shadow-sm hover:border-slate-300 dark:hover:border-white/10 transition">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono font-black tracking-wider block text-slate-400 dark:text-white/40">Weekly Routine</span>
            <span className="text-xs text-slate-700 dark:text-white/80 font-bold block">Saturday Evaluation Mode</span>
          </div>
          <button
            onClick={toggleSaturdayMode}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isSaturdayMode 
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-zinc-950" 
                : "bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10"
            }`}
          >
            {isSaturdayMode ? "🔴 Saturday Simulated (LIVE)" : "⚙️ Activate Saturday Mode"}
          </button>
        </div>
      </div>

      {/* Main Grid: Quiz Module vs Sidebar Analytics & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: ACTIVE QUIZ CANVAS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Mode Notice Block */}
          {isSaturdayMode ? (
            <div className="bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 p-4 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Bell className="h-4.5 w-4.5 animate-bounce" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-teal-500 text-zinc-950 font-bold uppercase tracking-wider font-mono px-1 rounded-sm">Official</span>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white font-sans">Saturday Clinical evaluation is Live</h3>
                  </div>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400/80 font-mono">Theme: {saturdayTag} • Target: 5 Cases • Dynamic Merit Activated</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-450 dark:text-white/40 font-mono hidden sm:block">Closes in 18 hrs</span>
            </div>
          ) : (
            /* Self-Study Filter controls */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                <span className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-slate-400 dark:text-white/40" /> Self-Study Practice Mode
                </span>
                <span className="text-[10px] text-slate-400 dark:text-white/40 font-mono">Select category to begin custom quiz</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-450 dark:text-white/40">Specialty Area (Tag)</label>
                  <select
                    value={selectedTag}
                    onChange={(e) => handleTagChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 transition"
                  >
                    <option value="all">All Specialties ({QUIZ_QUESTIONS.length} Questions)</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-450 dark:text-white/40">Subspecialty Topic (Subtag)</label>
                  <select
                    value={selectedSubtag}
                    onChange={(e) => setSelectedSubtag(e.target.value)}
                    disabled={selectedTag === "all"}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white disabled:opacity-40 focus:outline-none focus:border-teal-500 transition"
                  >
                    <option value="all">All Subtags</option>
                    {subtagsForTag.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Core Quiz Module Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden min-h-[380px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.03),transparent_70%)] pointer-events-none" />
            
            {/* Saturday quiz already completed state */}
            {isSaturdayMode && saturdayCompleted && !quizFinished ? (
              <div className="text-center py-12 space-y-4 my-auto animate-fade-in">
                <div className="h-14 w-14 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-2xl text-teal-500 dark:text-teal-400 animate-pulse">
                  ✓
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Saturday Assessment Filed Successfully</h2>
                <p className="text-xs text-slate-500 dark:text-white/50 max-w-sm mx-auto leading-relaxed">
                  You scored <strong className="text-slate-900 dark:text-white font-mono">{saturdayScore}/5</strong> and earned up to <strong className="text-teal-600 dark:text-teal-400 font-mono">+{saturdayScore * 30 + (saturdayScore === 5 ? 100 : 0)} Merit Points</strong>! Complete peer validation to secure your final ranking.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSaturdayCompleted(false);
                      handleRestart();
                    }}
                    className="text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white font-mono text-[10px] uppercase tracking-wider underline transition cursor-pointer"
                  >
                    Simulate Retake (For Testing Only)
                  </button>
                </div>
              </div>
            ) : quizFinished ? (
              /* Quiz Score Summary Screen */
              <div className="text-center py-8 space-y-4 my-auto animate-fade-in">
                <div className="h-16 w-14 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-3xl">
                  🏆
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Clinical Evaluation Filed!</h2>
                  <p className="text-xs font-mono text-teal-600 dark:text-teal-400">Score: {score} of {activeQuestions.length} correct</p>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-white/50 max-w-sm mx-auto leading-relaxed">
                  You generated <strong className="text-slate-900 dark:text-white font-mono">+{score * 25} Academic XP</strong> directly in your student profile CV. This dynamic merit shift is actively recorded on the clinical notice board!
                </p>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleRestart}
                    className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" /> Start Practice Quiz
                  </button>
                </div>
              </div>
            ) : activeQuestions.length === 0 ? (
              <div className="text-center py-16 my-auto text-slate-400 dark:text-white/30 text-xs font-mono space-y-2">
                <Search className="h-8 w-8 mx-auto opacity-35" />
                <p>No high-yield boards questions found for the selected category.</p>
              </div>
            ) : (
              /* Quiz active gameplay */
              <div className="space-y-5 animate-fade-in flex-1 flex flex-col justify-between">
                
                {/* Topic header & metadata */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase font-black tracking-widest block">Question {currentIdx + 1} of {activeQuestions.length}</span>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold leading-none block">{currentQuestion.tag} &gt; {currentQuestion.subtag}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-white/50">
                    High Yield
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white/95 leading-relaxed">{currentQuestion.question}</p>

                {/* Options list */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const optionChar = ["A", "B", "C", "D"][idx] as "A" | "B" | "C" | "D";
                    const isSelected = selectedOpt === optionChar;
                    const isCorrect = optionChar === currentQuestion.correctAnswer;
                    
                    let cardStyle = "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80";
                    if (isSelected && !hasSubmitted) {
                      cardStyle = "border-teal-500/40 bg-teal-500/5 text-teal-700 dark:text-teal-300";
                    } else if (hasSubmitted) {
                      if (isCorrect) {
                        cardStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium";
                      } else if (isSelected) {
                        cardStyle = "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300";
                      } else {
                        cardStyle = "border-slate-150 dark:border-white/5 bg-slate-50/20 dark:bg-white/[0.01] opacity-40 text-slate-400 dark:text-white/40";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(optionChar)}
                        disabled={hasSubmitted}
                        className={`w-full flex items-center gap-3.5 text-left p-3.5 rounded-xl border text-xs transition duration-150 cursor-pointer ${cardStyle}`}
                      >
                        <div className={`h-6 w-6 rounded-lg font-bold flex items-center justify-center font-mono shrink-0 ${
                          isSelected && !hasSubmitted
                            ? "bg-teal-500/20 text-teal-600 dark:text-teal-400"
                            : hasSubmitted && isCorrect
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : hasSubmitted && isSelected
                                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                                : "bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-white/40"
                        }`}>
                          {optionChar}
                        </div>
                        <span className="flex-1 font-light leading-snug">{opt}</span>
                        {hasSubmitted && isCorrect && <CheckCircle className="h-4.5 w-4.5 text-emerald-500 dark:text-emerald-400 shrink-0" />}
                        {hasSubmitted && isSelected && !isCorrect && <XCircle className="h-4.5 w-4.5 text-rose-500 dark:text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Question Footers, lock / check controls */}
                <div className="pt-4 border-t border-slate-150 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex-1">
                    {hasSubmitted && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Correct Answer: Option {currentQuestion.correctAnswer}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    {!hasSubmitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOpt === null}
                        className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-zinc-950 font-bold px-6 py-2 rounded-xl text-xs transition cursor-pointer self-end w-full sm:w-auto"
                      >
                        Submit Lock Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-white/90 text-white dark:text-zinc-950 font-bold px-6 py-2 rounded-xl text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                      >
                        {currentIdx < activeQuestions.length - 1 ? "Next Case" : "Complete Evaluation"} <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Explanation Drawer */}
                {hasSubmitted && (
                  <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-white/5 p-4 rounded-xl text-[11px] text-slate-600 dark:text-white/60 leading-relaxed space-y-1.5 animate-fade-in shrink-0 font-sans">
                    <span className="text-[9px] font-mono text-slate-400 dark:text-white/40 uppercase font-black tracking-widest flex items-center gap-1">
                      <Info className="h-3 w-3 text-teal-600 dark:text-teal-400" /> Clinical Pathology Discussion
                    </span>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Right Column: RANKINGS & NOTICE BULLETIN BOARD */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Saturday Board Quiz Rankings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-yellow-500 dark:text-yellow-400" /> Saturday merit board
              </h2>
              <span className="text-[9px] font-mono text-slate-400 dark:text-white/30 uppercase tracking-wider font-black">Refractive</span>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-white/55 leading-normal">
              Weekly Saturday rankings of all registered residents based on evaluation scores.
            </p>

            <div className="space-y-2">
              {saturdayLeaderboardSorted.map((record, index) => {
                const isUser = record.uid === profile?.uid;
                const isFirst = index === 0;
                
                return (
                  <div 
                    key={record.uid} 
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      isUser 
                        ? "bg-teal-500/10 border-teal-500/20 text-slate-900 dark:text-white" 
                        : "bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-white/5 text-slate-700 dark:text-white/80 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-5 flex justify-center shrink-0">
                        {isFirst ? (
                          <span className="text-yellow-500 dark:text-yellow-400 text-xs">👑</span>
                        ) : (
                          <span className="font-mono text-[10px] text-slate-400 dark:text-white/40 font-bold">{index + 1}</span>
                        )}
                      </div>
                      
                      {/* Avatar */}
                      <div className={`h-6.5 w-6.5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                        isUser 
                          ? "bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30" 
                          : "bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-white/60 border-slate-300 dark:border-white/5"
                      }`}>
                        {record.avatar}
                      </div>

                      <div className="truncate">
                        <span className="block font-bold truncate leading-none">{record.name}</span>
                        <span className="text-[9px] text-slate-400 dark:text-white/40 block font-mono truncate">{record.year.split(" (")[0]}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`block font-mono font-bold leading-none ${isUser ? "text-teal-600 dark:text-teal-400" : "text-slate-800 dark:text-white/90"}`}>
                        {record.score} / {record.total}
                      </span>
                      <span className="text-[8px] text-slate-400 dark:text-white/30 block font-mono mt-0.5">{record.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Saturday Reminders & Academic Guidelines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Evaluation Guidelines
            </h2>

            <ul className="space-y-2 text-[11px] text-slate-600 dark:text-white/60 leading-relaxed font-light list-inside list-disc">
              <li>Saturday quizzes close every Saturday at 11:59 PM.</li>
              <li>A score of 4 or 5 is required to secure positive academic XP.</li>
              <li>Scores are immediately indexed and broadcasted to the leaderboards.</li>
              <li>Self-Study quizzes can be taken unlimited times for private revision.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

// Helper for option letters
function optionChar(idx: number): string {
  return ["A", "B", "C", "D"][idx];
}
