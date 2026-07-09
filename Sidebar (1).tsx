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
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

// Grouped nav — reduces cognitive load by chunking 6 pillars into 2 clear buckets.
const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Portfolio",
    items: [
      { id: "impact", label: "Hall of Impact", icon: Award, description: "Living CV & timeline" },
      { id: "leaderboards", label: "Leaderboards", icon: Trophy, description: "Cohort standings" },
    ],
  },
  {
    label: "Community",
    items: [
      { id: "applause", label: "Silent Applause", icon: Heart, description: "Anonymous kudos" },
      { id: "endorsements", label: "Endorsements", icon: CheckCircle, description: "Peer skill reviews" },
      { id: "innovation", label: "Innovation Hub", icon: Lightbulb, description: "Improvement ideas" },
      { id: "announcements", label: "Announcements", icon: Megaphone, description: "Rounds & deadlines" },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin, profile } = useAuth();

  const xpToNext = profile ? 300 - (profile.totalXp % 300) : 0;
  const xpProgress = profile ? Math.min((profile.totalXp % 300) / 3, 100) : 0;

  return (
    <aside
      className="w-64 shrink-0 border-r border-white/[0.06] bg-[#09090b] min-h-[calc(100vh-73px)] hidden md:flex flex-col justify-between px-3 py-5"
      id="sidebar_nav_wrapper"
    >
      <div className="space-y-6">
        {/* Consolidated profile card — one panel, not two */}
        {profile && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 shrink-0 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono text-[10px] text-emerald-400 font-semibold">
                PRS
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] text-white/40 uppercase font-semibold tracking-[0.14em]">
                  Reputation
                </span>
                <span className="block text-[13px] font-semibold text-white font-display truncate mt-0.5">
                  {profile.reputationLevel}
                </span>
              </div>
            </div>

            {/* XP row — same card, no second bordered box */}
            <div className="mt-3.5 pt-3 border-t border-white/[0.05]">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="flex items-center gap-1 text-white/60">
                  <Zap className="h-2.5 w-2.5 text-amber-400" />
                  {profile.totalXp} XP
                </span>
                <span className="text-white/35">{xpToNext} to next</span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/[0.05] mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/85 transition-[width] duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Grouped navigation */}
        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <span className="px-3 text-[9px] text-white/35 font-semibold uppercase tracking-[0.16em] block mb-1.5 font-display">
                {group.label}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left group lift ${
                      isActive
                        ? "bg-white/[0.07] text-white border border-white/[0.10]"
                        : "text-white/60 hover:text-white hover:bg-white/[0.035] border border-transparent"
                    }`}
                    id={`sidebar_tab_${item.id}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition ${
                        isActive ? "text-white" : "text-white/45 group-hover:text-white/75"
                      }`}
                    />
                    <div className="min-w-0">
                      <span className="block text-[13px] font-medium leading-tight">
                        {item.label}
                      </span>
                      <span className="block text-[10px] text-white/35 leading-none mt-0.5 truncate">
                        {item.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer: admin + settings */}
      <div className="space-y-0.5 pt-4 border-t border-white/[0.06]">
        {isAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left lift ${
              activeTab === "admin"
                ? "bg-white/[0.07] text-white border border-white/[0.10]"
                : "text-white/55 hover:text-white hover:bg-white/[0.035] border border-transparent"
            }`}
            id="sidebar_tab_admin"
          >
            <Sliders className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <span className="block text-[13px] font-medium leading-tight">Founder Panel</span>
              <span className="block text-[10px] text-white/35 leading-none mt-0.5">
                Analytics & seed data
              </span>
            </div>
          </button>
        )}

        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left lift ${
            activeTab === "settings"
              ? "bg-white/[0.07] text-white border border-white/[0.10]"
              : "text-white/55 hover:text-white hover:bg-white/[0.035] border border-transparent"
          }`}
          id="sidebar_tab_settings"
        >
          <Settings className="h-4 w-4 shrink-0 text-white/45" />
          <div className="min-w-0">
            <span className="block text-[13px] font-medium leading-tight">Link Identity</span>
            <span className="block text-[10px] text-white/35 leading-none mt-0.5">
              Scholar, ORCID, bio
            </span>
          </div>
        </button>

        <div className="text-center text-[10px] text-white/25 font-mono mt-4 pt-2">
          ResiTrend · v1.0.0
        </div>
      </div>
    </aside>
  );
};
