import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Trophy, Award, LifeBuoy, Heart, TrendingUp, Lightbulb, Users, Crown, Sparkles } from "lucide-react";
import { Profile } from "../types";

export const LeaderboardsComponent: React.FC = () => {
  const { profiles, achievements } = useAuth();
  
  // Tab states: academic, teaching, innovation, appreciated, rising
  const [activeLeaderboard, setActiveLeaderboard] = useState<"academic" | "teaching" | "innovation" | "appreciated" | "rising">("academic");

  // Multi-leaderboards sorting algorithms
  
  // 1. Academic Legends (sorted by total verified + community achievements, or academicXp)
  const academicLegends = [...profiles].sort((a, b) => b.academicXp - a.academicXp);

  // 2. Teaching Champions (sorted by teachingXp)
  const teachingChampions = [...profiles].sort((a, b) => b.teachingXp - a.teachingXp);

  // 3. Innovation Leaders (sorted by innovationXp)
  const innovationLeaders = [...profiles].sort((a, b) => b.innovationXp - a.innovationXp);

  // 4. Most Appreciated Residents (sorted by silentApplauseCount)
  const mostAppreciated = [...profiles].sort((a, b) => b.silentApplauseCount - a.silentApplauseCount);

  // 5. Rising Contributors (Junior Residents Y1/Y2/Y3 sorted by totalXp)
  const risingContributors = [...profiles]
    .filter(p => p.year.includes("Y1") || p.year.includes("Y2") || p.year.includes("Y3"))
    .sort((a, b) => b.totalXp - a.totalXp);

  const boards = [
    { id: "academic", label: "Academic Legends", icon: Award, desc: "Leading clinical research, conference presentations, and publications", data: academicLegends, xpField: "academicXp" },
    { id: "teaching", label: "Teaching Champions", icon: Users, desc: "Highly rated in peer instructions, ophthalmology case guidance", data: teachingChampions, xpField: "teachingXp" },
    { id: "innovation", label: "Innovation Leaders", icon: Lightbulb, desc: "Pioneering clinical software, 3D printing and clinic flows", data: innovationLeaders, xpField: "innovationXp" },
    { id: "appreciated", label: "Most Appreciated", icon: Heart, desc: "Silent Applause emergency support, teamwork, and clinical aid", data: mostAppreciated, xpField: "silentApplauseCount" },
    { id: "rising", label: "Rising Contributors", icon: TrendingUp, desc: "Outstanding Junior Residents (Y1, Y2 & Y3) making swift headway", data: risingContributors, xpField: "totalXp" }
  ];

  const currentBoard = boards.find(b => b.id === activeLeaderboard)!;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white" id="leaderboards_panel">
      {/* Introduction Hero */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <h1 className="text-base font-bold text-slate-950 dark:text-white tracking-tight leading-none font-sans">Clinical Excellence Leaderboards</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-2.5 max-w-2xl leading-relaxed">
          Celebrating professional capability rather than basic gamification. ResiTrend profiles achievements across distinct operational categories, ensuring every resident's contribution is highlighted under their specific strength.
        </p>
      </div>

      {/* Grid of Board Category Selection triggers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {boards.map((b) => {
          const Icon = b.icon;
          const isActive = activeLeaderboard === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setActiveLeaderboard(b.id as any)}
              className={`p-4 rounded-xl border text-left transition relative overflow-hidden cursor-pointer ${
                isActive 
                  ? "bg-indigo-500 text-white border-indigo-400 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-400/20" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100 dark:border-slate-800/40">
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                <span className={`text-[10px] font-mono ${isActive ? "text-indigo-100/75" : "text-slate-400/80 dark:text-slate-500"}`}>Board</span>
              </div>
              <span className={`block text-xs font-bold leading-none ${isActive ? "text-white" : "text-slate-800 dark:text-slate-250"}`}>{b.label}</span>
              <span className={`block text-[9px] mt-1 leading-normal truncate ${isActive ? "text-indigo-100/75" : "text-slate-400 dark:text-slate-500"}`}>{b.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Main classified leaderboard table display card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-1.5 leading-none font-sans">
            {currentBoard.label} Register
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 font-light">
            {currentBoard.desc}
          </p>
        </div>

        {currentBoard.data.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 text-xs font-mono py-12">No residents cataloged under this segment yet.</p>
        ) : (
          <div className="space-y-2.5">
            {currentBoard.data.map((res: Profile, index: number) => {
              const isFirst = index === 0;
              const val = res[currentBoard.xpField as keyof Profile];
              const scoreLabel = activeLeaderboard === "appreciated" 
                ? `${val} Applause` 
                : activeLeaderboard === "academic"
                ? `${val} Acad XP`
                : activeLeaderboard === "teaching"
                ? `${val} Teach XP`
                : activeLeaderboard === "innovation"
                ? `${val} Innov XP`
                : `${val} Total XP`;

              return (
                <div 
                  key={res.uid}
                  className={`border p-3.5 rounded-xl flex items-center justify-between gap-4 transition ${
                    isFirst 
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 shadow-sm" 
                      : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-750"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full max-w-md truncate">
                    {/* Rank indicator with Crown / Sparkles style */}
                    <div className="w-8 flex justify-center shrink-0">
                      {isFirst ? (
                        <Crown className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
                      ) : (
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 font-bold">{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar box */}
                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-950 border border-slate-300/50 dark:border-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-400 shrink-0">
                      {res.displayName[0]}
                    </div>

                    {/* Name block */}
                    <div className="truncate">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-none font-sans">{res.displayName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">{res.year}</span>
                    </div>
                  </div>

                  {/* Right: Score Metrics display */}
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-mono">
                      {res.reputationLevel}
                    </span>
                    <span className={`text-xs font-mono font-bold leading-none select-none text-right min-w-[70px] ${
                      isFirst ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
                    }`}>
                      {scoreLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
