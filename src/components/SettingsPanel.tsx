import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sliders, Link, FileText, CheckCircle, HelpCircle, ShieldAlert } from "lucide-react";
import { ResidentYear } from "../types";

export const SettingsPanel: React.FC = () => {
  const { profile, updateProfileLinks, updateProfileBio } = useAuth();

  // Settings states
  const [bio, setBio] = useState(profile?.bio || "");
  const [year, setYear] = useState<ResidentYear>(profile?.year || "Junior Resident (Y1)");
  
  // Links states
  const [googleScholar, setGoogleScholar] = useState(profile?.googleScholar || "");
  const [orcid, setOrcid] = useState(profile?.orcid || "");
  const [linkedIn, setLinkedIn] = useState(profile?.linkedIn || "");
  const [researchGate, setResearchGate] = useState(profile?.researchGate || "");

  const [status, setStatus] = useState<{ success?: boolean; error?: string }>({});

  const yearsOptions: ResidentYear[] = [
    "Junior Resident (Y1)",
    "Junior Resident (Y2)",
    "Junior Resident (Y3)",
    "Senior Resident (Cornea)",
    "Senior Resident (Retina)",
    "Senior Resident (Glaucoma)"
  ];

  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({});
    try {
      if (!bio.trim()) {
        setStatus({ error: "Bio description is mandated to initialize search relevance." });
        return;
      }
      await updateProfileBio(bio.trim(), year);
      setStatus({ success: true });
      setTimeout(() => setStatus({}), 3500);
    } catch (err: any) {
      setStatus({ error: err.message || "Failed to sync biography details." });
    }
  };

  const handleSaveLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({});
    try {
      await updateProfileLinks({
        googleScholar: googleScholar.trim(),
        orcid: orcid.trim(),
        linkedIn: linkedIn.trim(),
        researchGate: researchGate.trim()
      });
      setStatus({ success: true });
      setTimeout(() => setStatus({}), 3500);
    } catch (err: any) {
      setStatus({ error: err.message || "Failed to link identity profiles." });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settings_panel">
      {/* Introduction Hero */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <Sliders className="h-5 w-5 text-white" />
          <h1 className="text-base font-bold text-white tracking-tight leading-none font-sans">Professional Identity Configuration</h1>
        </div>
        <p className="text-white/60 text-xs mt-2.5 max-w-2xl leading-relaxed font-light">
          Surgical and clinical excellence is built on public proof. Configure your external identifiers, update your residency bios, and lock academic profiles below to maximize your completion score and earn peer endorsements.
        </p>
      </div>

      {status.error && (
        <p className="bg-[#09090b]/50 border border-white/15 p-3 rounded-xl text-xs font-mono text-rose-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-455 shrink-0" /> {status.error}
        </p>
      )}

      {status.success && (
        <p className="bg-white/5 border border-white/15 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-white shrink-0" /> Identity records synced successfully! Your CV is updated.
        </p>
      )}

      {profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Bio & Seniority updates form */}
          <form onSubmit={handleSaveBio} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono flex items-center gap-1.5 pb-2 border-b border-white/5">
              <FileText className="h-3.5 w-3.5 text-white/40" /> Residency Overview & Status
            </h2>

            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">DisplayName</label>
              <input
                type="text"
                value={profile.displayName}
                disabled
                className="w-full bg-[#09090b]/80 border border-white/5 rounded-lg text-xs py-2 px-3 text-white/40 cursor-not-allowed font-mono"
              />
              <span className="block text-[9px] text-white/30 mt-1">Contact Program Director to update profile display name.</span>
            </div>

            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">My Current Seniority Level</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as ResidentYear)}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35"
              >
                {yearsOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">Professional Overview Bio</label>
              <textarea
                placeholder="e.g. Ophthalmology senior resident with a special interest in complex phacos and glaucoma research guidelines. Author of 5 index items."
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
                className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="bg-white hover:bg-white/90 text-[#09090b] px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer shadow-sm shadow-black/10"
            >
              Sync Bio Details
            </button>
          </form>

          {/* 2. Professional links connecting form */}
          <form onSubmit={handleSaveLinks} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-sm">
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono flex items-center gap-1.5 pb-2 border-b border-white/5">
              <Link className="h-3.5 w-3.5 text-white/40" /> Digital Profile Connections (URLs)
            </h2>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">Google Scholar URL</label>
                <input
                  type="url"
                  placeholder="https://scholar.google.com/citations?user=..."
                  value={googleScholar}
                  onChange={(e) => setGoogleScholar(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">ORCID ID Link</label>
                <input
                  type="url"
                  placeholder="https://orcid.org/0000-052..."
                  value={orcid}
                  onChange={(e) => setOrcid(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">ResearchGate Portfolio Link</label>
                <input
                  type="url"
                  placeholder="https://researchgate.net/profile/..."
                  value={researchGate}
                  onChange={(e) => setResearchGate(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-white hover:bg-white/90 text-[#09090b] px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer shadow-sm shadow-black/10 whitespace-nowrap"
            >
              Verify & Link Profiles
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-8 text-center text-white/30 text-xs shadow-sm">
          Sign in using sandbox options or active Google accounts to configure settings.
        </div>
      )}
    </div>
  );
};
