import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Megaphone, Calendar, AlertCircle, Filter, BookOpen } from "lucide-react";
import { Announcement, AnnouncementCategory } from "../types";

export const Announcements: React.FC = () => {
  const { announcements } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories: { id: string; label: string; color: string }[] = [
    { id: "all", label: "All Board Items", color: "bg-[#09090b]/80 text-white/80 border-white/10" },
    { id: "Academic Events", label: "Academic Events", color: "bg-white/10 text-white border-white/15 font-semibold" },
    { id: "Grand Rounds", label: "Grand Rounds", color: "bg-white/10 text-white border-white/15 font-semibold" },
    { id: "Workshops", label: "Workshops", color: "bg-white/10 text-white border-white/15 font-semibold" },
    { id: "Conferences", label: "Conferences", color: "bg-white/10 text-white border-white/15 font-semibold" },
    { id: "Deadlines", label: "Deadlines", color: "bg-white/10 text-white border-white/15 font-semibold" }
  ];

  const filteredAnnouncements = announcements.filter(item => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="announcements_panel">
      {/* Introduction Hero */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <Megaphone className="h-5 w-5 text-white" />
          <h1 className="text-base font-bold text-white tracking-tight leading-none font-sans">Institution Notice Board</h1>
        </div>
        <p className="text-white/60 text-xs mt-2.5 max-w-2xl leading-relaxed">
          Official academic timetables, Grand Rounds assemblies, clinical workspace updates, and conference schedules verified by the clinical program administration.
        </p>
      </div>

      {/* Category selection bar */}
      <div className="flex flex-wrap items-center bg-white/5 border border-white/10 rounded-xl p-1.5 gap-2 overflow-x-auto shadow-sm">
        {categories.map((c) => {
          const isActive = selectedCategory === c.id;
          const count = c.id === "all" ? announcements.length : announcements.filter(a => a.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "bg-white/10 text-white border border-white/20 shadow-sm" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              <span>{c.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/10 text-white font-bold" : "bg-white/5 text-white/30"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Announcements Timeline List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-12 text-center text-white/30 text-xs shadow-sm">
            No notification bulletins posted for this category.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((ann) => {
              const catConfig = categories.find(c => c.id === ann.category);
              return (
                <div key={ann.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 mb-2 border-b border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono tracking-widest font-bold uppercase border ${catConfig?.color || "bg-[#09090b] border-white/10 text-white"}`}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Event Date: {ann.date}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">
                      Posted by: {ann.authorName || "Faculty Office"}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-white tracking-tight leading-snug font-sans">{ann.title}</h2>
                  <p className="text-white/70 text-xs mt-2.5 leading-relaxed font-light whitespace-pre-line">{ann.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
