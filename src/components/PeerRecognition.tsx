import React, { useState } from "react";
import { SilentApplause } from "./SilentApplause";
import { EndorsementsComponent } from "./EndorsementsComponent";
import { InnovationHub } from "./InnovationHub";
import { Award, Heart, CheckCircle, Lightbulb, Users, ThumbsUp } from "lucide-react";

export const PeerRecognition: React.FC = () => {
  const [subTab, setSubTab] = useState<"applause" | "endorsements" | "innovation">("endorsements");

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white font-sans" id="peer_recognition_unified_panel">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-rose-500 dark:text-rose-400" /> Peer Recognition & Kudos
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">Strengthen community connections through peer reviews and collective innovations</p>
        </div>

        {/* Mini tabs */}
        <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 self-start sm:self-center">
          <button
            onClick={() => setSubTab("endorsements")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === "endorsements" 
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400" 
                : "text-slate-500 dark:text-white/55 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" /> Endorsements
          </button>
          <button
            onClick={() => setSubTab("applause")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === "applause" 
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400" 
                : "text-slate-500 dark:text-white/55 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            <Heart className="h-3.5 w-3.5" /> Silent Applause
          </button>
          <button
            onClick={() => setSubTab("innovation")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === "innovation" 
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400" 
                : "text-slate-500 dark:text-white/55 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" /> Innovation Hub
          </button>
        </div>
      </div>

      {/* Render subcomponents dynamically with smooth exit-entrance */}
      <div className="animate-fade-in" id="peer_recognition_subworkspace">
        {subTab === "endorsements" && <EndorsementsComponent />}
        {subTab === "applause" && <SilentApplause />}
        {subTab === "innovation" && <InnovationHub />}
      </div>
    </div>
  );
};
