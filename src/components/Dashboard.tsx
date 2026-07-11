import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { 
  getResidentType, 
  SURGICAL_REQUIREMENTS, 
  matchesProcedure 
} from "../lib/surgicalConfig";
import { 
  Award, 
  Flame, 
  Zap, 
  Trophy, 
  Plus, 
  CheckCircle, 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  Sparkles, 
  Stethoscope, 
  Activity, 
  Clock, 
  ThumbsUp, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight, 
  Send, 
  Mic, 
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Info,
  Award as MedalIcon
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from "recharts";

import { HIGH_FIDELITY_DEMO_LOGS, triggerToast } from "../lib/demoData";

// Surgical log interface
export interface SurgicalLog {
  id: string;
  date: string;
  procedure: string;
  supervisor: string;
  role: "Assisted" | "Performed" | "Observed";
  difficulty: "Easy" | "Medium" | "Complex";
  complications: string;
}

// Milestone interface
interface Milestone {
  id: string;
  category: string;
  current: number;
  target: number;
  badgeName: string;
  iconName: string;
}

export const Dashboard: React.FC<{ 
  setActiveTab: (tab: string) => void;
  surgicalLogs: SurgicalLog[];
  setSurgicalLogs: React.Dispatch<React.SetStateAction<SurgicalLog[]>>;
}> = ({ setActiveTab, surgicalLogs, setSurgicalLogs }) => {
  const { profile, profiles, isFirebaseActive, updateProfileBio } = useAuth();
  
  const residentType = useMemo(() => getResidentType(profile?.year || "Junior Resident"), [profile]);
  const requirements = useMemo(() => SURGICAL_REQUIREMENTS[residentType], [residentType]);

  // Pitch presentation and HIPAA privacy states
  const [pitchMode, setPitchMode] = useState<boolean>(() => {
    return localStorage.getItem("resitrend_pitch_demo_mode") === "true";
  });
  const [privacyActive, setPrivacyActive] = useState<boolean>(() => {
    return localStorage.getItem("resitrend_privacy_active") === "true";
  });

  // AI Case Sieve input and parse states
  const [clinicalNoteInput, setClinicalNoteInput] = useState("");
  const [isSieving, setIsSieving] = useState(false);
  const [sievedCase, setSievedCase] = useState<{
    procedureName: string;
    supervisor: string;
    complications: string;
    points: number;
    difficulty: string;
    summary: string;
    patientId: string;
  } | null>(null);
  const [sieveError, setSieveError] = useState<string | null>(null);

  // Quick select procedures dynamically populated from specialty requirements
  const quickProcedures = useMemo(() => {
    return requirements.map(req => req.name).concat("Other");
  }, [requirements]);

  // Local state for Quick Log
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logProcedure, setLogProcedure] = useState("");
  const [logSupervisor, setLogSupervisor] = useState("Dr. Nair");
  const [logRole, setLogRole] = useState<"Assisted" | "Performed" | "Observed">("Performed");
  const [logDifficulty, setLogDifficulty] = useState<"Easy" | "Medium" | "Complex">("Medium");
  const [logStatus, setLogStatus] = useState<string | null>(null);

  // Set default selection when quick procedures change
  useEffect(() => {
    if (quickProcedures && quickProcedures.length > 0) {
      setLogProcedure(quickProcedures[0]);
    }
  }, [quickProcedures]);

  // Peer nomination state
  const [isNominateOpen, setIsNominateOpen] = useState(false);
  const [nomineeId, setNomineeId] = useState("");
  const [nominationCategory, setNominationCategory] = useState("Emergency support");
  const [nominationMessage, setNominationMessage] = useState("");
  const [nominationStatus, setNominationStatus] = useState<string | null>(null);

  // Simulated AI Buddy State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I am your AI Ophthalmic Assistant. I can assist you with case log analysis, high-yield clinical MCQs, or surgical technique tips. How can I support your clinical rotation today?" }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const supervisorList = ["Dr. Nair", "Dr. Mehta", "Dr. Sharma", "Dr. Sengupta", "Dr. Rao"];

  // Handle Quick Surgical Log Submit
  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SurgicalLog = {
      id: "log_" + Date.now(),
      date: logDate,
      procedure: logProcedure,
      supervisor: logSupervisor,
      role: logRole,
      difficulty: logDifficulty,
      complications: "None"
    };

    const updated = [newLog, ...surgicalLogs];
    setSurgicalLogs(updated);
    localStorage.setItem("resitrend_surgical_logs", JSON.stringify(updated));

    setLogStatus("Procedure logged successfully! +20 Logbook XP added.");
    setTimeout(() => setLogStatus(null), 3000);
  };

  // Gamified Milestones Radar progress based on active specialty
  const milestones = useMemo<Milestone[]>(() => {
    const list: Milestone[] = requirements.slice(0, 3).map((req, idx) => {
      const current = surgicalLogs.filter(l => matchesProcedure(l.procedure, req.name)).length;
      return {
        id: `m_${idx}`,
        category: req.label,
        current,
        target: req.target,
        badgeName: `${req.name} Master`,
        iconName: idx === 0 ? "⚡" : idx === 1 ? "👁️" : "🔮"
      };
    });

    // Add peer kudos as a final matching milestone
    list.push({
      id: "m_kudos",
      category: "Peer Kudos",
      current: profile?.recognitionXp ? Math.floor(profile.recognitionXp / 10) : 12,
      target: 30,
      badgeName: "Social Star",
      iconName: "🤝"
    });

    return list;
  }, [requirements, surgicalLogs, profile]);

  // Unlocked Badges shelf based on active subspecialty
  const badges = useMemo(() => {
    const list = [
      { name: "Emergency Expert", desc: "Logged 5 emergency eye procedures", icon: "🏥", color: "from-rose-500/20 to-red-600/20", unlocked: true },
      { name: "OCT Master", desc: "Analyzed 100+ high-definition macular scans", icon: "🔬", color: "from-cyan-500/20 to-blue-600/20", unlocked: true },
      { name: "Cornea Crusader", desc: "Assisted in 3 corneal transplants", icon: "🌐", color: "from-teal-500/20 to-emerald-600/20", unlocked: true },
    ];

    requirements.slice(0, 2).forEach((req, idx) => {
      const count = surgicalLogs.filter(l => matchesProcedure(l.procedure, req.name)).length;
      list.push({
        name: `${req.label} Pioneer`,
        desc: `Log ${req.target} ${req.label} surgeries`,
        icon: idx === 0 ? "⚡" : "👁️",
        color: idx === 0 ? "from-amber-500/20 to-orange-600/20" : "from-purple-500/20 to-indigo-600/20",
        unlocked: count >= req.target
      });
    });

    return list;
  }, [requirements, surgicalLogs]);

  // Weighted score algorithm
  // distribution: 30% Clinical (Endorsements), 20% Academics (XP), 15% Logbook (Surgeries), 10% Attendance, 10% Research, 10% Faculty Eval, 5% Teamwork (Kudos)
  const weightedScoreData = useMemo(() => {
    const profileAny = profile as any;
    const clinicalScore = Math.min(100, (profileAny?.endorsementCounts ? (Object.values(profileAny.endorsementCounts).reduce((acc: any, val: any) => Number(acc) + Number(val), 0) as number) * 8 : 45));
    const academicsScore = Math.min(100, (profileAny?.academicXp ? Number(profileAny.academicXp) / 3 : 70));
    
    // Calculate precise logbook score based on medical curriculum completion percentage
    const totalTargetCases = requirements.reduce((acc, r) => acc + r.target, 0);
    const loggedCappedCases = requirements.reduce((acc, r) => {
      const loggedCount = surgicalLogs.filter(log => matchesProcedure(log.procedure, r.name)).length;
      return acc + Math.min(r.target, loggedCount);
    }, 0);
    
    const logbookScore = totalTargetCases > 0 
      ? Math.round((loggedCappedCases / totalTargetCases) * 100)
      : 50;

    const attendanceScore = 96; // stable simulated high-tier attendance
    const researchScore = profileAny?.googleScholar ? 85 : 40;
    const facultyEval = 88; // average faculty evaluation
    const teamworkScore = Math.min(100, (profileAny?.recognitionXp ? Number(profileAny.recognitionXp) / 2.5 : 65));

    const finalWeightedScore = Math.round(
      (clinicalScore * 0.3) +
      (academicsScore * 0.2) +
      (logbookScore * 0.15) +
      (attendanceScore * 0.1) +
      (researchScore * 0.1) +
      (facultyEval * 0.1) +
      (teamworkScore * 0.05)
    );

    const chart = [
      { name: "Clinical Skills", value: Math.round(clinicalScore * 0.3), fullVal: clinicalScore, weight: "30%", color: "#06b6d4" },
      { name: "Academic XP", value: Math.round(academicsScore * 0.2), fullVal: academicsScore, weight: "20%", color: "#a855f7" },
      { name: "OT Logbook", value: Math.round(logbookScore * 0.15), fullVal: logbookScore, weight: "15%", color: "#10b981" },
      { name: "Attendance", value: Math.round(attendanceScore * 0.1), fullVal: attendanceScore, weight: "10%", color: "#f59e0b" },
      { name: "Research Link", value: Math.round(researchScore * 0.1), fullVal: researchScore, weight: "10%", color: "#3b82f6" },
      { name: "Faculty Eval", value: Math.round(facultyEval * 0.1), fullVal: facultyEval, weight: "10%", color: "#ec4899" },
      { name: "Team Kudos", value: Math.round(teamworkScore * 0.05), fullVal: teamworkScore, weight: "5%", color: "#e11d48" },
    ];

    return { finalWeightedScore, chart };
  }, [profile, surgicalLogs, requirements]);

  // Live feed data state (stored in local storage to simulate viral loop)
  const [feedItems, setFeedItems] = useState<Array<{ id: string; user: string; text: string; time: string; type: "nomination" | "milestone" | "kudos" }>>(() => {
    const cached = localStorage.getItem("resitrend_live_feed");
    if (cached) return JSON.parse(cached);
    return [
      { id: "f1", user: "Dr. Sandeep Sharma", text: "nominated Dr. Priya Patel for 'Emergency Support' with: 'Splendid handling of 3 deep corneal lacerations on call last night!'", time: "10m ago", type: "nomination" },
      { id: "f2", user: "Dr. Rohan Roy", text: "reached 50 Phaco cases! Unlocked 'Phaco Pioneer' Badge.", time: "2h ago", type: "milestone" },
      { id: "f3", user: "Dr. Ananya Nair", text: "sent Silent Applause kudos to Dr. Kabir Sen: 'Thank you for covering my clinical round in OPD today!'", time: "4h ago", type: "kudos" },
      { id: "f4", user: "Dr. Vikram Seth", text: "published a paper in IJO (Indian Journal of Ophthalmology) on Keratoconus trends.", time: "1d ago", type: "milestone" }
    ];
  });

  // Submit Peer Nomination
  const handleNominate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeId || !nominationMessage.trim()) {
      setNominationStatus("Please choose a resident and supply a citation reason.");
      return;
    }

    const selectedNominee = profiles.find(p => p.uid === nomineeId);
    const nomineeName = selectedNominee ? selectedNominee.displayName : "Resident";

    const newItem = {
      id: "f_" + Date.now(),
      user: profile?.displayName || "Resident",
      text: `nominated ${nomineeName} for '${nominationCategory}' with: "${nominationMessage.trim()}"`,
      time: "Just now",
      type: "nomination" as const
    };

    const updatedFeed = [newItem, ...feedItems];
    setFeedItems(updatedFeed);
    localStorage.setItem("resitrend_live_feed", JSON.stringify(updatedFeed));

    setNominationMessage("");
    setNomineeId("");
    setIsNominateOpen(false);
    setNominationStatus("Nomination posted successfully to Live Feed!");
    setTimeout(() => setNominationStatus(null), 3000);
  };

  // AI assistant responses matching ophthalmic case requests
  const handleAiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userText = aiMessage.trim();
    const newHistory = [...aiHistory, { sender: "user" as const, text: userText }];
    setAiHistory(newHistory);
    setAiMessage("");
    setIsAiTyping(true);

    // Simulate AI clinical reasoning
    setTimeout(() => {
      let aiResponse = "";
      const query = userText.toLowerCase();

      if (query.includes("phaco") || query.includes("cataract")) {
        aiResponse = "For Phacoemulsification documentation: Ensure to detail corneal incision size (e.g., 2.8mm clear corneal), capsulorhexis integrity, phaco power mode used (e.g., torsional burst), and irrigation volume. Would you like me to draft a standardized operative note template for your next log entry?";
      } else if (query.includes("glaucoma") || query.includes("oct") || query.includes("scans")) {
        aiResponse = "Ophthalmic Core Tip: When evaluating AS-OCT (Anterior Segment OCT) scans, look closely at the scleral spur marker to measure angle opening distance (AOD-500/750). Narrow angles (< 20 degrees) indicate potential pupillary block. Recommended reading: AAO BCSC Section 10 (Glaucoma).";
      } else if (query.includes("quiz") || query.includes("mcq") || query.includes("question")) {
        aiResponse = "Here is a high-yield Ophthalmic MCQ practice case:\n\n**Case**: A 62-year-old male presents with sudden, painless, unilateral vision loss. Fundoscopy reveals widespread intraretinal hemorrhages in all four quadrants, dilated tortuous veins, and optic disc edema ('blood and thunder' appearance).\n\n**Question**: What is the most likely diagnosis?\nA) Central Retinal Artery Occlusion (CRAO)\nB) Central Retinal Vein Occlusion (CRVO)\nC) Exudative Macular Degeneration\nD) Diabetic Retinopathy\n\n*Type the correct letter (A/B/C/D) to answer!*";
      } else if (query.trim().toUpperCase() === "B") {
        aiResponse = "Excellent choice! 🎉 **B) Central Retinal Vein Occlusion (CRVO)** is correct. The classic 'blood and thunder' fundus appearance is pathognomonic for CRVO, whereas CRAO presents with a pale retina and a cherry-red spot. You gained +15 simulated Study XP!";
      } else {
        aiResponse = "Interesting clinical inquiry! In ophthalmology, precise visual acuity, anterior chamber status (flare/cells), IOP, and dilated fundus details are key parameters. If this is an emergencies/on-call trauma case, ensure corneal integrity is preserved and check for a Seidel positive leak under fluorescein staining.";
      }

      setAiHistory(prev => [...prev, { sender: "ai" as const, text: aiResponse }]);
      setIsAiTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in text-white" id="desi_dashboard_root">
      
      {/* 1. Profile header banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#13111c] to-[#091514] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-full bg-[radial-gradient(circle_at_bottom_left,rgba(20,185,129,0.06),transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] shadow-lg">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-2xl">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="Resident Profile" className="w-full h-full object-cover rounded-[14px]" />
                  ) : (
                    "👁️"
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-purple-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono flex items-center gap-0.5 shadow">
                <Zap className="h-2.5 w-2.5 text-white animate-pulse" /> JR2
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">{profile?.displayName || "Ophthalmic Resident"}</h1>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[9px] text-cyan-400 uppercase tracking-widest font-mono">
                  Ophthalmology
                </span>
              </div>
              <p className="text-white/50 text-xs mt-1.5 flex items-center gap-3">
                <span className="flex items-center gap-1"><User className="h-3 w-3 text-purple-400" /> Dept of Cornea & Refractive</span>
                <span className="h-3 w-px bg-white/10" />
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-emerald-400" /> Duty Station: Cornea OPD</span>
              </p>
            </div>
          </div>

          {/* Monthly Score Widget driven by Weighted Algorithm */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-4">
            <div>
              <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono">Monthly Weighted Score</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 font-mono">
                  {weightedScoreData.finalWeightedScore}
                </span>
                <span className="text-white/40 text-xs">/ 100</span>
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-xs text-white/60 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Clinical Rank: <strong className="text-emerald-400 font-mono">#4</strong> in JR cohort</span>
              </div>
              <p className="text-[10px] text-white/40 font-mono">Top 5% of Department</p>
            </div>
          </div>
        </div>
      </div>

      {nominationStatus && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400 animate-fade-in shadow-md">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{nominationStatus}</span>
        </div>
      )}

      {logStatus && (
        <div className="bg-teal-500/10 border border-teal-500/20 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-teal-400 animate-fade-in shadow-md">
          <Sparkles className="h-4.5 w-4.5 shrink-0" />
          <span>{logStatus}</span>
        </div>
      )}

      {/* HACK-EYE-THON 2026 Pitch presentation Controller & HIPAA Privacy Shield */}
      <div className="bg-zinc-950/80 border border-cyan-500/35 rounded-2xl p-5 shadow-[0_4px_30px_rgba(6,182,212,0.15)] space-y-4 relative overflow-hidden" id="hackathon_pitch_controller">
        <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest block uppercase">Hack-Eye-Thon 2026 Presentation Rig</span>
              <h2 className="text-sm font-black text-white leading-tight font-sans">Interactive Pitch & Clinical Demonstration Panel</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Presentation Mode Toggle */}
            <button
              onClick={() => {
                const nextMode = !pitchMode;
                setPitchMode(nextMode);
                localStorage.setItem("resitrend_pitch_demo_mode", String(nextMode));
                
                // Dispatch event to app
                const toggleEvent = new CustomEvent("resitrend-toggle-demo", { detail: nextMode });
                window.dispatchEvent(toggleEvent);

                if (nextMode) {
                  // In presentation mode:
                  // 1. Force role to "Senior Resident (Retina)"
                  if (updateProfileBio) {
                    updateProfileBio(profile?.bio || "", "Senior Resident (Retina)" as any);
                  }
                  
                  // 2. Inject dense logs dataset
                  const injectEvent = new CustomEvent("resitrend-inject-demo", { detail: HIGH_FIDELITY_DEMO_LOGS });
                  window.dispatchEvent(injectEvent);
                  
                  triggerToast("Retina Presentation Dataset Loaded!", "+50 pts added to Retina Portfolio | Milestone Achieved.");
                } else {
                  // Revert
                  if (updateProfileBio) {
                    updateProfileBio(profile?.bio || "", "Junior Resident (Y2)" as any);
                  }
                  localStorage.removeItem("resitrend_pitch_demo_mode");
                  localStorage.removeItem("resitrend_surgical_logs");
                  window.location.reload();
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-250 border flex items-center gap-1.5 cursor-pointer ${
                pitchMode 
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-inner" 
                  : "bg-zinc-900 text-white/60 border-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full inline-block ${pitchMode ? "bg-cyan-400 animate-ping" : "bg-white/40"}`} />
              {pitchMode ? "PRESENTATION: ACTIVE" : "ACTIVATE PITCH RIG"}
            </button>

            {/* Privacy Shield Toggle */}
            <button
              onClick={() => {
                const nextPrivacy = !privacyActive;
                setPrivacyActive(nextPrivacy);
                localStorage.setItem("resitrend_privacy_active", String(nextPrivacy));
                triggerToast(
                  nextPrivacy ? "HIPAA De-identification Active" : "HIPAA De-identification Paused",
                  nextPrivacy ? "Patient PII & Supervisor names masked dynamically" : "Raw clinical identifiers exposed"
                );
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                privacyActive 
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/40" 
                  : "bg-zinc-900 text-white/50 border-white/10 hover:text-white"
              }`}
              title="De-identification Privacy Toggle"
            >
              <ShieldCheck className={`h-4.5 w-4.5 ${privacyActive ? "text-emerald-400 animate-pulse" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Presentation Shortcuts */}
        {pitchMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in" id="pitch_shortcuts">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9px] text-cyan-300 font-mono font-bold uppercase tracking-wider block">Demo Action #1</span>
                <p className="text-[11px] text-white/70 leading-normal">Simulate logging a highly complex 23G PPV surgery with 100% complication-free output.</p>
              </div>
              <button
                onClick={() => {
                  const newLog: SurgicalLog = {
                    id: "demo-ppv-complex-" + Date.now(),
                    date: new Date().toISOString().split("T")[0],
                    procedure: "Pars Plana Vitrectomy (PPV)",
                    supervisor: "Dr. Mehta",
                    role: "Performed",
                    difficulty: "Complex",
                    complications: "None"
                  };
                  
                  const updatedLogs = [newLog, ...surgicalLogs];
                  setSurgicalLogs(updatedLogs);
                  triggerToast("+50 pts added to Retina Portfolio", "Milestone Achieved | Case Validation Verified.");
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-sans font-bold py-1.5 px-2.5 rounded-lg text-[10px] transition cursor-pointer text-center"
              >
                Log Complex PPV (+50 XP)
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9px] text-purple-300 font-mono font-bold uppercase tracking-wider block">Demo Action #2</span>
                <p className="text-[11px] text-white/70 leading-normal">Load messy resident clinical text directly into the AI Case-Sieve input box below.</p>
              </div>
              <button
                onClick={() => {
                  setClinicalNoteInput("JR2 logged 23G phaco PPV for non-clearing vitreous hemorrhage secondary to diabetic retinopathy, laser PRP completed under supervisor Dr. Mehta. Mild zonular laxity but no vitreous loss.");
                  triggerToast("Sample Note Loaded", "Ready to test Gemini Sieve parsing");
                }}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-sans font-bold py-1.5 px-2.5 rounded-lg text-[10px] transition cursor-pointer text-center"
              >
                Load Messy Vitrectomy Note
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9px] text-emerald-300 font-mono font-bold uppercase tracking-wider block">Demo Action #3</span>
                <p className="text-[11px] text-white/70 leading-normal">Toggle between different specialty benchmark curves inside the Living CV Portfolio tab.</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("portfolio");
                  triggerToast("Switched to Living CV & Benchmarks", "Interact with the ACGME curve or switch specialties.");
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-sans font-bold py-1.5 px-2.5 rounded-lg text-[10px] transition cursor-pointer text-center border border-white/5"
              >
                Show Competency Curve Tab
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-white/40 font-sans">
            <Info className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Click <strong className="text-white/70 font-semibold">ACTIVATE PITCH RIG</strong> to switch to Retina Resident presentation profile, seed high-fidelity benchmarks, and access live demo controllers.</span>
          </div>
        )}
      </div>

      {/* 2. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN - Gamified Stats, Milestones, and Logbook Widget (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Milestone and Badge Shelf Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Trophy className="h-4.5 w-4.5 text-amber-400" /> Next Milestone Radar
                </h2>
                <p className="text-[11px] text-white/40 mt-0.5">Fulfill micro-requirements to earn prestigious medical badges</p>
              </div>
              <button 
                onClick={() => setActiveTab("portfolio")} 
                className="text-[10px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-0.5 transition hover:underline"
              >
                View Achievements <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Milestones progression list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {milestones.map((milestone) => {
                const percent = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
                return (
                  <div key={milestone.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-2 relative overflow-hidden group hover:border-white/10 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg bg-white/5 h-8 w-8 rounded-lg flex items-center justify-center shadow-inner">{milestone.iconName}</span>
                        <div>
                          <span className="block text-xs font-bold text-white/95 leading-tight">{milestone.category}</span>
                          <span className="block text-[9px] text-white/40 font-mono">Badge: {milestone.badgeName}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        {percent}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-white/45 font-mono">
                        <span>Current: {milestone.current}</span>
                        <span>Target: {milestone.target}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Badges Shelf */}
            <div className="pt-3 border-t border-white/5">
              <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold mb-3.5">
                Earned Badges & Credentials
              </span>
              <div className="flex flex-wrap gap-3">
                {badges.map((b, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition duration-200 ${
                      b.unlocked 
                        ? "bg-white/[0.03] border-white/10 text-white/90 shadow-sm hover:bg-white/[0.05]" 
                        : "bg-white/[0.01] border-white/5 opacity-40 grayscale select-none"
                    }`}
                  >
                    <span className="text-lg">{b.icon}</span>
                    <div className="text-[10px]">
                      <span className="block font-bold leading-none">{b.name}</span>
                      <span className="block text-[8px] text-white/40 font-light mt-0.5">{b.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Surgical Log Form Card */}
          <div className="bg-gradient-to-br from-[#12141c] to-[#0f1118] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Stethoscope className="h-4.5 w-4.5 text-teal-400 animate-pulse" /> Surgical Logbook Quick-Log
                </h2>
                <p className="text-[11px] text-white/40 mt-0.5">Submit case details with just 2 taps directly between OT procedures</p>
              </div>
              <button 
                onClick={() => setActiveTab("logbook")} 
                className="text-[10px] text-teal-400 hover:text-teal-300 font-mono flex items-center gap-0.5 transition hover:underline"
              >
                Expand Logbook <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <form onSubmit={handleQuickLog} className="space-y-4">
              {/* Quick Select Buttons */}
              <div className="space-y-2">
                <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">Procedure Type</span>
                <div className="flex flex-wrap gap-2">
                  {quickProcedures.map((proc) => (
                    <button
                      key={proc}
                      type="button"
                      onClick={() => setLogProcedure(proc)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                        logProcedure === proc 
                          ? "bg-teal-500/10 border-teal-500/30 text-teal-300 shadow-sm" 
                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {proc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Supervisor selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono">Supervisor</label>
                  <select 
                    value={logSupervisor}
                    onChange={(e) => setLogSupervisor(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white/90 focus:outline-none focus:border-teal-500/50"
                  >
                    {supervisorList.map((sup) => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>

                {/* Role selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono">Your Role</label>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-xl border border-white/5">
                    {(["Assisted", "Performed"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setLogRole(role)}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logRole === role 
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/10" 
                            : "text-white/40 hover:text-white/80"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono">Difficulty</label>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-white/5">
                    {(["Easy", "Medium", "Complex"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setLogDifficulty(diff)}
                        className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                          logDifficulty === diff 
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/10" 
                            : "text-white/40 hover:text-white/80"
                        }`}
                      >
                        {diff[0]}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Action bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <Calendar className="h-3.5 w-3.5" />
                  <input 
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="bg-transparent border-none text-white/50 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-teal-500/10"
                >
                  <Plus className="h-3.5 w-3.5" /> Log OT Case
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN - Weighted Performance and Feed (4/12) */}
        <div className="lg:col-span-4 space-y-6">

          {/* AI CASE-SIEVE: PARSING MESSED CLINICAL NOTES VIA GEMINI */}
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden" id="ai_case_sieve_panel">
            <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="border-b border-white/5 pb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <BrainCircuit className="h-4.5 w-4.5 text-purple-400" /> AI Case-Sieve Log Engine
                </h2>
                <p className="text-[10px] text-white/40 mt-0.5">Parse unstructured operative notes into validated logs</p>
              </div>
              <span className="bg-purple-500/10 text-purple-300 text-[8px] px-1.5 py-0.5 rounded-full font-mono uppercase font-black border border-purple-500/20">
                Gemini-3.5
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] text-white/50 font-mono font-bold uppercase tracking-wider">Unstructured Operative Note</label>
              <textarea
                value={clinicalNoteInput}
                onChange={(e) => setClinicalNoteInput(e.target.value)}
                placeholder="Paste hand-written clinical logs here (e.g., 'Phaco with CTR Dr. Nair performed, mild zonular laxity but no vit loss...')"
                className="w-full h-24 bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none font-sans"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setClinicalNoteInput("Scleral band placed, 23G PPV for dense PDR vitreous hemorrhage. Subtotal vitrectomy performed with extensive endolaser PRP. Instilled SF6 gas. Supervision by Dr. Sengupta. Fully deidentified.");
                    triggerToast("Sample Note Loaded", "Ready for parsing");
                  }}
                  className="text-[9px] text-purple-400 hover:text-purple-300 font-mono transition"
                >
                  Load Sample Note
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!clinicalNoteInput.trim()) {
                      setSieveError("Please provide an operative note first.");
                      return;
                    }
                    setIsSieving(true);
                    setSieveError(null);
                    setSievedCase(null);

                    try {
                      const res = await fetch("/api/gemini/parse-clinical-note", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          clinicalNote: clinicalNoteInput,
                          residentTier: profile?.year || "Senior Resident (Retina)"
                        })
                      });

                      const data = await res.json();
                      if (data.success && data.data) {
                        setSievedCase(data.data);
                        triggerToast("Case Sieved Successfully!", "Mapped complications and extracted points cleanly");
                      } else {
                        setSieveError(data.error || "Failed to parse note.");
                      }
                    } catch (err: any) {
                      setSieveError("API unreachable or Gemini key missing.");
                      console.error(err);
                    } finally {
                      setIsSieving(false);
                    }
                  }}
                  disabled={isSieving}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-sans font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  {isSieving ? "Sieving Note..." : "AI Sieve Note"}
                </button>
              </div>

              {sieveError && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-[10px] text-rose-400 font-mono">
                  Error: {sieveError}
                </div>
              )}

              {/* Render parsed output dynamically */}
              <AnimatePresence>
                {sievedCase && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-3"
                    id="parsed_case_result"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-purple-300 font-bold">MAPPED CASE OUTPUT</span>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {sievedCase.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase font-mono">Procedure</span>
                        <span className="text-white font-bold block leading-tight">{sievedCase.procedureName}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase font-mono">Supervisor</span>
                        <span className="text-white font-bold block leading-tight">
                          {privacyActive ? `[REDACTED-${sievedCase.supervisor.toUpperCase().replace("DR. ", "").replace(/\s/g, "")}]` : sievedCase.supervisor}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-white/40 block text-[9px] uppercase font-mono">Complication Audit</span>
                        <span className={`font-mono font-bold block ${sievedCase.complications.toLowerCase() === "none" ? "text-emerald-400" : "text-amber-400"}`}>
                          {sievedCase.complications}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#09090b] border border-white/5 rounded-lg p-2.5 space-y-1.5">
                      <span className="text-[8px] text-white/40 uppercase font-mono block">HIPAA De-Identified Summary</span>
                      <p className="text-[10px] text-white/70 leading-relaxed font-sans">{sievedCase.summary}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] font-mono text-white/40">
                        <span>ID: {sievedCase.patientId}</span>
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <ShieldCheck className="h-3 w-3" /> HIPAA SECURE
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newLog: SurgicalLog = {
                          id: "sieve-log-" + Date.now(),
                          date: new Date().toISOString().split("T")[0],
                          procedure: sievedCase.procedureName,
                          supervisor: sievedCase.supervisor,
                          role: "Performed",
                          difficulty: sievedCase.difficulty as any,
                          complications: sievedCase.complications
                        };

                        setSurgicalLogs([newLog, ...surgicalLogs]);
                        setSievedCase(null);
                        setClinicalNoteInput("");
                        triggerToast(`+${sievedCase.points} pts added to Retina Portfolio`, "AI Sieve Point validation successful.");
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-sans font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer text-center"
                    >
                      Validate & Log {sievedCase.points} XP
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Weighted score ring chart (Resident of the Month Tracker) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="border-b border-white/5 pb-2.5">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-cyan-400" /> Resident Score Breakdown
              </h2>
              <p className="text-[10px] text-white/40 mt-0.5">Real-time performance weight distribution across core indicators</p>
            </div>

            {/* Ring Chart widget */}
            <div className="relative h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightedScoreData.chart}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {weightedScoreData.chart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Central Ring Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white font-mono leading-none">{weightedScoreData.finalWeightedScore}</span>
                <span className="text-[9px] text-white/40 uppercase mt-1 tracking-wider font-mono">Weighted Total</span>
              </div>
            </div>

            {/* Metrics List Legend */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
              {weightedScoreData.chart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white/[0.01] hover:bg-white/5 p-1.5 rounded-lg border border-transparent hover:border-white/5 transition">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white/75 font-sans font-medium">{item.name}</span>
                    <span className="text-[9px] text-white/30 font-mono">({item.weight})</span>
                  </div>
                  <span className="font-mono text-white/95 font-semibold">{item.fullVal}/100</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Department Feed */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Heart className="h-4.5 w-4.5 text-rose-400" /> Live Department Feed
                  </h2>
                  <p className="text-[10px] text-white/40 mt-0.5">Real-time peer recognitions & log milestones</p>
                </div>
                
                <button 
                  onClick={() => setIsNominateOpen(true)}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[10px] font-bold text-rose-400 transition cursor-pointer"
                >
                  Nominate Peer
                </button>
              </div>

              {/* Feed items list */}
              <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin pr-1" id="live_feed_items_wrapper">
                {feedItems.map((item) => (
                  <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs space-y-1 transition hover:border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white/80">{item.user}</span>
                      <span className="text-[9px] text-white/30 font-mono">{item.time}</span>
                    </div>
                    <p className="text-white/65 font-sans leading-relaxed text-[11px]">{item.text}</p>
                    <div className="flex items-center gap-1">
                      {item.type === "nomination" && <span className="text-[8px] bg-rose-500/10 text-rose-400 font-bold px-1.5 py-0.2 rounded font-mono uppercase">Nomination</span>}
                      {item.type === "milestone" && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.2 rounded font-mono uppercase">Milestone</span>}
                      {item.type === "kudos" && <span className="text-[8px] bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.2 rounded font-mono uppercase">Kudos</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Floating AI Study Buddy FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiOpen(true)}
          className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-115 active:scale-95 transition-all group relative border border-white/20"
          title="AI Ophthalmic Study Buddy"
        >
          <BrainCircuit className="h-5.5 w-5.5 animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[7px] font-black font-mono px-1 rounded-full border border-[#09090b] uppercase tracking-wider scale-95 shadow">
            Beta
          </span>
        </button>
      </div>

      {/* Nominate a Peer Modal */}
      {isNominateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-[#09090b] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-rose-400" /> Nominate a Resident Peer
              </h3>
              <button 
                onClick={() => setIsNominateOpen(false)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleNominate} className="space-y-4">
              {/* Resident selection */}
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">Choose Resident</label>
                <select 
                  value={nomineeId}
                  onChange={(e) => setNomineeId(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white/95 focus:outline-none focus:border-rose-400"
                >
                  <option value="">-- Select Resident --</option>
                  {profiles
                    .filter(p => p.uid !== profile?.uid)
                    .map(p => (
                      <option key={p.uid} value={p.uid}>{p.displayName} ({p.year})</option>
                    ))}
                </select>
              </div>

              {/* Citation category */}
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">Nomination Pillar</label>
                <select 
                  value={nominationCategory}
                  onChange={(e) => setNominationCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white/95 focus:outline-none focus:border-rose-400"
                >
                  <option value="Emergency support">Emergency support</option>
                  <option value="Teaching help">Teaching help</option>
                  <option value="Research assistance">Research assistance</option>
                  <option value="Clinical teamwork">Clinical teamwork</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5 font-bold">Citation / Reasons</label>
                <textarea
                  value={nominationMessage}
                  onChange={(e) => setNominationMessage(e.target.value)}
                  placeholder="e.g., Covered my OPD duty today flawlessly under heavy pressure..."
                  rows={4}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl text-xs py-2 px-3 text-white focus:outline-none focus:border-rose-400 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNominateOpen(false)}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-4 py-1.5 rounded-lg text-xs tracking-tight transition cursor-pointer"
                >
                  Publish Nomination
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* AI Study Buddy Chat Overlay */}
      <AnimatePresence>
        {isAiOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="w-full max-w-md bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[520px] relative overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-950 to-purple-950 p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
                    <BrainCircuit className="h-4.5 w-4.5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                      AI Study Buddy <span className="bg-cyan-400/15 text-cyan-300 text-[8px] px-1 py-0.2 rounded font-mono uppercase">Beta</span>
                    </h3>
                    <p className="text-[10px] text-white/50 mt-1">Ophthalmic AI Knowledge Assistant</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiOpen(false)}
                  className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Suggestion tags banner */}
              <div className="bg-white/[0.02] border-b border-white/5 px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <button 
                  onClick={() => setAiMessage("Give me an ophthalmic practice MCQ")}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 rounded px-2.5 py-1 text-[10px] text-white/70 hover:text-white cursor-pointer shrink-0"
                >
                  📚 Practice MCQ
                </button>
                <button 
                  onClick={() => setAiMessage("Template for logging Phaco surgery")}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 rounded px-2.5 py-1 text-[10px] text-white/70 hover:text-white cursor-pointer shrink-0"
                >
                  📖 Phaco Template
                </button>
                <button 
                  onClick={() => setAiMessage("Explain AS-OCT narrow angle parameters")}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 rounded px-2.5 py-1 text-[10px] text-white/70 hover:text-white cursor-pointer shrink-0"
                >
                  🔬 AS-OCT scans
                </button>
              </div>

              {/* Chat History Panel */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
                {aiHistory.map((item, index) => (
                  <div key={index} className={`flex ${item.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed shadow-sm ${
                      item.sender === "user" 
                        ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-br-none" 
                        : "bg-white/5 border border-white/5 text-white/90 rounded-bl-none"
                    }`}>
                      <p className="whitespace-pre-line">{item.text}</p>
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 rounded-bl-none">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAiSend} className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Ask a question or request a case study..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
                />
                
                <button 
                  type="button"
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 text-cyan-400 hover:text-cyan-300 rounded-xl transition cursor-pointer"
                  title="Dictate Operative Report (Beta Voice)"
                  onClick={() => {
                    setAiMessage("Translating ophthalmic dictation draft: JR2 logged uneventful performed phaco...");
                  }}
                >
                  <Mic className="h-4 w-4" />
                </button>

                <button 
                  type="submit"
                  className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-500 text-zinc-950 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-bold transition cursor-pointer active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
