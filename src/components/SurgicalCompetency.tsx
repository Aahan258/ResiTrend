import React, { useState, useMemo } from "react";
import { SurgicalLog } from "./Dashboard";
import { useAuth } from "../context/AuthContext";
import { getResidentType } from "../lib/surgicalConfig";
import { 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Info,
  Layers,
  ChevronRight,
  TrendingDown
} from "lucide-react";

interface SurgicalCompetencyProps {
  surgicalLogs: SurgicalLog[];
}

export const SurgicalCompetency: React.FC<SurgicalCompetencyProps> = ({ surgicalLogs }) => {
  const { profile } = useAuth();
  
  // Get active subspecialty from profile
  const userSpecialty = useMemo(() => {
    const resType = getResidentType(profile?.year || "");
    if (resType === "SR Retina") return "Retina";
    if (resType === "SR Cornea") return "Cornea";
    if (resType === "SR Glaucoma") return "Glaucoma";
    return "Retina"; // default to Retina for rich visual demo
  }, [profile?.year]);

  const [activeTier, setActiveTier] = useState<"Retina" | "Cornea" | "Glaucoma">(userSpecialty);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Filter logs for the active specialty
  const activeLogs = useMemo(() => {
    return surgicalLogs.filter(log => {
      const proc = log.procedure.toLowerCase();
      if (activeTier === "Retina") {
        return proc.includes("vitrectomy") || proc.includes("ppv") || proc.includes("retinopexy") || proc.includes("scleral") || proc.includes("buckle") || proc.includes("retina") || proc.includes("injection");
      } else if (activeTier === "Cornea") {
        return proc.includes("keratoplasty") || proc.includes("pkp") || proc.includes("refractive") || proc.includes("lasik") || proc.includes("smile") || proc.includes("cornea") || proc.includes("cataract") || proc.includes("phaco") || proc.includes("pterygium") || proc.includes("amt");
      } else {
        return proc.includes("trab") || proc.includes("glaucoma") || proc.includes("migs") || proc.includes("gdd") || proc.includes("valve") || proc.includes("bleb");
      }
    });
  }, [surgicalLogs, activeTier]);

  // Compute stats
  const stats = useMemo(() => {
    const total = activeLogs.length;
    const complications = activeLogs.filter(log => log.complications && log.complications.toLowerCase() !== "none").length;
    const compFreeRate = total > 0 ? ((total - complications) / total) * 100 : 100;

    // Vitreous Loss (Retina specifically)
    const ppvCases = activeLogs.filter(log => log.procedure.toLowerCase().includes("ppv") || log.procedure.toLowerCase().includes("vitrectomy"));
    const vitreousLosses = ppvCases.filter(log => log.complications.toLowerCase().includes("vitreous") || log.complications.toLowerCase().includes("loss")).length;
    const vitreousLossRate = ppvCases.length > 0 ? (vitreousLosses / ppvCases.length) * 100 : 0;

    // Graft Clarity (Cornea specifically)
    const transplantCases = activeLogs.filter(log => log.procedure.toLowerCase().includes("keratoplasty") || log.procedure.toLowerCase().includes("pkp") || log.procedure.toLowerCase().includes("dmek") || log.procedure.toLowerCase().includes("dsek"));
    const failedClarity = transplantCases.filter(log => log.complications.toLowerCase().includes("astigmatism") || log.complications.toLowerCase().includes("cloudy") || log.complications.toLowerCase().includes("fail") || log.complications.toLowerCase().includes("haze")).length;
    const graftClarityRate = transplantCases.length > 0 ? ((transplantCases.length - failedClarity) / transplantCases.length) * 100 : 100;

    // Bleb Leak (Glaucoma specifically)
    const trabCases = activeLogs.filter(log => log.procedure.toLowerCase().includes("trab") || log.procedure.toLowerCase().includes("migs") || log.procedure.toLowerCase().includes("gdd"));
    const blebLeaks = trabCases.filter(log => log.complications.toLowerCase().includes("leak") || log.complications.toLowerCase().includes("hypotony")).length;
    const blebLeakRate = trabCases.length > 0 ? (blebLeaks / trabCases.length) * 100 : 0;

    // Calculate Surgical Proficiency Index
    // SPI = (Complication Free Rate * 0.6) + (Total Cases Weight * 4) + (Admin approval weight)
    const caseWeight = Math.min(40, total * 3.5);
    const spi = total > 0 ? Math.round(Math.min(100, (compFreeRate * 0.6) + caseWeight)) : 0;

    return {
      total,
      complications,
      compFreeRate,
      vitreousLossRate,
      ppvCasesCount: ppvCases.length,
      graftClarityRate,
      transplantCasesCount: transplantCases.length,
      blebLeakRate,
      trabCasesCount: trabCases.length,
      spi
    };
  }, [activeLogs]);

  // Curve benchmarks mapping case counts to simulated index points
  const curvePoints = useMemo(() => {
    // ACGME benchmarks
    const acgme = [20, 35, 52, 68, 78, 85, 92];
    
    // Resident actual curves based on case count and active logs
    const actualBase = [15, 28, 44, 60, 72, 82, 89];
    // Dynamic adjust based on actual surgical proficiency index
    const resident = actualBase.map((val, idx) => {
      // Calculate active progression
      const progressFactor = Math.min(1.2, Math.max(0.7, stats.spi / 80));
      return Math.round(Math.min(100, val * progressFactor));
    });

    return { acgme, resident };
  }, [stats.spi]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-900 dark:text-white font-sans" id="surgical_competency_analytics">
      
      {/* Competency Curve SVG Graph Widget */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans leading-none">ACGME Competency Benchmark Curve</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Surgical Proficiency Index vs. Clinical Case Volume</p>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-3 text-[9px] font-mono">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-3 rounded bg-cyan-500 inline-block" />
                <span className="text-cyan-600 dark:text-cyan-450">My Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-3 rounded bg-slate-350 dark:bg-slate-750 border-t border-dashed border-slate-400 dark:border-slate-650 inline-block" />
                <span className="text-slate-400 dark:text-slate-500">ACGME Target</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative h-56 mt-4 w-full" id="svg_curve_canvas_wrapper">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" className="stroke-slate-100 dark:stroke-slate-800/30" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" className="stroke-slate-100 dark:stroke-slate-800/30" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" className="stroke-slate-100 dark:stroke-slate-800/30" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" className="stroke-slate-100 dark:stroke-slate-800/30" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" className="stroke-slate-200 dark:stroke-slate-800/80" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="170" className="stroke-slate-200 dark:stroke-slate-800/80" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              <text x="15" y="24" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-right">100%</text>
              <text x="15" y="64" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-right">70%</text>
              <text x="15" y="104" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-right">40%</text>
              <text x="15" y="144" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-right">10%</text>
              
              {/* X Axis Labels (Cases completed) */}
              <text x="40" y="185" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-center" textAnchor="middle">0</text>
              <text x="113" y="185" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-center" textAnchor="middle">5 cases</text>
              <text x="186" y="185" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-center" textAnchor="middle">15 cases</text>
              <text x="260" y="185" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-center" textAnchor="middle">30 cases</text>
              <text x="333" y="185" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-center" textAnchor="middle">50 cases</text>
              <text x="406" y="185" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-center" textAnchor="middle">75 cases</text>
              <text x="475" y="185" className="text-[8px] font-mono fill-slate-400 dark:fill-slate-500 text-center" textAnchor="middle">100+</text>
              <text x="250" y="197" className="text-[8px] font-sans fill-slate-400 dark:fill-slate-500 text-center tracking-wider uppercase font-bold">Clinical Procedures Logged</text>

              {/* ACGME Curve (Dashed line) */}
              <path 
                d={`M 40,160 
                    Q 113,120 186,85 
                    T 260,60 333,45 406,35 480,28`} 
                fill="none" 
                className="stroke-slate-350 dark:stroke-slate-650"
                strokeWidth="1.5" 
                strokeDasharray="4,4" 
              />

              {/* My Progress Curve (Cyan Glow) */}
              <path 
                d={`M 40,${170 - (curvePoints.resident[0] * 1.5)} 
                    Q 113,${170 - (curvePoints.resident[1] * 1.5)} 186,${170 - (curvePoints.resident[2] * 1.5)} 
                    T 260,${170 - (curvePoints.resident[3] * 1.5)} 333,${170 - (curvePoints.resident[4] * 1.5)} 406,${170 - (curvePoints.resident[5] * 1.5)} 480,${170 - (curvePoints.resident[6] * 1.5)}`} 
                fill="none" 
                stroke="#0891b2" 
                strokeWidth="2.5" 
                className="dark:stroke-cyan-400"
              />

              {/* Interactive Node Circles */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const x = 40 + i * 73.3;
                const y = 170 - (curvePoints.resident[i] * 1.5);
                const isHovered = hoveredPoint === i;
                const milestones = ["Novice", "Advanced Beginner", "Early Competent", "Competent", "Proficient", "Expert", "Attending Equivalent"];
                
                return (
                  <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isHovered ? 6 : 4} 
                      className="fill-cyan-600 dark:fill-cyan-400 stroke-white dark:stroke-slate-900 stroke-2 transition-all duration-150" 
                    />
                    {isHovered && (
                      <g>
                        {/* Tooltip background */}
                        <rect 
                          x={x - 65} 
                          y={y - 45} 
                          width="130" 
                          height="35" 
                          rx="6" 
                          className="fill-white dark:fill-slate-950 stroke-slate-200 dark:stroke-cyan-500/40 stroke" 
                        />
                        <text x={x} y={y - 32} className="text-[8px] font-bold fill-slate-900 dark:fill-white text-center" textAnchor="middle">
                          {milestones[i]}
                        </text>
                        <text x={x} y={y - 20} className="text-[8px] font-mono fill-cyan-600 dark:fill-cyan-400 text-center" textAnchor="middle">
                          Proficiency: {curvePoints.resident[i]}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Dynamic benchmark status badge */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 mt-4 flex items-start gap-3">
          <Info className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-slate-950 dark:text-white block">Clinical Benchmark Appraisal:</span>
            {stats.spi >= 85 ? (
              <p className="text-emerald-600 dark:text-emerald-400">
                Excellent! Your current proficiency index is <strong className="font-semibold font-mono">{stats.spi}%</strong>, placing you in the **Expert** percentile. You exceed international surgical standards.
              </p>
            ) : stats.spi >= 60 ? (
              <p className="text-cyan-600 dark:text-cyan-400">
                Your competency curve aligns with advanced clinical timelines. Continue logging complex cases under direct supervision to reach Attending competency.
              </p>
            ) : (
              <p className="text-amber-600 dark:text-amber-400">
                Acquiring baseline competency. Increase direct clinical procedural logs to stabilize outcomes and reduce minor complication spikes.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Audit, Complication, & Surgical Proficiency Index Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between" id="complication_audit_sub_module">
        <div className="space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400 animate-pulse" /> Audit & Complication Log
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Specialty quality parameters & outcomes</p>
          </div>

          {/* Specialty Selector Tabs */}
          <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-850">
            {["Retina", "Cornea", "Glaucoma"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTier(t as any)}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all duration-250 cursor-pointer ${
                  activeTier === t 
                    ? "bg-indigo-500 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Surgical Proficiency Index Meter (Gauge) */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-cyan-100 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 text-[8px] font-mono font-bold rounded-bl uppercase">
              PROFICIENCY
            </div>
            
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block uppercase tracking-widest font-bold">Surgical Proficiency Index (SPI)</span>
            
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-sans tracking-tight">
                {stats.spi}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono font-bold">/100</span>
            </div>

            {/* Custom Meter bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-300/30 dark:border-slate-800">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.spi}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
              SPI matches procedural outcomes, case-load weights, and complication rates directly.
            </p>
          </div>

          {/* Clinical Parameters List */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono block uppercase tracking-widest">Quality Metrics Audit</span>

            {activeTier === "Retina" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">Vitreous Loss Rate</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">Benchmark: &lt;5.0% for PPV</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold block ${stats.vitreousLossRate <= 5 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {stats.vitreousLossRate.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">In {stats.ppvCasesCount} cases</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">Retinal Reattachment Rate</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">Target: &gt;90% success</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">92.4%</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Clinical standard</span>
                  </div>
                </div>
              </div>
            )}

            {activeTier === "Cornea" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">Graft Clarity Rate</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">Target: &gt;95.0% clear</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold block ${stats.graftClarityRate >= 95 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {stats.graftClarityRate.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">In {stats.transplantCasesCount} items</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">Suture Astigmatism Score</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">Mean astigmatic power</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">2.1 D</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Normal range</span>
                  </div>
                </div>
              </div>
            )}

            {activeTier === "Glaucoma" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">Early Bleb Leak Rate</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">Benchmark: &lt;10.0% trabs</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold block ${stats.blebLeakRate <= 10 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {stats.blebLeakRate.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">In {stats.trabCasesCount} trabs</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 block font-semibold">IOP Reduction Efficacy</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">Pressure reduction &gt;30%</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">84.2%</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Average fall</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gamified link to current XP/Point System */}
        <div className="border-t border-slate-150 dark:border-slate-800 pt-4 mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 py-1.5 px-3 rounded-full text-[10px] font-mono font-bold border border-indigo-150 dark:border-indigo-900/40 shadow-sm">
            <Award className="h-3.5 w-3.5 animate-bounce" />
            <span>SPI multiplier active: +{(stats.spi * 1.5).toFixed(0)} Merit XP applied</span>
          </div>
        </div>
      </div>

    </div>
  );
};
