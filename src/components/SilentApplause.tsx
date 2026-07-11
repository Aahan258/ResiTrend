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

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const mySentRecognitions = profile ? recognitions.filter(r => r.fromUserId === profile.uid) : [];
  const sentToday = mySentRecognitions.filter(r => {
    const createdAtTime = new Date(r.createdAt).getTime();
    return createdAtTime >= startOfDay;
  }).length;

  const sentThisMonth = mySentRecognitions.filter(r => {
    const createdAtTime = new Date(r.createdAt).getTime();
    return createdAtTime >= startOfMonth;
  }).length;

  // Filter anonymous logs
  const filteredRecognitions = recognitions.filter(rec => {
    if (filterUser === "all") return true;
    return rec.toUserId === filterUser;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white" id="silent_applause_panel">
      {/* 1. Introductory Title card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-rose-500 dark:text-rose-450 animate-pulse" />
          <h1 className="text-base font-bold text-slate-950 dark:text-white tracking-tight leading-none">Silent Applause</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-2.5 max-w-2xl leading-relaxed">
          Express gratitude and acknowledge your peer residents anonymously. The recipient gains reputation credibility, index totals, and +40 XP automatically, while your identity remains shielded by secure hashes. As a sender, you also earn +2 XP for positive engagement. No social clutter. Just pure clinical recognition.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* 2. Left Submit Form (1/3 size) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 xl:col-span-1 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Gratitude Appreciator</h2>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 font-mono px-1.5 py-0.5 rounded font-bold uppercase">Limits Engaged</span>
          </div>

          {/* Engagement Status Limit Indicator Meters */}
          {profile && (
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Daily Limit Meter</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{sentToday} / 2 sent</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${sentToday >= 2 ? "bg-red-500" : "bg-indigo-500"}`} 
                  style={{ width: `${Math.min(100, (sentToday / 2) * 100)}%` }} 
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-150 dark:border-slate-850">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Monthly Safety Limit</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{sentThisMonth} / 30 sent</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${sentThisMonth >= 30 ? "bg-red-500" : "bg-emerald-500"}`} 
                  style={{ width: `${Math.min(100, (sentThisMonth / 30) * 100)}%` }} 
                />
              </div>
            </div>
          )}
          
          {status.error && (
            <p className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-450 text-[11px] p-2.5 rounded-lg font-mono flex items-start gap-1.5 leading-snug">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{status.error}</span>
            </p>
          )}

          {status.success && (
            <p className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[11px] p-2.5 rounded-lg flex items-center gap-1.5">
              <Check className="h-4 w-4 shrink-0" />
              <span>Silent Applause registered successfully!</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target resident selection */}
            <div>
              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Target Ophthalmology Resident</label>
              <select
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Resident --</option>
                {profiles.filter(p => p.uid !== profile?.uid).map(p => (
                  <option key={p.uid} value={p.uid}>{p.displayName} ({p.year.split(" ")[0]})</option>
                ))}
              </select>
            </div>

            {/* Praise core categories */}
            <div>
              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Recognition Theme Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RecognitionCategory)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Praise message */}
            <div>
              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Heartfelt Praise Message</label>
              <textarea
                placeholder="Describe their contribution (e.g. remaining focused in late emergencies or teaching me complex phaco steps)..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? "Validating Anti-Abuse..." : "Send Anonymously"}</span>
            </button>
          </form>
        </div>

        {/* 3. Right Message Feed list (2/3 size) */}
        <div className="space-y-4 xl:col-span-2">
          {/* Feed top filters */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Live Recognition Feed ({filteredRecognitions.length})</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-[11px] py-1 px-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
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
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 dark:text-slate-500 text-xs shadow-sm">
              No private notes registered on this timeline. Be the first to appreciate another resident!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecognitions.map((rec) => {
                const targetUser = profiles.find(p => p.uid === rec.toUserId);
                
                return (
                  <div 
                    key={rec.id} 
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm"
                  >
                    <div>
                      {/* Top Category tag & Name identifier */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2 mb-3">
                        <span className="text-[10px] font-bold py-0.5 px-2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-mono">
                          {rec.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                          {new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Msg */}
                      <p className="text-slate-750 dark:text-slate-200 text-xs italic leading-relaxed font-sans font-light">
                        "{rec.message}"
                      </p>
                    </div>

                    {/* Bottom target recipient information (keeping sender completely hidden!) */}
                    <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] uppercase tracking-wider">To resident:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
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
