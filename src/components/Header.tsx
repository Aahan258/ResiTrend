import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, User, Heart, Database, AlertCircle, LogOut, TrendingUp, Sun, Moon, Bell } from "lucide-react";

export const Header: React.FC = () => {
  const { 
    user, 
    profile, 
    isAdmin, 
    logout, 
    bypassAuth, 
    isFirebaseActive,
    loginWithGoogle
  } = useAuth();

  // Theme configuration (Defaults to dark mode per specification)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light"; // Defaults to true if empty, or respects saved preference
  });

  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Helper to fetch unread reminders count
  const updateUnreadCount = () => {
    try {
      const saved = localStorage.getItem(`pulse_reminders_${profile?.uid || "guest"}`);
      if (saved) {
        const list = JSON.parse(saved);
        const count = list.filter((r: any) => !r.isCompleted && !r.isRead).length;
        setUnreadCount(count);
      } else {
        setUnreadCount(2); // Seed default unread count is 2
      }
    } catch (e) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    updateUnreadCount();
    window.addEventListener("reminders-updated", updateUnreadCount);
    window.addEventListener("profile-updated", updateUnreadCount);
    return () => {
      window.removeEventListener("reminders-updated", updateUnreadCount);
      window.removeEventListener("profile-updated", updateUnreadCount);
    };
  }, [profile?.uid]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      {/* Brand Icon & Sub-Title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-[1px] flex items-center justify-center shadow-sm">
          <div className="w-full h-full bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white dark:text-slate-900" />
          </div>
        </div>
        <div>
          <span className="font-sans font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Resi<span className="text-slate-400 dark:text-white/40 font-normal">Trend</span>
          </span>
          <span className="block font-sans text-[10px] text-slate-400 dark:text-white/30 tracking-widest uppercase font-medium">Resident Performance Platform</span>
        </div>
      </div>

      {/* Center Sandbox Simulator Switcher */}
      {user && (
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-full p-1 max-w-xl text-xs">
          <span className="px-3 py-1 font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800">
            Demo Sandbox:
          </span>
          <button 
            onClick={() => bypassAuth("resident", "Dr. Rohan Mehta")}
            className={`px-3 py-1 rounded-full font-medium transition ${
              profile?.displayName === "Dr. Rohan Mehta" && !isAdmin
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" 
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Y2 Rohan
          </button>
          <button 
            onClick={() => bypassAuth("resident", "Dr. Priya Nair")}
            className={`px-3 py-1 rounded-full font-medium transition ${
              profile?.displayName === "Dr. Priya Nair"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" 
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Y3 Priya
          </button>
          <button 
            onClick={() => bypassAuth("resident", "Dr. Aahan Shah")}
            className={`px-3 py-1 rounded-full font-medium transition ${
              profile?.displayName === "Dr. Aahan Shah"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" 
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            SR Glaucoma
          </button>
          <button 
            onClick={() => bypassAuth("admin", "Admin Founder")}
            className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1 ${
              isAdmin
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" 
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Shield className="h-3 w-3" /> Admin Founder
          </button>
        </div>
      )}

      {/* User Actions & DB Connection Status */}
      <div className="flex items-center gap-4">
        {/* Personalized Reminders Bell Icon button */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("set-active-tab", { detail: "notifications" }));
          }}
          className={`h-8 w-8 rounded-full flex items-center justify-center relative transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer shrink-0 ${
            isDark
              ? "bg-slate-800/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white"
              : "bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900"
          }`}
          title="Open Notice Board & Reminders"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white-keep font-mono animate-pulse shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Light/Dark Mode Toggle Switch */}
        <button
          onClick={() => setIsDark(!isDark)}
          id="theme_toggle_btn"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer shrink-0 ${
            isDark
              ? "bg-slate-800/80 backdrop-blur-md border border-slate-700 text-cyan-400 hover:text-cyan-300"
              : "bg-white border border-slate-200 shadow-sm text-amber-500 hover:text-amber-600"
          }`}
        >
          {isDark ? (
            <Moon className="h-4.5 w-4.5 fill-cyan-400/10" />
          ) : (
            <Sun className="h-4.5 w-4.5 fill-amber-500/10 animate-[spin_10s_linear_infinite]" />
          )}
        </button>

        {/* Connection status tag */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono ${
          isFirebaseActive 
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold" 
            : "bg-slate-100 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700/50 text-slate-600 dark:text-zinc-400"
        }`}>
          <Database className="h-3 w-3" />
          <span>{isFirebaseActive ? "DB Live" : "Cached (PWA)"}</span>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isFirebaseActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400 dark:bg-zinc-500"}`} />
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            {/* User profile brief */}
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-900 dark:text-white leading-none">
                {profile?.displayName || user.displayName || user.email?.split("@")[0]}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-end gap-1 mt-0.5">
                {isAdmin ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-semibold">
                    <Shield className="h-2 w-2" /> Founder Admin
                  </span>
                ) : (
                  <span>{profile?.year || "Junior Resident"}</span>
                )}
              </span>
            </div>

            {/* Simulated/Real Avatar */}
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/60 flex items-center justify-center font-semibold text-xs text-slate-700 dark:text-white overflow-hidden shrink-0">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (profile?.displayName || user.displayName || "?")[4] || (profile?.displayName || user.displayName || "O")[0]
              )}
            </div>

            {/* Logout button */}
            <button 
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              id="header_logout_btn"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-medium text-xs tracking-tight transition shadow-md shadow-emerald-500/15 cursor-pointer"
            id="header_login_btn"
          >
            Google Sign In
          </button>
        )}
      </div>
    </header>
  );
};
