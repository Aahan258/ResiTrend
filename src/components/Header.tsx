import React from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, User, Heart, Database, AlertCircle, LogOut, TrendingUp } from "lucide-react";

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

  return (
    <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      {/* Brand Icon & Sub-Title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 p-[1px] flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-[#09090b]" />
          </div>
        </div>
        <div>
          <span className="font-sans font-semibold tracking-tight text-white flex items-center gap-2">
            Resi<span className="text-white/40 font-normal">Trend</span>
          </span>
          <span className="block font-sans text-[10px] text-white/30 tracking-widest uppercase font-medium">Resident Performance Platform</span>
        </div>
      </div>

      {/* Center Sandbox Simulator Switcher */}
      <div className="hidden lg:flex items-center bg-zinc-950/80 border border-zinc-800 rounded-full p-1 max-w-xl text-xs">
        <span className="px-3 py-1 font-mono text-[10px] text-zinc-400 uppercase tracking-wider border-r border-zinc-800">
          Demo Sandbox:
        </span>
        <button 
          onClick={() => bypassAuth("resident", "Dr. Rohan Mehta")}
          className={`px-3 py-1 rounded-full font-medium transition ${
            profile?.displayName === "Dr. Rohan Mehta" && !isAdmin
              ? "bg-emerald-500/10 text-emerald-400" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Y2 Rohan
        </button>
        <button 
          onClick={() => bypassAuth("resident", "Dr. Priya Nair")}
          className={`px-3 py-1 rounded-full font-medium transition ${
            profile?.displayName === "Dr. Priya Nair"
              ? "bg-emerald-500/10 text-emerald-400" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Y3 Priya
        </button>
        <button 
          onClick={() => bypassAuth("resident", "Dr. Aahan Shah")}
          className={`px-3 py-1 rounded-full font-medium transition ${
            profile?.displayName === "Dr. Aahan Shah"
              ? "bg-emerald-500/10 text-emerald-400" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Y4 Aahan
        </button>
        <button 
          onClick={() => bypassAuth("admin", "Admin Founder")}
          className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1 ${
            isAdmin
              ? "bg-emerald-500/10 text-emerald-400" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Shield className="h-3 w-3" /> Admin Founder
        </button>
      </div>

      {/* User Actions & DB Connection Status */}
      <div className="flex items-center gap-4">
        {/* Connection status tag */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono ${
          isFirebaseActive 
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
            : "bg-zinc-800/40 border-zinc-700/50 text-zinc-400"
        }`}>
          <Database className="h-3 w-3" />
          <span>{isFirebaseActive ? "DB Live" : "Cached (PWA)"}</span>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${isFirebaseActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            {/* User profile brief */}
            <div className="text-right">
              <span className="block text-xs font-semibold text-white leading-none">
                {profile?.displayName || user.displayName || user.email?.split("@")[0]}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono flex items-center justify-end gap-1 mt-0.5">
                {isAdmin ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <Shield className="h-2 w-2" /> Founder Admin
                  </span>
                ) : (
                  <span>{profile?.year || "Junior Resident"}</span>
                )}
              </span>
            </div>

            {/* Simulated/Real Avatar */}
            <div className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-zinc-700/60 flex items-center justify-center font-semibold text-xs text-white overflow-hidden shrink-0">
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
              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              id="header_logout_btn"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-medium text-xs tracking-tight transition shadow-md shadow-emerald-500/15"
            id="header_login_btn"
          >
            Google Sign In
          </button>
        )}
      </div>
    </header>
  );
};
