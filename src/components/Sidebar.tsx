import React from "react";
import { 
  Award, 
  Heart, 
  CheckCircle, 
  Lightbulb, 
  Trophy, 
  Megaphone, 
  Sliders, 
  Settings,
  Sparkles,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin, profile } = useAuth();

  const navigationItems = [
    { id: "impact", label: "Hall of Impact", icon: Award, description: "Living CV & timeline" },
    { id: "applause", label: "Silent Applause", icon: Heart, description: "Host anonymous praise" },
    { id: "endorsements", label: "Endorsements", icon: CheckCircle, description: "Peer clinical reviews" },
    { id: "innovation", label: "Innovation Hub", icon: Lightbulb, description: "Resident improvement ideas" },
    { id: "leaderboards", label: "Leaderboards", icon: Trophy, description: "Resident legends & risers" },
    { id: "announcements", label: "Announcements", icon: Megaphone, description: "Academic & round logs" },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#09090b] min-h-[calc(100vh-73px)] hidden md:flex flex-col justify-between p-4" id="sidebar_nav_wrapper">
      <div className="space-y-6">
        {/* Short Profile Overview Card */}
        {profile && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 shadow-[0_0_15px_rgba(255,255,255,0.03)]">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono text-[10px] text-emerald-400 font-bold">
                PRS
              </div>
              <div>
                <span className="block text-[10px] text-white/40 uppercase font-bold tracking-wider">Reputation Level</span>
                <span className="block text-xs font-semibold text-white font-sans mt-0.5">{profile.reputationLevel}</span>
              </div>
            </div>

            {/* Micro Progression Bar (XP) */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center text-[10px] text-white/50 font-mono">
                <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5 text-amber-400" /> {profile.totalXp} Total XP</span>
                <span>Level progress</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-1 overflow-hidden border border-white/5">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((profile.totalXp % 300) / 3, 100)}%` }}
                />
              </div>
              <span className="block text-[9px] text-right text-white/40 mt-1">
                {300 - (profile.totalXp % 300)} XP to next landmark
              </span>
            </div>
          </div>
        )}

        {/* Navigation Elements */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-2">Core Operating Pillars</span>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left group ${
                  isActive 
                    ? "bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
                id={`sidebar_tab_${item.id}`}
              >
                <Icon className={`h-4.5 w-4.5 transition ${isActive ? "text-white" : "text-white/40 group-hover:text-white/70"}`} />
                <div>
                  <span className="block text-xs font-medium">{item.label}</span>
                  <span className="block text-[9px] text-white/40 leading-none mt-0.5 font-sans truncate max-w-[150px]">
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation (Admin panel, settings) */}
      <div className="space-y-1.5 pt-4 border-t border-white/10">
        {isAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === "admin" 
                ? "bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
            id="sidebar_tab_admin"
          >
            <Sliders className="h-4 w-4" />
            <div className="flex-1">
              <span className="block text-xs font-semibold">Founder Panel</span>
              <span className="block text-[9px] text-white/40">Auto analytics & metrics</span>
            </div>
          </button>
        )}

        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
            activeTab === "settings" 
              ? "bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
              : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
          id="sidebar_tab_settings"
        >
          <Settings className="h-4 w-4 text-white/40" />
          <div>
            <span className="block text-xs font-medium">Link Identity</span>
            <span className="block text-[9px] text-white/40">Google Scholar, ORCID, bio</span>
          </div>
        </button>

        <div className="text-center text-[10px] text-white/30 font-mono mt-4 pt-2">
          ResiTrend • v1.0.0
        </div>
      </div>
    </aside>
  );
};
