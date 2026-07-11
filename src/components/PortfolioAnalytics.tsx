import React from "react";
import { HallOfImpact } from "./HallOfImpact";
import { SurgicalCompetency } from "./SurgicalCompetency";
import { BarChart3 } from "lucide-react";
import { SurgicalLog } from "./Dashboard";

interface PortfolioAnalyticsProps {
  surgicalLogs: SurgicalLog[];
}

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({ surgicalLogs }) => {
  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white" id="portfolio_analytics_workspace">
      {/* Tab Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Professional Portfolio & Living CV
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Review validated clinical milestones, surgical competencies, peer endorsements, and academic contributions
        </p>
      </div>

      {/* Real-time Surgical Competency and Audit Module */}
      <SurgicalCompetency surgicalLogs={surgicalLogs} />

      {/* Render the full comprehensive HallOfImpact which embeds ActivityOverview */}
      <HallOfImpact />
    </div>
  );
};
