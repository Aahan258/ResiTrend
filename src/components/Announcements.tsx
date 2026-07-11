import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { Megaphone, Calendar, AlertCircle, Filter, BookOpen } from "lucide-react";
import { Announcement, AnnouncementCategory } from "../types";

export const Announcements: React.FC = () => {
  const { announcements } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [isSaturdayMode, setIsSaturdayMode] = useState<boolean>(() => {
    return localStorage.getItem("saturday_simulation_active") === "true";
  });

  useEffect(() => {
    const handleModeChange = () => {
      setIsSaturdayMode(localStorage.getItem("saturday_simulation_active") === "true");
    };
    window.addEventListener("saturday_mode_change", handleModeChange);
    return () => window.removeEventListener("saturday_mode_change", handleModeChange);
  }, []);

  const categories: { id: string; label: string; color: string }[] = [
    { id: "all", label: "All Board Items", color: "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300" },
    { id: "Academic Events", label: "Academic Events", color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40" },
    { id: "Grand Rounds", label: "Grand Rounds", color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40" },
    { id: "Workshops", label: "Workshops", color: "bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-400 border-purple-100 dark:border-purple-900/40" },
    { id: "Conferences", label: "Conferences", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-100 dark:border-amber-900/40" },
    { id: "Deadlines", label: "Deadlines", color: "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-red-100 dark:border-red-900/40 font-bold" }
  ];

  const rawFiltered = announcements.filter(item => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const filteredAnnouncements = useMemo(() => {
    if (!isSaturdayMode) return rawFiltered;
    if (selectedCategory !== "all" && selectedCategory !== "Academic Events") return rawFiltered;

    const saturdayAnn: Announcement = {
      id: "ann_saturday_sim",
      title: "📢 Official Weekly Saturday Clinical Quiz is Live!",
      content: `All residents (JRs and SRs) are required to participate in this week's standardized Saturday Clinical Quiz.\n\nTheme: Refractive Surgery\nSubtopics: Wavefront Sensing, SMILE, Mitomycin C (MMC), Monovision LASIK, Ectasia, PRK Haze.\n\nCompleting this quiz will award up to +150 Merit Points (Academic XP) and update your ranking in the Clinical Excellence Leaderboard in real-time. Please visit the Quiz Room (Core Learning tab) to complete your evaluation.`,
      category: "Academic Events",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      authorId: "faculty_office",
      authorName: "Faculty Academic Office"
    };

    return [saturdayAnn, ...rawFiltered];
  }, [rawFiltered, isSaturdayMode, selectedCategory]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white" id="announcements_panel">
      {/* Introduction Hero */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <Megaphone className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <h1 className="text-base font-bold text-slate-950 dark:text-white tracking-tight leading-none font-sans">Institution Notice Board</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-2.5 max-w-2xl leading-relaxed">
          Official academic timetables, Grand Rounds assemblies, clinical workspace updates, and conference schedules verified by the clinical program administration.
        </p>
      </div>

      {/* Category selection bar */}
      <div className="flex flex-wrap items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 gap-2 overflow-x-auto shadow-sm">
        {categories.map((c) => {
          const isActive = selectedCategory === c.id;
          const count = c.id === "all" ? announcements.length : announcements.filter(a => a.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <span>{c.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-indigo-600 text-white font-bold" : "bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Announcements Timeline List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 dark:text-slate-500 text-xs shadow-sm">
            No notification bulletins posted for this category.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((ann) => {
              const catConfig = categories.find(c => c.id === ann.category);
              return (
                <div key={ann.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono tracking-widest font-bold uppercase border ${catConfig?.color || "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300"}`}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" /> Event Date: {ann.date}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      Posted by: {ann.authorName || "Faculty Office"}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight leading-snug font-sans">{ann.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-2.5 leading-relaxed font-light whitespace-pre-line">{ann.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
