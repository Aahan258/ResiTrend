import React, { useState, useEffect } from "react";
import { SurgicalLog } from "./Dashboard";
import { useAuth } from "../context/AuthContext";
import { 
  getResidentType, 
  SURGICAL_REQUIREMENTS, 
  matchesProcedure 
} from "../lib/surgicalConfig";
import { 
  BookOpen, 
  Plus, 
  Filter, 
  Calendar, 
  User, 
  ShieldCheck, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  ThumbsUp
} from "lucide-react";

interface SurgicalLogbookProps {
  surgicalLogs: SurgicalLog[];
  setSurgicalLogs: React.Dispatch<React.SetStateAction<SurgicalLog[]>>;
}

export const SurgicalLogbook: React.FC<SurgicalLogbookProps> = ({ surgicalLogs, setSurgicalLogs }) => {
  const { profile } = useAuth();
  const residentType = getResidentType(profile?.year || "Junior Resident");
  const requirements = SURGICAL_REQUIREMENTS[residentType];

  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [procedure, setProcedure] = useState("");
  const [customProcedure, setCustomProcedure] = useState("");
  const [supervisor, setSupervisor] = useState("Dr. Nair");
  const [role, setRole] = useState<"Assisted" | "Performed" | "Observed">("Performed");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Complex">("Medium");
  const [complications, setComplications] = useState("None");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");

  // Set default procedure according to the active specialty on change
  useEffect(() => {
    if (requirements && requirements.length > 0) {
      setProcedure(requirements[0].name);
    }
  }, [residentType]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProcedure = procedure === "Other" ? (customProcedure.trim() || "Other Procedure") : procedure;
    
    const newEntry: SurgicalLog = {
      id: "log_" + Date.now(),
      date,
      procedure: finalProcedure,
      supervisor,
      role,
      difficulty,
      complications
    };

    const updated = [newEntry, ...surgicalLogs];
    setSurgicalLogs(updated);
    localStorage.setItem("resitrend_surgical_logs", JSON.stringify(updated));

    // Reset Form
    setIsAdding(false);
    setCustomProcedure("");
    setComplications("None");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this log entry?")) {
      const filtered = surgicalLogs.filter(l => l.id !== id);
      setSurgicalLogs(filtered);
      localStorage.setItem("resitrend_surgical_logs", JSON.stringify(filtered));
    }
  };

  // Stats calculators
  const totalCases = surgicalLogs.length;
  const performedCount = surgicalLogs.filter(l => l.role === "Performed").length;
  const complicationFreePercent = totalCases > 0 
    ? Math.round(((totalCases - surgicalLogs.filter(l => l.complications !== "None").length) / totalCases) * 100)
    : 100;

  // Calculate individual metrics for the active resident's requirements
  const requirementStats = requirements.map(req => {
    const count = surgicalLogs.filter(l => matchesProcedure(l.procedure, req.name)).length;
    const progressPercent = Math.min(100, Math.round((count / req.target) * 100));
    return {
      ...req,
      count,
      progressPercent,
      isCompleted: count >= req.target
    };
  });

  const completedTargetsCount = requirementStats.filter(stat => stat.isCompleted).length;

  // Filtering logs
  const filteredLogs = surgicalLogs.filter(log => {
    const matchesSearch = log.procedure.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.complications.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (categoryFilter !== "all") {
      matchesCategory = matchesProcedure(log.procedure, categoryFilter);
    }

    const matchesSupervisor = supervisorFilter === "all" ? true : log.supervisor === supervisorFilter;

    return matchesSearch && matchesCategory && matchesSupervisor;
  });

  const privacyActive = localStorage.getItem("resitrend_privacy_active") === "true";

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white font-sans" id="surgical_logbook_panel">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-2 leading-none font-sans">
            <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Surgical Logbook & Case Registry
            {privacyActive && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded-full border border-emerald-150 dark:border-emerald-900/40 shadow-sm animate-pulse">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block" /> HIPAA Shield Active
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Official ACGME-compliant Ophthalmology surgical portfolio tracker</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm self-start sm:self-center"
        >
          {isAdding ? "View Log Table" : "Log New Surgical Case"}
        </button>
      </div>

      {/* Stats row */}
      {!isAdding && (
        <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1 hover:border-slate-350 dark:hover:border-slate-700 transition shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-450 dark:text-slate-500 block">Total Cases Logged</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalCases}</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500">procedures</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full mt-2">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, totalCases * 2.5)}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1 hover:border-slate-350 dark:hover:border-slate-700 transition shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-455 dark:text-slate-500 block">Milestones Completed</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{completedTargetsCount}</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500">/ {requirements.length} targets</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full mt-2">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.round((completedTargetsCount / requirements.length) * 100)}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1 hover:border-slate-355 dark:hover:border-slate-700 transition shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-455 dark:text-slate-500 block">Primary Surgeon (Performed)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{performedCount}</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500">cases</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full mt-2">
              <div className="bg-purple-400 h-full rounded-full" style={{ width: `${totalCases > 0 ? (performedCount / totalCases) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-1 hover:border-slate-355 dark:hover:border-slate-700 transition shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-455 dark:text-slate-500 block">Complication-Free Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{complicationFreePercent}%</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500">safety score</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full mt-2">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${complicationFreePercent}%` }} />
            </div>
          </div>
        </div>

        {/* Dynamic Curriculum Progress Checklist */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest font-mono flex items-center gap-1.5 leading-none">
              <CheckCircle className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> {residentType} curriculum tracker
            </h2>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Dynamic ACGME competency logs</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {requirementStats.map((stat) => (
              <div key={stat.name} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 space-y-2 relative hover:border-indigo-500/30 transition shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={stat.label}>{stat.label}</span>
                  {stat.isCompleted ? (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">✓</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 text-[9px] font-mono">{stat.target - stat.count} left</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{stat.count}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">/ {stat.target}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${stat.isCompleted ? 'bg-emerald-400' : 'bg-indigo-500'}`} 
                    style={{ width: `${stat.progressPercent}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      )}

      {isAdding ? (
        /* Expanded Create Case Form Panel */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md animate-fade-in max-w-2xl mx-auto">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-3 mb-5">
            <h2 className="text-md font-bold text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
              <Plus className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" /> Log Detailed Ophthalmology Case
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Specify parameters, roles, and supervisor verification flags</p>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Date */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Procedure Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Supervisor */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Supervisor / attending</label>
                <select
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Dr. Nair">Dr. Nair (Cornea HOD)</option>
                  <option value="Dr. Mehta">Dr. Mehta (Retina HOD)</option>
                  <option value="Dr. Sharma">Dr. Sharma (Glaucoma HOD)</option>
                  <option value="Dr. Sengupta">Dr. Sengupta (Pediatrics)</option>
                  <option value="Dr. Rao">Dr. Rao (Oculoplastics)</option>
                </select>
              </div>

              {/* Procedure */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Surgical Procedure</label>
                <select
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {requirements.map((req) => (
                    <option key={req.name} value={req.name}>
                      {req.label}
                    </option>
                  ))}
                  <option value="Other">Other Procedure (Specify below)</option>
                </select>
              </div>

              {/* Custom Procedure if other */}
              {procedure === "Other" && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Custom Procedure Name</label>
                  <input
                    type="text"
                    value={customProcedure}
                    onChange={(e) => setCustomProcedure(e.target.value)}
                    placeholder="e.g. Ptosis Correction, Trabeculoplasty"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              )}

              {/* Role */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Resident Surgical Role</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
                  {(["Observed", "Assisted", "Performed"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        role === r 
                          ? "bg-indigo-500 text-white shadow-sm" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Surgical Difficulty</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
                  {(["Easy", "Medium", "Complex"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        difficulty === d 
                          ? "bg-purple-500 text-white shadow-sm" 
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Complications */}
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Intra-operative Complications</label>
              <select
                value={complications}
                onChange={(e) => setComplications(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="None">None - Uneventful Procedure</option>
                <option value="Corneal Edema">Transient Corneal Edema</option>
                <option value="PCR">Posterior Capsular Rupture (PCR)</option>
                <option value="Iris Prolapse">Iris Prolapse / Damage</option>
                <option value="Hyphema">Anterior Chamber Hyphema</option>
                <option value="Vitreous Loss">Vitreous Loss</option>
                <option value="Sutures Required">Unplanned Scleral/Corneal Sutures</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-xl text-xs flex items-center gap-1 transition shadow-sm cursor-pointer"
              >
                Publish Case to Registry
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Log Filter & List Panel */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search procedure, supervisor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category */}
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Procedures</option>
                  {requirements.map((req) => (
                    <option key={req.name} value={req.name}>
                      {req.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supervisor */}
              <select
                value={supervisorFilter}
                onChange={(e) => setSupervisorFilter(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Supervisors</option>
                <option value="Dr. Nair">Dr. Nair</option>
                <option value="Dr. Mehta">Dr. Mehta</option>
                <option value="Dr. Sharma">Dr. Sharma</option>
                <option value="Dr. Sengupta">Dr. Sengupta</option>
                <option value="Dr. Rao">Dr. Rao</option>
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-955 text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Surgical Procedure</th>
                  <th className="py-3 px-4">Supervisor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Complications</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition text-slate-700 dark:text-slate-300">
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{log.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-950 dark:text-white">{log.procedure}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                        {privacyActive ? `[REDACTED-${log.supervisor.toUpperCase().replace("DR. ", "").replace(/\s/g, "")}]` : log.supervisor}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.role === "Performed" 
                            ? "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/20"
                            : log.role === "Assisted"
                              ? "bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/20"
                              : "bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.difficulty === "Complex"
                            ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                            : log.difficulty === "Medium"
                              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {log.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {log.complications === "None" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-sans text-[11px] flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 shrink-0 text-emerald-500" /> None
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 font-sans text-[11px] font-medium flex items-center gap-1 bg-red-50 dark:bg-red-955/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/20">
                            <AlertTriangle className="h-3 w-3 shrink-0 text-red-500" /> {log.complications}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-bold text-[9px] uppercase tracking-wide">
                          <CheckCircle2 className="h-3 w-3" /> Signed
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded transition text-[11px] cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500 font-light">
                      <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2.5" />
                      No surgical cases match your current filter settings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
