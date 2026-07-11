import React from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { 
  TrendingUp, 
  Sparkles, 
  Shield, 
  Award, 
  BookOpen, 
  Microscope, 
  Brain, 
  ArrowRight, 
  Lock, 
  Database, 
  Activity, 
  ChevronRight, 
  Eye, 
  Trophy,
  Activity as LogIcon
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { loginWithGoogle, bypassAuth } = useAuth();

  const handleScrollToBenefits = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("benefits-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-400 overflow-x-hidden" id="landing-page-root">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-20" id="hero-section">
        {/* Glow Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-widest font-mono font-bold"
          >
            <Activity className="h-3 w-3" />
            <span>Ophthalmology Resident Performance Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto"
          >
            Empower Your Ophthalmology Residency with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">ResiTrend</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans"
          >
            The premium, data-driven, gamified portfolio platform engineered for surgical track logging, peer skill endorsements, and clinical milestone tracking. Designed for residents, approved by faculty.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={loginWithGoogle}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 hover:-translate-y-[2px] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
              id="landing-hero-primary-cta"
            >
              <span>Sign in with Google</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={handleScrollToBenefits}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-sm hover:bg-zinc-850 hover:text-white hover:-translate-y-[2px] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              id="landing-hero-secondary-cta"
            >
              <span>See how it works</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Or test the live experience instantly</span>
            <button
              onClick={() => bypassAuth("resident", "Dr. Rohan Mehta", "Junior Resident (Y2)")}
              className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:-translate-y-[1px] font-mono text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer"
              id="landing-hero-sandbox-cta"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Explore Demo Workspace</span>
            </button>
          </motion.div>
        </div>

        {/* Real Static Dashboard Preview in Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-5xl mx-auto mt-16 px-2 sm:px-4"
          id="hero-product-screenshot"
        >
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/50 p-2 sm:p-4 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            {/* Header Mockup */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-zinc-500 ml-2 font-mono text-[10px]">resitrend.org/workspace</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1"><Database className="h-3 w-3 text-emerald-400" /> DB Live</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">Y2 Resident</span>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile Panel */}
              <div className="bg-zinc-950/80 rounded-xl border border-white/5 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-zinc-950 font-bold text-sm">RM</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Dr. Rohan Mehta</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">Junior Resident (Y2)</p>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500 font-mono">Academic XP</span>
                    <span className="text-amber-400 font-bold">180 XP</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500 font-mono">Surgical XP</span>
                    <span className="text-emerald-400 font-bold">300 XP</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500 font-mono">Reputation Rank</span>
                    <span className="text-indigo-400 font-bold">Respected</span>
                  </div>
                </div>
              </div>

              {/* OT Logs Mini-Graph */}
              <div className="bg-zinc-950/80 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">OT Logbook Progress</h4>
                  <div className="mt-4 flex items-end gap-3 h-20">
                    <div className="w-full bg-zinc-900 rounded h-1/3 flex items-end"><div className="w-full bg-emerald-500 rounded-b h-full" /></div>
                    <div className="w-full bg-zinc-900 rounded h-2/3 flex items-end"><div className="w-full bg-emerald-400 rounded-b h-full" /></div>
                    <div className="w-full bg-zinc-900 rounded h-1/2 flex items-end"><div className="w-full bg-emerald-500 rounded-b h-full" /></div>
                    <div className="w-full bg-zinc-900 rounded h-full flex items-end"><div className="w-full bg-emerald-400 rounded-b h-full" /></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/5 pt-3">
                  <span>Phaco Cases</span>
                  <span className="text-white font-bold">42 / 60</span>
                </div>
              </div>

              {/* Peer Commendation feed */}
              <div className="bg-zinc-950/80 rounded-xl border border-white/5 p-4 space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-500" /> Silent Applause Feed
                </h4>
                <div className="space-y-2">
                  <div className="bg-zinc-900/50 p-2 rounded border border-white/5 text-[10px]">
                    <p className="text-zinc-300 italic">"Amazing help managing the pediatric refraction rush in OPD today! Truly exceptional."</p>
                    <span className="block text-[9px] text-zinc-500 mt-1 text-right font-mono">- Anonymous • Teamwork</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. BENEFITS SECTION (exactly 4 cards) */}
      <section className="py-20 bg-zinc-950 border-t border-white/5 relative" id="benefits-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Structured Performance Optimization</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">Four core pillars engineered to accelerate your clinical confidence and ophthalmic career growth.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefit 1 */}
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 hover:bg-zinc-900/60 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <LogIcon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white font-sans">Track Surgery</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Streamline cataract, glaucoma, and refractive case logging with real-time target status bars.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-amber-500/30 hover:bg-zinc-900/60 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white font-sans">Build Your Academic Portfolio</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Assemble a comprehensive scholarly record featuring journal publications, peer studies, and certified guide contributions.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white font-sans">Compete with Your Institute</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Engage in healthy friendly competition with institutional & national leaderboards showcasing merit accomplishments.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-teal-500/30 hover:bg-zinc-900/60 transition-all duration-300">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white font-sans">AI-Powered Logging</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Paste raw unstructured ophthalmic notes into our smart sieve to auto-extract diagnostic and surgical metrics instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DASHBOARD PREVIEW */}
      <section className="py-20 bg-zinc-900/20 border-t border-white/5 relative" id="dashboard-preview-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Comprehensive Portfolio Command</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Inspect your progress and view achievements at a glance in the beautifully refined main dashboard console.
            </p>
          </div>

          {/* Polished Static Dashboard Layout Card */}
          <div className="bg-zinc-900/55 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase">Interactive Hub Snapshot</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Live Workspace View</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Surgical Requirements Checklist */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Required Rotations & Skills</h3>
                <div className="space-y-3">
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-white">Sutureless Phacoemulsification</span>
                      <span className="font-mono text-emerald-400 font-bold">70% Met</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[70%]" />
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-white">Glaucoma Trabeculectomy</span>
                      <span className="font-mono text-amber-400 font-bold">40% Met</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Progress Ring Card */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center space-y-4">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  {/* Circular Track */}
                  <svg className="transform -rotate-90 absolute h-full w-full">
                    <circle className="text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="48" cx="56" cy="56" />
                    <circle className="text-emerald-400" strokeWidth="6" strokeDasharray="301.6" strokeDashoffset="60.3" strokeLinecap="round" stroke="currentColor" fill="transparent" r="48" cx="56" cy="56" />
                  </svg>
                  <span className="text-lg font-bold font-mono">80%</span>
                </div>
                <div className="text-center">
                  <h4 className="text-xs font-bold text-white">Overall Profile Score</h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Excellent standing among Y2 cohort</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LEADERBOARD PREVIEW (Institute + National) */}
      <section className="py-20 bg-zinc-950 border-t border-white/5 relative" id="leaderboards-preview-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Ophthalmology Leaderboards</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Track real-time merit rankings across your clinic and match standings nationally against premier training institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Table A: Institute Standing */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" /> Institute Standings
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">All Sectors</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/40 border border-white/5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-zinc-500 font-bold">01</span>
                    <span className="font-medium">Dr. Priya Nair</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">850 XP</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/40 border border-white/5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-zinc-500 font-bold">02</span>
                    <span className="font-medium">Dr. Aahan Shah</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">820 XP</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">03</span>
                    <span className="font-medium text-white flex items-center gap-1">Dr. Rohan Mehta <span className="text-[8px] bg-emerald-500 text-zinc-950 px-1 rounded font-bold font-mono">YOU</span></span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">710 XP</span>
                </div>
              </div>
            </div>

            {/* Table B: National Standings */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-indigo-400" /> National Standings
                </span>
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">All Institutes</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/40 border border-white/5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-zinc-500 font-bold">01</span>
                    <span className="font-medium">Dr. Vivek Murthy (RP Eye Centre)</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">1,240 XP</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/40 border border-white/5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-zinc-500 font-bold">02</span>
                    <span className="font-medium">Dr. Ananya Roy (LVPEI Center)</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">1,180 XP</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/40 border border-white/5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-zinc-500 font-bold">24</span>
                    <span className="font-medium text-zinc-300">Dr. Rohan Mehta (Our Centre)</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-400">710 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FACULTY ANALYTICS PREVIEW */}
      <section className="py-20 bg-zinc-900/20 border-t border-white/5 relative" id="faculty-analytics-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Institutional Faculty Dashboards</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Providing directors and on-call supervisors with full analytical metrics, whitelist management, and audit tracks.
            </p>
          </div>

          {/* Static Non-Interactive Preview */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" /> Administrative Command Panel
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Role-Gated • Founder Only</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Total Active Residents</span>
                <span className="block text-2xl font-bold font-mono">18</span>
                <span className="block text-[9px] text-emerald-400 font-mono">✓ Whitelisted</span>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Verified Achievements</span>
                <span className="block text-2xl font-bold font-mono">142</span>
                <span className="block text-[9px] text-emerald-400 font-mono">+12 validated this week</span>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Clinical Case Density</span>
                <span className="block text-2xl font-bold font-mono">1,120</span>
                <span className="block text-[9px] text-zinc-400 font-mono">Surgical hours tracked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20 bg-zinc-950 border-t border-white/5 relative flex flex-col items-center justify-center text-center px-4" id="final-cta-section">
        {/* Subtle Background Radial Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

        <div className="relative max-w-2xl mx-auto space-y-6 z-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">Ready to Elevate Your Training Path?</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Join premier ophthalmology centers globally in standardizing training quality, surgical milestones, and academic validation in one beautiful SaaS dashboard.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={loginWithGoogle}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 hover:-translate-y-[2px] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
              id="landing-final-primary-cta"
            >
              <span>Get Started with Google</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => bypassAuth("resident", "Dr. Rohan Mehta", "Junior Resident (Y2)")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-sm hover:bg-zinc-850 hover:text-white hover:-translate-y-[2px] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-mono"
              id="landing-final-sandbox-cta"
            >
              <span>Explore Demo Workspace</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
