import React, { useState } from "react";
import { 
  Microscope, 
  Plus, 
  CheckCircle, 
  Link, 
  ExternalLink, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  User, 
  FileText, 
  Flame, 
  Award,
  Sparkles,
  Award as MedalIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AcademicsResearch: React.FC = () => {
  const { profile, addAchievement } = useAuth();
  
  const [thesisTopic, setThesisTopic] = useState("Comparison of AS-OCT Angle Parameters in Acute vs Chronic Angle Closure Glaucoma");
  const [thesisStatus, setThesisStatus] = useState("Writing Draft");
  const [thesisMilestones, setThesisMilestones] = useState([
    { id: "1", title: "Ethics Committee Approval Obtained", done: true },
    { id: "2", title: "Patient Cohort Recruitment Done (n=120)", done: true },
    { id: "3", title: "Statistical Regression Modelling Complete", done: true },
    { id: "4", title: "Abstract submission & Peer review Draft", done: false },
    { id: "5", title: "Final Thesis Binding & Defense Sign-off", done: false },
  ]);

  const [publications, setPublications] = useState([
    { title: "Clinical trends in sutureless small incision cataract surgery in rural cohorts", journal: "Indian Journal of Ophthalmology (IJO)", year: "2025", doi: "10.4103/ijo.IJO_12_25", citations: 4 },
    { title: "Efficacy of intravitreal ranibizumab in diabetic macular edema refractory cases", journal: "Asia-Pacific Journal of Ophthalmology", year: "2024", doi: "10.1097/APO.00000000109", citations: 12 }
  ]);

  const [seminarLogs, setSeminarLogs] = useState([
    { date: "2026-06-25", topic: "OCT Angiography in Diabetic Retinopathy screening", role: "Speaker", creditXp: 40 },
    { date: "2026-06-12", topic: "Corneal dystrophies and endothelial keratoplasty updates", role: "Attendee", creditXp: 15 },
    { date: "2026-05-30", topic: "Refractive surgery: LASIK vs SMILE candidate profiling", role: "Speaker", creditXp: 40 },
  ]);

  // Form states
  const [newPubTitle, setNewPubTitle] = useState("");
  const [newPubJournal, setNewPubJournal] = useState("");
  const [newPubDoi, setNewPubDoi] = useState("");
  const [isAddingPub, setIsAddingPub] = useState(false);

  const [newSeminarTopic, setNewSeminarTopic] = useState("");
  const [newSeminarRole, setNewSeminarRole] = useState("Speaker");
  const [isAddingSeminar, setIsAddingSeminar] = useState(false);

  const handleAddPub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPubTitle.trim() || !newPubJournal.trim()) return;

    const newPub = {
      title: newPubTitle.trim(),
      journal: newPubJournal.trim(),
      year: new Date().getFullYear().toString(),
      doi: newPubDoi.trim() || "N/A",
      citations: 0
    };

    setPublications([newPub, ...publications]);
    
    // Also add to auth achievements to gain XP!
    addAchievement(
      `Published Paper: "${newPub.title}" in ${newPub.journal}`,
      "Publication",
      new Date().toISOString().split("T")[0],
      newPub.doi
    );

    setNewPubTitle("");
    setNewPubJournal("");
    setNewPubDoi("");
    setIsAddingPub(false);
  };

  const handleAddSeminar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeminarTopic.trim()) return;

    const newSeminar = {
      date: new Date().toISOString().split("T")[0],
      topic: newSeminarTopic.trim(),
      role: newSeminarRole,
      creditXp: newSeminarRole === "Speaker" ? 40 : 15
    };

    setSeminarLogs([newSeminar, ...seminarLogs]);

    // Add to achievements
    addAchievement(
      `Presented/Attended Seminar: "${newSeminar.topic}" as ${newSeminar.role}`,
      "Teaching Contribution",
      newSeminar.date,
      ""
    );

    setNewSeminarTopic("");
    setIsAddingSeminar(false);
  };

  const toggleThesisMilestone = (id: string) => {
    setThesisMilestones(
      thesisMilestones.map(m => m.id === id ? { ...m, done: !m.done } : m)
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white font-sans" id="academics_research_panel">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Microscope className="h-5 w-5 text-purple-500 dark:text-purple-400" /> Academics, Thesis & Research Hub
        </h1>
        <p className="text-xs text-slate-500 dark:text-white/50 mt-1">Submit publications, monitor thesis Milestones, and log academic presentations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Thesis Progress Tracker (Left 7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800/40 pb-2.5">
              <span className="text-[10px] uppercase font-mono text-purple-600 dark:text-purple-400 font-bold block">JR Thesis Progression</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mt-1">Active Thesis Focus</h2>
              <p className="text-xs text-slate-600 dark:text-white/60 font-medium italic mt-2 bg-purple-500/5 p-3 rounded-xl border border-purple-500/10 leading-relaxed">
                "{thesisTopic}"
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <span className="block text-[10px] uppercase tracking-widest font-mono text-slate-400 dark:text-white/40 font-bold">Thesis Phase Milestones</span>
              <div className="space-y-2">
                {thesisMilestones.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleThesisMilestone(m.id)}
                    className="w-full flex items-center justify-between text-left p-3 rounded-xl border border-slate-150 dark:border-slate-800/40 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-100 dark:hover:bg-white/5 transition duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${
                        m.done 
                          ? "bg-purple-500/20 border-purple-400 text-purple-600 dark:text-purple-300" 
                          : "border-slate-300 dark:border-white/20 text-transparent"
                      }`}>
                      ✓
                      </div>
                      <span className={`text-xs ${m.done ? "text-slate-400 dark:text-white/40 line-through" : "text-slate-850 dark:text-white/85 font-medium"}`}>{m.title}</span>
                    </div>
                    {m.done && <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded uppercase">Completed</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Publications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Scientific Publications</h2>
                <p className="text-[10px] text-slate-400 dark:text-white/40">Verified papers indexed in PubMed/Google Scholar</p>
              </div>
              <button
                onClick={() => setIsAddingPub(!isAddingPub)}
                className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-300 transition"
              >
                {isAddingPub ? "View List" : "Add Paper"}
              </button>
            </div>

            {isAddingPub ? (
              <form onSubmit={handleAddPub} className="space-y-3 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Paper Title</label>
                  <input
                    type="text"
                    value={newPubTitle}
                    onChange={(e) => setNewPubTitle(e.target.value)}
                    placeholder="e.g. Posterior capsular rent management during phacoemulsification"
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Journal Name</label>
                    <input
                      type="text"
                      value={newPubJournal}
                      onChange={(e) => setNewPubJournal(e.target.value)}
                      placeholder="e.g. Indian Journal of Ophthalmology"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">DOI Link / URL</label>
                    <input
                      type="text"
                      value={newPubDoi}
                      onChange={(e) => setNewPubDoi(e.target.value)}
                      placeholder="e.g. 10.4103/ijo..."
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white dark:text-zinc-950 font-bold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Publish Publication Log (+100 XP)
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {publications.map((p, i) => (
                  <div key={i} className="bg-slate-50/40 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-xl p-3.5 space-y-2 hover:border-slate-250 dark:hover:border-white/10 transition">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white font-sans leading-tight">{p.title}</h3>
                      <span className="text-[9px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.2 rounded border border-purple-500/10 font-bold whitespace-nowrap">
                        {p.year}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-white/50 font-mono">
                      <span>Journal: <span className="text-slate-800 dark:text-white/80">{p.journal}</span></span>
                      {p.doi !== "N/A" && (
                        <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5">
                          DOI link <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Seminar Logging (Right 5/12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Academic Round Logs</h2>
                <p className="text-[10px] text-slate-400 dark:text-white/40">Presentations & weekly seminar entries</p>
              </div>
              <button
                onClick={() => setIsAddingSeminar(!isAddingSeminar)}
                className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-300 transition"
              >
                {isAddingSeminar ? "View Logs" : "Log Activity"}
              </button>
            </div>

            {isAddingSeminar ? (
              <form onSubmit={handleAddSeminar} className="space-y-3 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 dark:text-white/40 uppercase">Seminar Presentation Topic</label>
                  <input
                    type="text"
                    value={newSeminarTopic}
                    onChange={(e) => setNewSeminarTopic(e.target.value)}
                    placeholder="e.g. Visual fields regression analysis in advanced glaucoma"
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-widest font-mono">My Role</label>
                  <div className="grid grid-cols-2 gap-1 bg-white dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                    {["Attendee", "Speaker"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewSeminarRole(r)}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          newSeminarRole === r 
                            ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/10" 
                            : "text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white dark:text-zinc-950 font-bold py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Log Seminar
                </button>
              </form>
            ) : (
              <div className="space-y-3.5">
                {seminarLogs.map((log, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 bg-slate-50/40 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-white/[0.02]">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{log.topic}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-white/40 font-mono">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {log.date}</span>
                        <span>•</span>
                        <span>Role: <strong className="text-slate-700 dark:text-white/75">{log.role}</strong></span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/15 shrink-0">
                      +{log.creditXp} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integrated Scholar connection */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-[#12111c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3.5">
            <span className="text-[10px] uppercase font-mono text-purple-600 dark:text-purple-400 font-bold block">Scientific Identity Links</span>
            <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed font-sans">
              ResiTrend queries PubMed, Scopus, and Google Scholar in the background to automatically synchronize your citations and publications directly.
            </p>
            <div className="flex flex-col gap-2 pt-1.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/5">
                <span className="text-xs font-medium text-slate-800 dark:text-white/80 font-sans">Google Scholar Profile</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/5">
                <span className="text-xs font-medium text-slate-800 dark:text-white/80 font-sans">ORCID Digital ID</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
