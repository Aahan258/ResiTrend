import React from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, Database, LogOut, TrendingUp } from "lucide-react";

export const Header: React.FC = () => {
  const {
    user,
    profile,
    isAdmin,
    logout,
    bypassAuth,
    isFirebaseActive,
    loginWithGoogle,
  } = useAuth();

  const sandbox: { label: string; onClick: () => void; active: boolean; admin?: boolean }[] = [
    {
      label: "Y2 Rohan",
      onClick: () => bypassAuth("resident", "Dr. Rohan Mehta"),
      active: profile?.displayName === "Dr. Rohan Mehta" && !isAdmin,
    },
    {
      label: "Y3 Priya",
      onClick: () => bypassAuth("resident", "Dr. Priya Nair"),
      active: profile?.displayName === "Dr. Priya Nair",
    },
    {
      label: "Y4 Aahan",
      onClick: () => bypassAuth("resident", "Dr. Aahan Shah"),
      active: profile?.displayName === "Dr. Aahan Shah",
    },
    {
      label: "Admin",
      onClick: () => bypassAuth("admin", "Admin Founder"),
      active: isAdmin,
      admin: true,
    },
  ];

  return (
    <header
      className="border-b border-white/[0.06] bg-[#09090b]/85 backdrop-blur-xl sticky top-0 z-50
                 px-4 sm:px-6 h-[64px] grid grid-cols-[auto_1fr_auto] items-center gap-6"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 shrink-0 rounded-[9px] bg-white flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-[#09090b]" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 leading-none">
          <span className="font-display font-semibold text-[15px] tracking-tight text-white block">
            Resi<span className="text-white/40 font-normal">Trend</span>
          </span>
          <span className="hidden sm:block text-[10px] text-white/35 tracking-[0.14em] uppercase font-medium mt-1">
            Resident Performance Platform
          </span>
        </div>
      </div>

      {/* Center: sandbox switcher — quieter, single row */}
      <div className="hidden lg:flex justify-center">
        <div className="flex items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] p-1">
          <span className="px-3 py-1 font-mono text-[10px] text-white/40 uppercase tracking-[0.14em] border-r border-white/[0.06]">
            Demo
          </span>
          {sandbox.map((s) => (
            <button
              key={s.label}
              onClick={s.onClick}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition flex items-center gap-1 lift ${
                s.active
                  ? "bg-emerald-500/12 text-emerald-300"
                  : "text-white/55 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {s.admin && <Shield className="h-3 w-3" />}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: DB status + user */}
      <div className="flex items-center gap-3 justify-end">
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ${
            isFirebaseActive
              ? "bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-300"
              : "bg-white/[0.03] border-white/[0.06] text-white/45"
          }`}
          title={isFirebaseActive ? "Cloud database live" : "Offline / cached"}
        >
          <Database className="h-3 w-3" />
          <span>{isFirebaseActive ? "Live" : "Cached"}</span>
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              isFirebaseActive ? "bg-emerald-400 animate-pulse" : "bg-white/25"
            }`}
          />
        </div>

        {user ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-right leading-none hidden sm:block min-w-0">
              <span className="block text-[12px] font-semibold text-white truncate max-w-[180px]">
                {profile?.displayName || user.displayName || user.email?.split("@")[0]}
              </span>
              <span className="text-[10px] text-white/45 font-mono mt-1 block">
                {isAdmin ? (
                  <span className="text-emerald-300 inline-flex items-center gap-0.5">
                    <Shield className="h-2.5 w-2.5" /> Founder
                  </span>
                ) : (
                  profile?.year || "Junior Resident"
                )}
              </span>
            </div>

            <div className="h-8 w-8 shrink-0 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center font-semibold text-[11px] text-white overflow-hidden">
              {profile?.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                (profile?.displayName || user.displayName || "?")[4] ||
                (profile?.displayName || user.displayName || "O")[0]
              )}
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] text-white/55 hover:text-white transition lift"
              id="header_logout_btn"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="px-3.5 py-1.5 rounded-lg bg-white text-[#09090b] font-semibold text-xs tracking-tight transition lift"
            id="header_login_btn"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
};
