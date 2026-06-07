import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Heart, Send, Sparkles, Filter, ShieldAlert, Check } from "lucide-react";
import { RecognitionCategory, Profile } from "../types";

export const SilentApplause: React.FC = () => {
  const { 
    profile, 
    profiles, 
    addSilentApplause, 
    recognitions 
  } = useAuth();

  const [toUserId, setToUserId] = useState("");
  const [category, setCategory] = useState<RecognitionCategory>("Clinical teamwork");
  const [message, setMessage] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  
  // UI states
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; error?: string }>({});

  const categories: RecognitionCategory[] = [
    "Teaching help",
    "Emergency support",
    "Research assistance",
    "Clinical teamwork",
    "Leadership"
  ];

  // Submit recognition
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({});
    setIsSending(true);

    if (!toUserId || !category || !message.trim()) {
      setStatus({ error: "Please populate all fields." });
      setIsSending(false);
      return;
    }

    if (toUserId === profile?.uid) {
      setStatus({ error: "System constraint: Self-appreciation is disabled to maintain professional integrity." });
      setIsSending(false);
      return;
    }

    try {
      await addSilentApplause(toUserId, category, message.trim());
      setMessage("");
      setStatus({ success: true });
      setTimeout(() => setStatus({}), 3500);
    } catch (err: any) {
      setStatus({ error: err.message || "Action blocked or duplicate verification failed." });
    } finally {
      setIsSending(false);
    }
  };

  // Filter anonymous logs
  const filteredRecognitions = recognitions.filter(rec => {
    if (filterUser === "all") return true;
    return rec.toUserId === filterUser;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="silent_applause_panel">
      {/* 1. Introductory Title card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-white" />
          <h1 className="text-base font-bold text-white tracking-tight leading-none">Silent Applause</h1>
        </div>
        <p className="text-white/60 text-xs mt-2.5 max-w-2xl leading-relaxed">
          Express gratitude and acknowledge your peer residents anonymously. The recipient gains reputation credibility, index totals, and +40 XP automatically, while your identity remains shielded by secure hashes. No social clutter. Just pure clinical recognition.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* 2. Left Submit Form (1/3 size) */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 xl:col-span-1 backdrop-blur-md shadow-sm">
          <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Gratitude Appreciator</h2>
          
          {status.error && (
            <p className="bg-[#09090b]/50 border border-white/10 text-rose-300 text-[11px] p-2.5 rounded-lg font-mono flex items-start gap-1.5 leading-snug">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-450" />
              <span>{status.error}</span>
            </p>
          )}

          {status.success && (
            <p className="bg-white/5 border border-white/10 text-emerald-350 text-[11px] p-2.5 rounded-lg flex items-center gap-1.5">
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Silent Applause registered successfully!</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target resident selection */}
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">Target Ophthalmology Resident</label>
              <select
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                required
                className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-2.5 text-white focus:outline-none focus:border-white/30"
              >
                <option value="">-- Choose Resident --</option>
                {profiles.filter(p => p.uid !== profile?.uid).map(p => (
                  <option key={p.uid} value={p.uid}>{p.displayName} ({p.year.split(" ")[0]})</option>
                ))}
              </select>
            </div>

            {/* Praise core categories */}
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">Recognition Theme Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RecognitionCategory)}
                required
                className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-2.5 text-white focus:outline-none focus:border-white/30"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Praise message */}
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">Heartfelt Praise Message</label>
              <textarea
                placeholder="Describe their contribution (e.g. remaining focused in late emergencies or teaching me complex phaco steps)..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-2.5 text-white focus:outline-none focus:border-white/30 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-white hover:bg-white/90 disabled:bg-white/5 disabled:text-white/30 text-[#09090b] py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? "Validating Anti-Abuse..." : "Send Anonymously (Pulse)"}</span>
            </button>
          </form>
        </div>

        {/* 3. Right Message Feed list (2/3 size) */}
        <div className="space-y-4 xl:col-span-2">
          {/* Feed top filters */}
          <div className="flex items-center justify-between bg-white/5 px-4 py-3 border border-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.02)]">
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Live Recognition Feed ({filteredRecognitions.length})</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-white/40" />
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="bg-[#09090b] border border-white/10 rounded-md text-[11px] py-1 px-2.5 text-white focus:outline-none"
              >
                <option value="all">Recipient: All</option>
                {profiles.map(p => (
                  <option key={p.uid} value={p.uid}>{p.displayName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback Feed card display */}
          {filteredRecognitions.length === 0 ? (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-12 text-center text-white/40 text-xs shadow-sm">
              No private notes registered on this timeline. Be the first to appreciate another resident!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecognitions.map((rec) => {
                const targetUser = profiles.find(p => p.uid === rec.toUserId);
                
                return (
                  <div 
                    key={rec.id} 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition shadow-sm"
                  >
                    {/* Glowing highlight indicating peer praise */}
                    <div className="absolute top-0 right-0 h-10 w-10 bg-white/5 rounded-full blur-lg" />
                    
                    <div>
                      {/* Top Category tag & Name identifier */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                        <span className="text-[10px] font-bold py-0.5 px-2 rounded bg-white/5 text-white border border-white/10 font-mono">
                          {rec.category}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">
                          {new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Msg */}
                      <p className="text-white/80 text-xs italic leading-relaxed font-sans font-light">
                        "{rec.message}"
                      </p>
                    </div>

                    {/* Bottom target recipient information (keeping sender completely hidden!) */}
                    <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-white/40 font-mono text-[10px] uppercase tracking-wider">To resident:</span>
                      <span className="font-semibold text-white tracking-tight flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-white" />
                        {targetUser?.displayName || "Ophthalmic Resident"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
