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
    <div className="space-y-6 animate-fade-in" id="endorse_skills_panel">
      {/* Introduction Hero bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-white" />
          <h1 className="text-base font-bold text-white tracking-tight leading-none font-sans">Professional Skill Endorsements</h1>
        </div>
        <p className="text-white/60 text-xs mt-2.5 max-w-2xl leading-relaxed">
          Verify and validate peer resident capabilities. Selecting a category highlights skills and records your verification to their public profile, contributing +25-30 Academic, Teaching, or Recognition XP.
        </p>
      </div>

      {status.error && (
        <p className="bg-[#09090b]/50 border border-white/15 text-rose-300 p-2.5 rounded-lg text-xs font-mono flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-455" /> {status.error}
        </p>
      )}

      {status.success && (
        <p className="bg-white/5 border border-white/15 text-emerald-300 p-2.5 rounded-lg text-xs flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-white animate-spin" /> Endorsement cataloged and stats updated successfully.
        </p>
      )}

      {/* Main interface grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Dynamic peer lists showcasing current endorse count maps */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Peer Skill Auditing Registry ({profiles.length - 1} Residents)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.filter(p => p.uid !== profile?.uid).map((peer) => (
              <div key={peer.uid} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 hover:border-white/20 transition shadow-sm">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight leading-none">{peer.displayName}</h3>
                    <span className="text-[10px] text-white/40 mt-1 block">{peer.year}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/60 font-mono">
                    {peer.reputationLevel}
                  </span>
                </div>

                {/* Grid of skill slots and endorse totals */}
                <span className="block text-[10px] text-white/40 font-bold uppercase tracking-widest font-mono">Current Valuations:</span>
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
                            ? "bg-white/10 text-white border border-white/20 shadow-sm"
                            : "bg-[#09090b] hover:bg-white/5 text-white/60 border border-white/5"
                        }`}
                        title={`Verify ${peer.displayName} in ${skill}`}
                      >
                        <span className="truncate text-[10px] max-w-[100px]">{skill}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[10px]">{count}</span>
                          <ThumbsUp className={`h-2.5 w-2.5 ${haveVoted ? "fill-white" : ""}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Skill index and details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 backdrop-blur-md shadow-sm">
          <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Professional Skill Glossary</h2>
          
          <div className="space-y-3.5">
            {endorsementSkills.map((sk) => (
              <div key={sk.title} className="bg-[#09090b] p-3 rounded-lg border border-white/5 text-xs">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <Award className="h-3.5 w-3.5 text-white/60" />
                  <span>{sk.title}</span>
                </div>
                <p className="text-white/60 text-[11px] mt-1 leading-snug">{sk.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-2.5 mt-2">
            <Info className="h-4 w-4 text-white/40 shrink-0 mt-0.5" />
            <p className="text-[10px] text-white/50 leading-normal">
              Residents can only grant ONE endorsement per sub-category per colleague. Every endorsement represents an authenticated peer verification of competence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
