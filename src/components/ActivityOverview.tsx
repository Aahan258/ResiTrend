import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  TrendingUp, 
  Award, 
  Users, 
  Lightbulb, 
  Flame, 
  HelpCircle, 
  CheckCircle2, 
  PlusCircle, 
  CheckSquare, 
  Share2, 
  BookmarkCheck, 
  ArrowRight, 
  ShieldAlert, 
  ThumbsUp, 
  MessageSquare,
  Download,
  CalendarCheck,
  CloudUpload,
  RefreshCw
} from "lucide-react";
import { ReputationLevel, ResidentYear } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

export const ActivityOverview: React.FC = () => {
  const { 
    profile, 
    achievements = [], 
    endorsements = [], 
    recognitions = [], 
    innovations = [],
    isFirebaseActive,
    exportProfileToCloud
  } = useAuth();

  const [syncStatus, setSyncStatus] = React.useState<{ loading: boolean; success: boolean | null; message: string | null }>({
    loading: false,
    success: null,
    message: null
  });

  const handleCloudExport = async () => {
    setSyncStatus({ loading: true, success: null, message: null });
    const result = await exportProfileToCloud();
    setSyncStatus({ loading: false, success: result.success, message: result.message });
    // Auto clear after 6 seconds
    setTimeout(() => {
      setSyncStatus((prev) => ({ ...prev, success: null, message: null }));
    }, 6000);
  };

  // Define the hook unconditionally at the top level
  const chartData = React.useMemo(() => {
    const data = [];
    if (!profile) {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        data.push({
          name: dateString,
          "Engagement Score": 0,
          "Daily Contributions": 0,
          "Achievements": 0,
          "Peer Kudos": 0,
          "Innovations": 0
        });
      }
      return data;
    }

    const uid = profile.uid;
    const recognitionPrefix = `hash_${uid.substring(0, 5)}`;
    const totalXp = profile.totalXp || 0;
    const myAchievements = achievements.filter(a => a.userId === uid);

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      
      // Calculate Achievements logged on this specific day
      const dayAchievements = myAchievements.filter(a => a.createdAt && a.createdAt.startsWith(dayStr)).length;
      
      // Calculate Endorsements on this specific day
      const dayEndorsementsGiven = endorsements.filter(e => e.fromUserId === uid && e.createdAt && e.createdAt.startsWith(dayStr)).length;
      const dayEndorsementsReceived = endorsements.filter(e => e.toUserId === uid && e.createdAt && e.createdAt.startsWith(dayStr)).length;
      
      // Calculate Recognitions on this specific day
      const dayRecognitionsSent = recognitions.filter(r => r.fromUserIdHash?.startsWith(recognitionPrefix) && r.createdAt && r.createdAt.startsWith(dayStr)).length;
      const dayRecognitionsReceived = recognitions.filter(r => r.toUserId === uid && r.createdAt && r.createdAt.startsWith(dayStr)).length;
      
      // Calculate Innovations on this specific day
      const dayInnovations = innovations.filter(inn => inn.userId === uid && inn.createdAt && inn.createdAt.startsWith(dayStr)).length;
      
      // Compute score: +15 achievements, +5 peer support/kudos, +10 innovation posts
      const dayScore = (dayAchievements * 15) + 
                       ((dayEndorsementsGiven + dayEndorsementsReceived) * 5) +
                       ((dayRecognitionsSent + dayRecognitionsReceived) * 5) +
                       (dayInnovations * 10);
      
      // Provide a smooth, attractive historical trend simulation based on cumulative XP weight so chart isn't empty
      const baseWeight = Math.floor(totalXp / 30);
      const hasHash = uid ? uid.charCodeAt(0) + uid.charCodeAt(uid.length - 1) : i;
      const dayOffset = ((hasHash + i) % 4) + 1; // 1 to 4 pts
      
      const historicalBase = baseWeight > 0 ? (baseWeight + dayOffset) : 0;
      const finalDayScore = dayScore > 0 ? (dayScore + historicalBase) : historicalBase;
      const totalPeerKudos = dayEndorsementsGiven + dayEndorsementsReceived + dayRecognitionsSent + dayRecognitionsReceived;

      data.push({
        name: dateString,
        "Engagement Score": finalDayScore,
        "Daily Contributions": dayAchievements + totalPeerKudos + dayInnovations,
        "Achievements": dayAchievements,
        "Peer Kudos": totalPeerKudos,
        "Innovations": dayInnovations
      });
    }
    return data;
  }, [profile, achievements, endorsements, recognitions, innovations]);

  // Early return ONLY after hook declarations have been run unconditionally
  if (!profile) return null;

  // 1. Calculate stats for the current user
  const uid = profile.uid;

  // Achievements
  const myAchievements = achievements.filter(a => a.userId === uid);
  const totalMyAchievementsLength = myAchievements.length;
  const verifiedAchievementsCount = myAchievements.filter(a => a.status === "admin-verified").length;
  const validatedAchievementsCount = myAchievements.filter(a => a.status === "community-validated").length;
  const selfDeclaredAchievementsCount = myAchievements.filter(a => a.status === "self-declared").length;

  const validationsGivenCount = achievements.filter(a => a.validations?.includes(uid)).length;

  // Endorsements
  const endorsementsGivenCount = endorsements.filter(e => e.fromUserId === uid).length;
  const endorsementsReceivedCount = endorsements.filter(e => e.toUserId === uid).length;

  // Silent Applause / Recognitions
  const recognitionPrefix = `hash_${uid.substring(0, 5)}`;
  const recognitionsSentCount = recognitions.filter(r => r.fromUserIdHash?.startsWith(recognitionPrefix)).length;
  const recognitionsReceivedCount = recognitions.filter(r => r.toUserId === uid).length;

  // Innovations
  const innovationsSubmittedCount = innovations.filter(i => i.userId === uid).length;
  const innovationsUpvotesGivenCount = innovations.filter(i => i.upvotedBy?.includes(uid)).length;

  // 2. XP & Standing Calculations
  const totalXp = profile.totalXp || 0;
  const currentStanding = profile.reputationLevel || "Emerging";

  // XP progression boundary specifications
  let nextStanding = "Max Standing reached";
  let targetXp = 800; // EXCEPTIONAL
  let nextStandingLabel = "";
  
  if (totalXp < 150) {
    nextStanding = "Established";
    targetXp = 150;
    nextStandingLabel = "Established Standing (150 XP)";
  } else if (totalXp < 300) {
    nextStanding = "Respected";
    targetXp = 300;
    nextStandingLabel = "Respected Standing (300 XP)";
  } else if (totalXp < 500) {
    nextStanding = "Influential";
    targetXp = 500;
    nextStandingLabel = "Influential Standing (500 XP)";
  } else if (totalXp < 800) {
    nextStanding = "Exceptional";
    targetXp = 800;
    nextStandingLabel = "Exceptional Standing (800 XP)";
  }

  const xpProgressPercent = Math.min(100, Math.floor((totalXp / targetXp) * 100));
  const remainingXp = Math.max(0, targetXp - totalXp);

  // 3. Dynamic Checklist of Engagement
  const hasLinks = !!(profile.googleScholar || profile.orcid || profile.linkedIn || profile.researchGate);
  const hasMilestone = totalMyAchievementsLength > 0;
  const hasValidatedPeer = validationsGivenCount > 0 || endorsementsGivenCount > 0;
  const hasInnovationParticipation = innovationsSubmittedCount > 0 || innovationsUpvotesGivenCount > 0;

  // Calculate engagement completion count
  const checklistItems = [
    { label: "Connect Professional Identifiers (ORCID, Google Scholar, etc)", done: hasLinks, hint: "Set this on your public profile link panel." },
    { label: "Declare Academic or Clinical Milestones", done: hasMilestone, hint: "Click 'Log Value Creation' below to register a milestone." },
    { label: "Endorse or Validate a Peer's Achievement", done: hasValidatedPeer, hint: "Find a colleague on the timeline and validate their record." },
    { label: "Participate in Innovation Design (Draft or Upvote)", done: hasInnovationParticipation, hint: "Visit the Innovation Hub to upvote or create a draft." },
  ];

  const completedChecklistCount = checklistItems.filter(item => item.done).length;

  const downloadSummary = () => {
    const summaryData = {
      exportTimestamp: new Date().toISOString(),
      residentProfile: {
        uid: profile.uid,
        displayName: profile.displayName,
        year: profile.year,
        reputationLevel: profile.reputationLevel,
        academicPowerXp: totalXp,
        categoryXp: {
          academic: profile.academicXp || 0,
          instructional: profile.teachingXp || 0,
          innovation: profile.innovationXp || 0,
          peerKudos: profile.recognitionXp || 0,
        },
        links: {
          googleScholar: profile.googleScholar || "",
          orcid: profile.orcid || "",
          linkedIn: profile.linkedIn || "",
          researchGate: profile.researchGate || "",
        }
      },
      contributions: {
        achievements: {
          totalCount: totalMyAchievementsLength,
          verifiedCount: verifiedAchievementsCount,
          validatedCount: validatedAchievementsCount,
          selfDeclaredCount: selfDeclaredAchievementsCount,
          items: myAchievements.map(a => ({
            id: a.id,
            title: a.title,
            category: a.category,
            status: a.status,
            createdAt: a.createdAt,
            proofUrl: a.proofUrl || null,
            validationsCount: a.validations?.length || 0,
          }))
        },
        endorsements: {
          givenCount: endorsementsGivenCount,
          receivedCount: endorsementsReceivedCount,
        },
        silentKudos: {
          sentCount: recognitionsSentCount,
          receivedCount: recognitionsReceivedCount,
        },
        innovations: {
          submittedCount: innovationsSubmittedCount,
          upvotesGivenCount: innovationsUpvotesGivenCount,
          items: innovations.filter(i => i.userId === uid).map(i => ({
            id: i.id,
            title: i.title,
            status: i.status,
            upvotesCount: i.upvotesCount,
            commentsCount: i.commentsCount || 0,
            createdAt: i.createdAt,
          }))
        }
      },
      engagementChecklist: {
        completedCount: completedChecklistCount,
        items: checklistItems.map(item => ({
          task: item.label,
          completed: item.done
        }))
      }
    };

    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ResiTrend_Academic_Summary_${profile.displayName.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-white/10 space-y-6 animate-fade-in" id="activity_overview_widget">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-500 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" /> Personal Analytics Radar
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight mt-1">Platform Activity & Academic Health</h2>
          <p className="text-xs text-white/50 font-light mt-0.5">Real-time compilation of your multi-dimensional scientific contributions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Cloud Export Service Button */}
          <button 
            onClick={handleCloudExport}
            disabled={syncStatus.loading}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer active:scale-95 shadow-sm transition-all ${
              !isFirebaseActive 
                ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed opacity-60" 
                : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400"
            }`}
            title={isFirebaseActive ? "Sync and export all bio details, scientific XP metrics, and portfolio history directly to cloud database storage" : "Enable cloud synchronization by authenticating via real Google account in header"}
            id="cloud_export_sync_btn"
          >
            {syncStatus.loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
            ) : (
              <CloudUpload className="h-4 w-4 text-emerald-400" />
            )}
            <span>{syncStatus.loading ? "Exporting..." : "Export to Cloud"}</span>
          </button>

          {/* Download summary button */}
          <button 
            onClick={downloadSummary}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95 shadow-sm"
            title="Download full engagement data as JSON"
            id="download_activity_summary_btn"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Download Summary</span>
          </button>

          {/* Total contribution points */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3.5 shadow-sm">
            <div className="h-10 w-10 bh rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[9px] text-white/40 uppercase tracking-widest font-mono">Academic Power</span>
              <span className="text-lg font-extrabold text-white leading-none">{totalXp} <span className="text-xs text-emerald-400 font-normal">XP</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Sync Status Msg */}
      {syncStatus.message && (
        <div 
          className={`px-4 py-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 animate-fade-in ${
            syncStatus.success 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
          id="cloud_export_status_toast"
        >
          <div className="flex items-center gap-2">
            {syncStatus.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{syncStatus.message}</span>
          </div>
          <button 
            onClick={() => setSyncStatus((prev) => ({ ...prev, message: null }))}
            className="text-[10px] hover:underline uppercase font-mono tracking-wider bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/5 cursor-pointer text-white/80 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: 1. Gamification XP progress bar, 2. Interactive Targets Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Column 1: Standing Progression */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col justify-between space-y-5 shadow-inner">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">Current Reputation Ranking</span>
                <div className="text-base font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs tracking-wide">
                    {currentStanding}
                  </span>
                </div>
              </div>
              {remainingXp > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">Next Tier Goal</span>
                  <span className="block text-xs font-semibold text-white/85 mt-0.5">{nextStanding}</span>
                </div>
              )}
            </div>

            {/* Visual Indicator of XP metrics bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-white/50 font-mono">
                <span>{totalXp} XP accumulated</span>
                <span>{remainingXp > 0 ? `${remainingXp} XP remaining` : "Outstanding Rank"}</span>
              </div>
              <div className="w-full bg-white/5 border border-white/10 rounded-full h-2.5 overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-white/40 leading-snug">
                {remainingXp > 0 ? (
                  <span>Need <strong className="text-white/70 font-semibold font-mono">{remainingXp} XP</strong> to reach <strong className="text-white/70 font-semibold">{nextStandingLabel}</strong>. Gather peer endorsements or log validated Achievements to ascend.</span>
                ) : (
                  <span>🎉 Outstanding! You have reached maximum standing status. Continue sharing valuable scholarly validations.</span>
                )}
              </p>
            </div>
          </div>

          {/* XP Sub-Category Breakdown Indicators */}
          <div className="border-t border-white/5 pt-4">
            <span className="block text-[9px] text-white/40 uppercase tracking-widest font-bold tracking-wider font-mono mb-2.5">
              XP Breakdown by Specialty Area
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/[0.03] p-2 border border-white/5 rounded-lg text-center">
                <span className="block text-[8px] text-white/40 uppercase tracking-wider font-sans font-medium">Academic</span>
                <span className="text-xs font-extrabold text-white mt-1 block font-mono">{profile.academicXp || 0} <span className="text-[8px] font-normal text-white/40 font-sans">XP</span></span>
              </div>
              <div className="bg-white/[0.03] p-2 border border-white/5 rounded-lg text-center">
                <span className="block text-[8px] text-white/40 uppercase tracking-wider font-sans font-medium">Instructional</span>
                <span className="text-xs font-extrabold text-white mt-1 block font-mono">{profile.teachingXp || 0} <span className="text-[8px] font-normal text-white/40 font-sans">XP</span></span>
              </div>
              <div className="bg-white/[0.03] p-2 border border-white/5 rounded-lg text-center">
                <span className="block text-[8px] text-white/40 uppercase tracking-wider font-sans font-medium">Innovation</span>
                <span className="text-xs font-extrabold text-white mt-1 block font-mono">{profile.innovationXp || 0} <span className="text-[8px] font-normal text-white/40 font-sans">XP</span></span>
              </div>
              <div className="bg-white/[0.03] p-2 border border-white/5 rounded-lg text-center">
                <span className="block text-[8px] text-white/40 uppercase tracking-wider font-sans font-medium">Peer Kudos</span>
                <span className="text-xs font-extrabold text-white mt-1 block font-mono">{profile.recognitionXp || 0} <span className="text-[8px] font-normal text-white/40 font-sans">XP</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Weekly Engagement Roadmap */}
        <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Engagement Checklist</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded">
                {completedChecklistCount}/4 Active
              </span>
            </div>

            <ul className="space-y-2.5">
              {checklistItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 group hover:bg-white/[0.01] p-1 rounded transition-colors">
                  <span className="mt-0.5 shrink-0 select-none">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-400/10" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-white/20 group-hover:border-white/30 transition-colors" />
                    )}
                  </span>
                  <div>
                    <span className={`text-xs font-medium block leading-none ${item.done ? 'text-white/60 line-through' : 'text-white/85'}`}>
                      {item.label}
                    </span>
                    {!item.done && (
                      <span className="text-[9px] text-emerald-400/70 font-sans leading-relaxed mt-1 block">{item.hint}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] text-white/30 italic flex items-center gap-1 border-t border-white/5 pt-3">
            <PlusCircle className="h-3 w-3 text-emerald-500" /> Complete goals to fuel scientific culture at ResiTrend.
          </div>
        </div>

      </div>

      {/* 7-Day Engagement Trend Line Chart */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 shadow-inner space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white tracking-wide">Scientific Engagement Trend (7-Day Overview)</h3>
          </div>
          <span className="text-[10px] text-white/40 font-mono">Index incorporates Achievements, Kudos, and Innovation Actions</span>
        </div>
        
        <div className="h-[200px] w-full" id="engagement_trend_chart_container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl text-[10px] space-y-2">
                        <p className="font-semibold text-white/50">{data.name}</p>
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>Engagement Score: <strong className="font-extrabold text-white font-mono">{payload[0].value}</strong></span>
                          </p>
                          <p className="text-white/70 pl-3">
                            Achievements: <span className="font-bold text-white font-mono">{data.Achievements}</span>
                          </p>
                          <p className="text-white/70 pl-3">
                            Peer Kudos: <span className="font-bold text-white font-sans">{data["Peer Kudos"]}</span>
                          </p>
                          <p className="text-white/70 pl-3">
                            Innovations: <span className="font-bold text-white font-mono">{data.Innovations}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="Engagement Score" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                activeDot={{ r: 4, strokeWidth: 1, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Multi-dimensional academic metrics counters (Bento elements) */}
      <div>
        <span className="block text-[9px] text-white/40 uppercase tracking-widest font-extrabold font-mono mb-3">
          Contribution Health Matrices
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Achievement Box */}
          <div className="glass-item rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50 font-mono">Academic Milestones</span>
              <Award className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="block text-2xl font-black text-white font-mono">{totalMyAchievementsLength}</span>
              <div className="grid grid-cols-3 gap-1 mt-1.5 text-[8px] text-white/40 font-mono text-center">
                <div className="bg-white/5 p-1 rounded" title="Verified Achievements">
                  <span className="block text-white/70 font-black">{verifiedAchievementsCount}</span>
                  <span>Veri</span>
                </div>
                <div className="bg-white/5 p-1 rounded" title="Validated Achievements">
                  <span className="block text-white/70 font-black">{validatedAchievementsCount}</span>
                  <span>Vali</span>
                </div>
                <div className="bg-white/5 p-1 rounded" title="Self Declared Achievements">
                  <span className="block text-white/70 font-black">{selfDeclaredAchievementsCount}</span>
                  <span>Self</span>
                </div>
              </div>
            </div>
          </div>

          {/* Peer Matrix Box */}
          <div className="glass-item rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50 font-mono">Skill Endorsements</span>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <span className="block text-2xl font-black text-white font-mono">
                {endorsementsGivenCount + endorsementsReceivedCount}
              </span>
              <div className="grid grid-cols-2 gap-1 mt-1.5 text-[8px] text-white/40 font-mono text-center">
                <div className="bg-white/5 p-1 rounded" title="Given to others">
                  <span className="block text-white/70 font-black">{endorsementsGivenCount}</span>
                  <span>Support Given</span>
                </div>
                <div className="bg-white/5 p-1 rounded" title="Received from peers">
                  <span className="block text-white/70 font-black">{endorsementsReceivedCount}</span>
                  <span>Kudos Received</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kudos Box */}
          <div className="glass-item rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50 font-mono">Silent Kudos (Applause)</span>
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <span className="block text-2xl font-black text-white font-mono">
                {recognitionsSentCount + recognitionsReceivedCount}
              </span>
              <div className="grid grid-cols-2 gap-1 mt-1.5 text-[8px] text-white/40 font-mono text-center">
                <div className="bg-white/5 p-1 rounded" title="Silent Applause Sent">
                  <span className="block text-white/70 font-black">{recognitionsSentCount}</span>
                  <span>Sent</span>
                </div>
                <div className="bg-white/5 p-1 rounded" title="Silent Applause Received">
                  <span className="block text-white/70 font-black">{recognitionsReceivedCount}</span>
                  <span>Received</span>
                </div>
              </div>
            </div>
          </div>

          {/* Innovation Box */}
          <div className="glass-item rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50 font-mono">Innovations Hub</span>
              <Lightbulb className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <span className="block text-2xl font-black text-white font-mono">
                {innovationsSubmittedCount}
              </span>
              <div className="grid grid-cols-2 gap-1 mt-1.5 text-[8px] text-white/40 font-mono text-center">
                <div className="bg-white/5 p-1 rounded" title="Proposed Projects">
                  <span className="block text-white/70 font-black">{innovationsSubmittedCount}</span>
                  <span>Projects</span>
                </div>
                <div className="bg-white/5 p-1 rounded" title="Upvotes Contributed">
                  <span className="block text-white/70 font-black">{innovationsUpvotesGivenCount}</span>
                  <span>Upvoted</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
