import React from "react";
import { 
  Award,
  Trophy,
  Heart,
  CheckCircle,
  Lightbulb,
  Megaphone,
  Sliders, 
  Settings,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin, profile } = useAuth();

  const portfolioItems = [
    { 
      id: "hall_of_impact", 
      label: "Hall of Impact", 
      icon: Award, 
      description: "Living CV & milestone timeline" 
    },
    { 
      id: "leaderboards", 
      label: "Leaderboards", 
      icon: Trophy, 
      description: "Cohort & national rankings" 
    },
  ];

  const communityItems = [
    { 
      id: "silent_applause", 
      label: "Silent Applause", 
      icon: Heart, 
      description: "Anonymous peer kudos" 
    },
    { 
      id: "endorsements", 
      label: "Endorsements", 
      icon: CheckCircle, 
      description: "Peer skill validations" 
    },
    { 
      id: "innovation_hub", 
      label: "Innovation Hub", 
      icon: Lightbulb, 
      description: "Improvement ideas & votes" 
    },
    { 
      id: "announcements", 
      label: "Announcements", 
      icon: Megaphone, 
      description: "Rounds & deadline notices" 
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[calc(100vh-73px)] hidden md:flex flex-col justify-between p-4" id="sidebar_nav_wrapper">
      <div className="space-y-6">
        {/* Short Profile Overview Card */}
        {profile && (
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                PRS
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Reputation Level</span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-white font-sans mt-0.5">{profile.reputationLevel}</span>
              </div>
            </div>

            {/* Micro Progression Bar (XP) */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-850">
              <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-450 font-mono">
                <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-amber-500 dark:text-amber-400" /> {profile.totalXp} Total XP</span>
                <span>Level progress</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-900 h-1.5 rounded-full mt-1 overflow-hidden border border-slate-300/30 dark:border-zinc-800">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((profile.totalXp % 300) / 3, 100)}%` }}
                />
              </div>
              <span className="block text-[9px] text-right text-slate-400 dark:text-slate-500 mt-1">
                {300 - (profile.totalXp % 300)} XP to next landmark
              </span>
            </div>
          </div>
        )}

        {/* Portfolio Category */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block mb-2">Portfolio</span>
          {portfolioItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left group ${
                  isActive 
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white border border-emerald-500 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white border border-transparent"
                }`}
                id={`sidebar_tab_${item.id}`}
              >
                <Icon className={`h-4.5 w-4.5 transition ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
                <div>
                  <span className={`block text-xs font-semibold ${isActive ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>{item.label}</span>
                  <span className={`block text-[9px] leading-none mt-0.5 font-sans truncate max-w-[150px] ${isActive ? "text-emerald-100/90" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500"}`}>
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Community Category */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block mb-2">Community</span>
          {communityItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left group ${
                  isActive 
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white border border-emerald-500 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white border border-transparent"
                }`}
                id={`sidebar_tab_${item.id}`}
              >
                <Icon className={`h-4.5 w-4.5 transition ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
                <div>
                  <span className={`block text-xs font-semibold ${isActive ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>{item.label}</span>
                  <span className={`block text-[9px] leading-none mt-0.5 font-sans truncate max-w-[150px] ${isActive ? "text-emerald-100/90" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500"}`}>
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Governance Tier (Footer Navigation: Admin panel, Settings) */}
      <div className="space-y-1.5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <span className="px-3 text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block mb-1">Governance</span>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left group ${
              activeTab === "admin" 
                ? "bg-emerald-600 dark:bg-emerald-500 text-white border border-emerald-500 shadow-sm" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white border border-transparent"
            }`}
            id="sidebar_tab_admin"
          >
            <Sliders className={`h-4 w-4 ${activeTab === "admin" ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
            <div className="flex-1">
              <span className={`block text-xs font-semibold ${activeTab === "admin" ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>Founder Panel</span>
              <span className={`block text-[9px] ${activeTab === "admin" ? "text-emerald-100/90" : "text-slate-400 dark:text-slate-500"}`}>Analytics, seeds & users</span>
            </div>
          </button>
        )}

        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left group ${
            activeTab === "settings" 
              ? "bg-emerald-600 dark:bg-emerald-500 text-white border border-emerald-500 shadow-sm" 
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white border border-transparent"
          }`}
          id="sidebar_tab_settings"
        >
          <Settings className={`h-4 w-4 ${activeTab === "settings" ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
          <div>
            <span className={`block text-xs font-semibold ${activeTab === "settings" ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>Link Identity</span>
            <span className={`block text-[9px] ${activeTab === "settings" ? "text-emerald-100/90" : "text-slate-400 dark:text-slate-500"}`}>Google Scholar, ORCID, bio</span>
          </div>
        </button>

        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-4 pt-2">
          ResiTrend • v1.0.0
        </div>
      </div>
    </aside>
  );
};
