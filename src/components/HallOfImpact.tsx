import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Award, 
  Calendar, 
  Plus, 
  CheckCircle, 
  User, 
  ExternalLink, 
  Search, 
  Link, 
  ShieldCheck, 
  Filter, 
  Users,
  Eye,
  Info
} from "lucide-react";
import { Achievement, AchievementCategory, Profile } from "../types";
import { ActivityOverview } from "./ActivityOverview";

export const HallOfImpact: React.FC = () => {
  const { 
    profile, 
    achievements, 
    profiles, 
    addAchievement, 
    validateAchievement, 
    verifyAchievementAdmin, 
    isAdmin 
  } = useAuth();

  // Search/Filters states
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const resident = params.get("resident");
    return resident || profile?.uid || "all";
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Creation States
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AchievementCategory>("Academic Achievement");
  const [date, setDate] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const categories: AchievementCategory[] = [
    "Academic Achievement",
    "Award",
    "Certification",
    "Fellowship",
    "Conference Presentation",
    "Publication",
    "Research Project",
    "Teaching Contribution",
    "Innovation Contribution"
  ];

  // Submission handler
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!title.trim() || !category || !date) {
      setErrorMsg("All primary fields are required.");
      return;
    }
    try {
      await addAchievement(title, category, date, proofUrl);
      setTitle("");
      setProofUrl("");
      setDate("");
      setIsAdding(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    }
  };

  // Find the selected user's profile for header summary
  const displayedProfile = profiles.find(p => p.uid === selectedUserFilter) || profile;

  // Filter achievements
  const filteredAchievements = achievements.filter(ach => {
    const matchUser = selectedUserFilter === "all" ? true : ach.userId === selectedUserFilter;
    const matchCat = categoryFilter === "all" ? true : ach.category === categoryFilter;
    const matchStatus = statusFilter === "all" ? true : ach.status === statusFilter;
    return matchUser && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="hall_of_impact_panel">
      {/* 0. Personal Activity Overview Radar */}
      <ActivityOverview />

      {/* 1. Header Hero section */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-md">
              {displayedProfile?.displayName[4] || "A"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">{displayedProfile?.displayName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50 font-mono tracking-wide">
                  {displayedProfile?.year}
                </span>
              </div>
              <p className="text-white/70 text-xs mt-2 max-w-xl leading-relaxed">
                {displayedProfile?.bio || "No professional overview bio configured yet. Use link section to update details."}
              </p>
              
              {/* External Professional Identity Links */}
              <div className="flex flex-wrap items-center gap-2 mt-3.5">
                {displayedProfile?.googleScholar && (
                  <a href={displayedProfile.googleScholar} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/20 text-[10px] text-white font-mono font-medium transition">
                     Scholar <ExternalLink className="h-2.5 w-2.5 text-white/60" />
                  </a>
                )}
                {displayedProfile?.orcid && (
                  <a href={displayedProfile.orcid} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/20 text-[10px] text-white font-mono font-medium transition">
                    ORCID <ExternalLink className="h-2.5 w-2.5 text-white/60" />
                  </a>
                )}
                {displayedProfile?.linkedIn && (
                  <a href={displayedProfile.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/20 text-[10px] text-white font-mono font-medium transition">
                    LinkedIn <ExternalLink className="h-2.5 w-2.5 text-white/60" />
                  </a>
                )}
                {displayedProfile?.researchGate && (
                  <a href={displayedProfile.researchGate} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/20 text-[10px] text-white font-mono font-medium transition">
                    ResearchGate <ExternalLink className="h-2.5 w-2.5 text-white/60" />
                  </a>
                )}
                {!displayedProfile?.googleScholar && !displayedProfile?.orcid && !displayedProfile?.linkedIn && !displayedProfile?.researchGate && (
                  <span className="text-[10px] text-white/30 italic">No external identifiers locked. Connect in Links menu.</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="flex items-center gap-4 self-stretch lg:self-auto bg-white/5 p-4 border border-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.03)]">
            <div className="text-center pr-4 border-r border-white/10">
              <span className="block text-[10px] text-white/40 uppercase tracking-widest font-extrabold font-mono">Completion</span>
              <span className="block text-lg font-bold text-white mt-1">{displayedProfile?.profileCompletionScore || 0}%</span>
            </div>
            <div className="text-center pr-4 border-r border-white/10">
              <span className="block text-[10px] text-white/40 uppercase tracking-widest font-extrabold font-mono">Endorsed</span>
              <span className="block text-lg font-bold text-white mt-1">
                {(Object.values(displayedProfile?.endorsementCounts || {}) as number[]).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-white/40 uppercase tracking-widest font-extrabold font-mono font-sans">Applause</span>
              <span className="block text-lg font-bold text-white mt-1">{displayedProfile?.silentApplauseCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Timeline Controls (Search & Add) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/5 p-4 border border-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.02)]">
        <div className="flex flex-wrap items-center gap-3">
          {/* User filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-white focus:outline-none focus:border-zinc-700"
            >
              <option value="all">🔍 Show All Residents</option>
              {profile && <option value={profile.uid}>📍 My Living CV</option>}
              {profiles.filter(p => p.uid !== profile?.uid).map(p => (
                <option key={p.uid} value={p.uid}>{p.displayName} ({p.year.split(" ")[0]})</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-white focus:outline-none focus:border-zinc-700"
          >
            <option value="all">Category: All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-white focus:outline-none focus:border-zinc-700"
          >
            <option value="all">Status: All</option>
            <option value="self-declared">Self-declared</option>
            <option value="community-validated">Community validated</option>
            <option value="admin-verified">Admin verified</option>
          </select>
        </div>

        {/* Add trigger */}
        {profile && selectedUserFilter === profile.uid && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Log Value Creation
          </button>
        )}
      </div>

      {/* 3. Dropdown Create form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 animate-fade-in relative z-20">
          <h3 className="text-sm font-semibold text-white">Log Academic, Research, or Innovation Milestone</h3>
          {errorMsg && <p className="text-rose-400 text-xs font-mono">{errorMsg}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Title of Achievement / Paper / Certification</label>
              <input
                type="text"
                placeholder="e.g. Publications of deep learning for glaucoma prediction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-zinc-700"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Milestone Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AchievementCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-zinc-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Date of Completion / Publication</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-zinc-700"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Evidence URL (PubMed, Certificate link, optional)</label>
              <input
                type="url"
                placeholder="e.g. https://pubmed.ncbi.nlm.nih.gov/..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs border border-zinc-800 text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-4 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Self-Declare & Publish
            </button>
          </div>
        </form>
      )}

      {/* 4. Timeline list */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Academic Achievements Timeline ({filteredAchievements.length})</h2>
        {filteredAchievements.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-8 text-center text-white/40 text-xs shadow-sm">
            No milestones matches the current filters. Update layout or log a new achievement above!
          </div>
        ) : (
          <div className="relative pl-5 border-l border-white/10 space-y-6">
            {filteredAchievements.map((ach) => {
              const isMine = profile?.uid === ach.userId;
              const alreadyValidated = profile && ach.validations.includes(profile.uid);
              
              return (
                <div key={ach.id} className="relative group/timeline animate-fade-in">
                  {/* Circle Indicator on vertical bar */}
                  <div className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border bg-[#09090b] flex items-center justify-center transition-all ${
                    ach.status === "admin-verified"
                      ? "border-emerald-500 shadow-sm"
                      : ach.status === "community-validated"
                      ? "border-white"
                      : "border-white/30"
                  }`} />

                  {/* Body Card */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        {/* Title & Category info */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono text-white/45 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-white/30" /> {ach.date}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-white/60 font-medium">
                            {ach.category}
                          </span>
                          
                          {/* Interactive status tags */}
                          {ach.status === "admin-verified" ? (
                            <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-mono text-white font-bold uppercase tracking-wider flex items-center gap-0.5 border border-white/15">
                              <ShieldCheck className="h-3 w-3" /> Admin Verified
                            </span>
                          ) : ach.status === "community-validated" ? (
                            <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-white/80 font-bold uppercase tracking-wider flex items-center gap-0.5 border border-white/10">
                              <Users className="h-3 w-3" /> Community Validated
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-white/40 uppercase tracking-wider">
                              Self Declared
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-semibold text-white mt-1.5 leading-snug">{ach.title}</h3>
                        <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1 font-mono">
                          Logged by: <span className="text-white/60 italic">{ach.displayName}</span>
                        </p>
                      </div>

                      {/* Timeline Interaction Triggers */}
                      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                        {/* Evidence attachment link */}
                        {ach.proofUrl && (
                          <a 
                            href={ach.proofUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-white/5 hover:bg-white/10 text-white/80 p-1.5 rounded-lg text-xs flex items-center gap-1 transition border border-white/10"
                            title="Review Proof Link"
                          >
                            <Link className="h-3.5 w-3.5" />
                          </a>
                        )}

                        {/* Peer community validation button */}
                        {!isMine && profile && (
                          <button
                            onClick={() => validateAchievement(ach.id)}
                            disabled={alreadyValidated || ach.status === "admin-verified"}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 border ${
                              alreadyValidated
                                ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
                                : "bg-white/5 border-white/10 hover:border-white/20 text-white select-none"
                            }`}
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>
                              {alreadyValidated 
                                ? `Validated (${ach.validations.length})` 
                                : `Validate (${ach.validations.length})`}
                            </span>
                          </button>
                        )}

                        {/* Founder verification lock override */}
                        {isAdmin && ach.status !== "admin-verified" && (
                          <button
                            onClick={() => verifyAchievementAdmin(ach.id)}
                            className="bg-white text-[#09090b] hover:bg-white/90 font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 shadow-md"
                          >
                            <ShieldCheck className="h-3 w-3" /> Lock Verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
