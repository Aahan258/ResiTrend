import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, Award, ShieldAlert, Sparkles, User, Info, ThumbsUp } from "lucide-react";

export const EndorsementsComponent: React.FC = () => {
  const { profile, profiles, endorsements, addEndorsement } = useAuth();
  
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Clinical Skills");
  
  // UI indicators
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; error?: string }>({});

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const mySentEndorsements = profile ? endorsements.filter(e => e.fromUserId === profile.uid) : [];
  const sentToday = mySentEndorsements.filter(e => {
    const createdAtTime = new Date(e.createdAt).getTime();
    return createdAtTime >= startOfDay;
  }).length;

  const sentThisMonth = mySentEndorsements.filter(e => {
    const createdAtTime = new Date(e.createdAt).getTime();
    return createdAtTime >= startOfMonth;
  }).length;

  const endorsementSkills = [
    { title: "Clinical Skills", desc: "Expert diagnostics on slamp lamps and visual fields." },
    { title: "Surgical Skills", desc: "Competence in phacoemulsification and corneal repairs." },
    { title: "Teaching", desc: "Guides juniors in clinical refraction and ER rotations." },
    { title: "Research", desc: "Formulates robust PubMed ophthalmic abstracts." },
    { title: "Leadership", desc: "Coordinates complex residency Duty Roster cycles seamlessly." },
    { title: "Teamwork", desc: "Cooperative, covers colleague call duty in emergency peaks." },
    { title: "Communication", desc: "Compassionate counselling for anxious cataract patients." },
    { title: "Innovation", desc: "Materializes 3D printing or clinic software improvements." }
  ];

  const handleEndorse = async (toUid: string, skill: string) => {
    setStatus({});
    setLoading(true);

    if (toUid === profile?.uid) {
      setStatus({ error: "System Integrity Rule: Self-endorsement is deactivated to maintain credibility." });
      setLoading(false);
      return;
    }

    // Check if voter already endorsed this user for this specific skill
    const alreadyEndorsed = endorsements.some(
      e => e.fromUserId === profile?.uid && e.toUserId === toUid && e.category === skill
    );
    if (alreadyEndorsed) {
      setStatus({ error: `Verification Check: You have already verified this peer's competence in "${skill}"!` });
      setLoading(false);
      return;
    }

    try {
      await addEndorsement(toUid, skill);
      setStatus({ success: true });
      setTimeout(() => setStatus({}), 3500);
    } catch (err: any) {
      setStatus({ error: err.message || "Failed to commit endorsement." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white" id="endorse_skills_panel">
      {/* Introduction Hero bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-450" />
          <h1 className="text-base font-bold text-slate-950 dark:text-white tracking-tight leading-none font-sans">Professional Skill Endorsements</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-2.5 max-w-2xl leading-relaxed">
          Verify and validate peer resident capabilities. Selecting a category highlights skills and records your verification to their public profile, contributing +25-30 Academic, Teaching, or Recognition XP.
        </p>
      </div>

      {status.error && (
        <p className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-450 p-2.5 rounded-lg text-xs font-mono flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" /> {status.error}
        </p>
      )}

      {status.success && (
        <p className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 animate-spin" /> Endorsement cataloged and stats updated successfully.
        </p>
      )}

      {/* Main interface grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Dynamic peer lists showcasing current endorse count maps */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Peer Skill Auditing Registry ({profiles.length - 1} Residents)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.filter(p => p.uid !== profile?.uid).map((peer) => (
              <div key={peer.uid} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-none">{peer.displayName}</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{peer.year}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {peer.reputationLevel}
                  </span>
                </div>

                {/* Grid of skill slots and endorse totals */}
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest font-mono">Current Valuations:</span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {Object.entries(peer.endorsementCounts || {}).map(([skill, count]) => {
                    const haveVoted = endorsements.some(
                      e => e.fromUserId === profile?.uid && e.toUserId === peer.uid && e.category === skill
                    );
                    
                    return (
                      <button
                        key={skill}
                        onClick={() => handleEndorse(peer.uid, skill)}
                        className={`p-2.5 rounded-lg text-left transition flex justify-between items-center cursor-pointer ${
                          haveVoted
                            ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/40 shadow-sm font-bold"
                            : "bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                        }`}
                        title={`Verify ${peer.displayName} in ${skill}`}
                      >
                        <span className="truncate text-[10px] max-w-[100px]">{skill}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[10px]">{count}</span>
                          <ThumbsUp className={`h-2.5 w-2.5 ${haveVoted ? "fill-current" : ""}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Skill index, limits, and details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-sm">
          <div>
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-2">Endorsement Quotas</h2>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850 space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Daily Endorsements Meter</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{sentToday} / 3 verified</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${sentToday >= 3 ? "bg-red-500" : "bg-emerald-500"}`} 
                    style={{ width: `${Math.min(100, (sentToday / 3) * 100)}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-150 dark:border-slate-850 pt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Monthly Endorsements Limit</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{sentThisMonth} / 30 verified</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${sentThisMonth >= 30 ? "bg-red-500" : "bg-emerald-500"}`} 
                    style={{ width: `${Math.min(100, (sentThisMonth / 30) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Professional Skill Glossary</h2>
            
            <div className="space-y-3.5 mt-2">
              {endorsementSkills.map((sk) => (
                <div key={sk.title} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                    <Award className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{sk.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1 leading-snug">{sk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3 rounded-xl flex items-start gap-2.5 mt-2">
            <Info className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-normal">
              Residents can only grant ONE endorsement per sub-category per colleague. Every endorsement represents an authenticated peer verification of competence and awards +2 XP to the verifying sender.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
