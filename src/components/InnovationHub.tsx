import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Lightbulb, 
  ThumbsUp, 
  MessageSquare, 
  Plus, 
  CheckCircle, 
  Sliders, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight,
  Send,
  Eye
} from "lucide-react";
import { InnovationIdea, InnovationStatus } from "../types";

export const InnovationHub: React.FC = () => {
  const { 
    profile, 
    innovations, 
    addInnovation, 
    upvoteInnovation, 
    addComment, 
    updateInnovationStatus, 
    isAdmin 
  } = useAuth();

  // Navigation / Filter states
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIdeaForComment, setSelectedIdeaForComment] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Innovation Form states
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [impact, setImpact] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Comment input state
  const [commentText, setCommentText] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!title.trim() || !problem.trim() || !solution.trim() || !impact.trim()) {
      setErrorMsg("All diagnostic explanation fields are mandatory.");
      return;
    }
    try {
      await addInnovation(title, problem, solution, impact);
      setTitle("");
      setProblem("");
      setSolution("");
      setImpact("");
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to catalog innovation.");
    }
  };

  const handlePostComment = async (ideaId: string) => {
    if (!commentText.trim()) return;
    setActionError("");
    try {
      await addComment(ideaId, commentText.trim());
      setCommentText("");
    } catch (err: any) {
      setActionError(err.message || "Failed to post comment.");
      setTimeout(() => setActionError(""), 6000);
    }
  };

  const handleUpvoteClick = async (ideaId: string) => {
    setActionError("");
    try {
      await upvoteInnovation(ideaId);
    } catch (err: any) {
      setActionError(err.message || "Failed to submit upvote.");
      setTimeout(() => setActionError(""), 6000);
    }
  };

  const loadLocalComments = (ideaId: string) => {
    try {
      const local = localStorage.getItem(`pulse_comments_${ideaId}`);
      return local ? JSON.parse(local) : [
        {
          id: "comm_seed_1",
          displayName: "Dr. Aahan Shah",
          text: "Phenomenal work! This addresses a major everyday bottleneck in the busy vitreoretinal clinics.",
          createdAt: new Date(Date.now() - 36000000).toISOString()
        }
      ];
    } catch {
      return [];
    }
  };

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // 1. Comments sent by profile
  const myCommentsSent = profile ? JSON.parse(localStorage.getItem(`pulse_comments_sent_${profile.uid}`) || "[]") : [];
  const commentsToday = myCommentsSent.filter((c: any) => new Date(c.createdAt).getTime() >= startOfDay).length;
  const commentsThisMonth = myCommentsSent.filter((c: any) => new Date(c.createdAt).getTime() >= startOfMonth).length;

  // 2. Upvotes cast by profile
  const myUpvotesCast = profile ? JSON.parse(localStorage.getItem(`pulse_upvotes_cast_${profile.uid}`) || "[]") : [];
  const upvotesToday = myUpvotesCast.filter((u: any) => new Date(u.createdAt).getTime() >= startOfDay).length;
  const upvotesThisMonth = myUpvotesCast.filter((u: any) => new Date(u.createdAt).getTime() >= startOfMonth).length;

  const workflowStatuses: { id: string; label: string; color: string }[] = [
    { id: "all", label: "All Submissions", color: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" },
    { id: "Submitted", label: "Submitted", color: "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300" },
    { id: "Community Review", label: "Community Review", color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-400" },
    { id: "Under Consideration", label: "Under Consideration", color: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-400" },
    { id: "Approved", label: "Approved", color: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-450" },
    { id: "Implemented", label: "Implemented", color: "bg-green-600 dark:bg-green-600 text-white border-transparent" }
  ];

  const filteredInnovations = innovations.filter(item => {
    if (activeWorkflowTab === "all") return true;
    return item.status === activeWorkflowTab;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white" id="innovation_hub_panel">
      {/* 1. Header Hero Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <h1 className="text-base font-bold text-slate-950 dark:text-white tracking-tight leading-none font-sans">Innovation Hub</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs max-w-2xl leading-relaxed">
              Have an idea to optimize workflow times, surgical teaching tools, laser procedures, or diagnostic lines? Log them below! Earn community upvotes, participate in peer evaluations, and see your idea implemented. Approved and Implemented ideas earn +150 to +250 XP.
            </p>
          </div>
          <button
            onClick={() => setIsSubmitting(!isSubmitting)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-stretch lg:self-auto justify-center shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Suggest Improvement
          </button>
        </div>
      </div>

      {/* Action error alerts */}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Gamification discussion and voting quotas */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Innovation Voting Meter (+1 XP)</span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono px-1.5 py-0.5 rounded font-bold">Upvote Quota</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-450">
                  <span>Today</span>
                  <span className="font-semibold">{upvotesToday} / 5 used</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (upvotesToday / 5) * 100)}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-450">
                  <span>This Month</span>
                  <span className="font-semibold">{upvotesThisMonth} / 50 used</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (upvotesThisMonth / 50) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Praise Comment Meter (+3 XP)</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-1.5 py-0.5 rounded font-bold">Comment Quota</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-450">
                  <span>Today</span>
                  <span className="font-semibold">{commentsToday} / 3 used</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (commentsToday / 3) * 100)}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-450">
                  <span>This Month</span>
                  <span className="font-semibold">{commentsThisMonth} / 30 used</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (commentsThisMonth / 30) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pipeline Progress Filters Bar */}
      <div className="flex flex-wrap items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 gap-2 overflow-x-auto shadow-sm">
        {workflowStatuses.map((tab) => {
          const count = tab.id === "all" ? innovations.length : innovations.filter(i => i.status === tab.id).length;
          const isActive = activeWorkflowTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveWorkflowTab(tab.id);
                setSelectedIdeaForComment(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "bg-indigo-500 text-white border border-indigo-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-indigo-600 text-white font-bold" : "bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Dropping Addition Form */}
      {isSubmitting && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-fade-in relative z-20 shadow-md">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Draft Surgical or Clinical Innovation Idea-Card</h2>
          {errorMsg && <p className="text-red-500 text-xs font-mono">{errorMsg}</p>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">Title of Innovation / Solution Name</label>
              <input
                type="text"
                placeholder="e.g. 3D Printed Indirect Ophthalmoscopy Retaining Plate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">What is the bottleneck or problem?</label>
                <textarea
                  placeholder="Specify current time delays or patient discomfort points..."
                  rows={4}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">What is your proposed solution?</label>
                <textarea
                  placeholder="Describe mechanics, 3D printing details, or scheduling updates..."
                  rows={4}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mb-1.5">What is the expected impact?</label>
                <textarea
                  placeholder="Reduce patient dilation queues by 15 mins, decrease equipment fatigue, etc..."
                  rows={4}
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setIsSubmitting(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              Submit for Community Review
            </button>
          </div>
        </form>
      )}

      {/* 4. Display Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ideas List (Take 1 column if active comments feed) */}
        <div className={`space-y-4 ${selectedIdeaForComment ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {filteredInnovations.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 dark:text-slate-500 text-xs shadow-sm">
              No clinical/surgical submissions cataloged under current status.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInnovations.map((item) => {
                const alreadyUpvoted = profile && item.upvotedBy.includes(profile.uid);
                const statusConfig = workflowStatuses.find(w => w.id === item.status);
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm ${
                      item.status === "Implemented" 
                        ? "border-emerald-500/20 shadow-md bg-gradient-to-b from-white dark:from-slate-900 to-emerald-50/10 dark:to-emerald-950/5" 
                        : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/40 pb-3 mb-4">
                      {/* Name, Status & category */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase font-bold border ${statusConfig?.color || "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-850"}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          Suggested by <span className="text-slate-700 dark:text-slate-300 italic font-semibold">{item.displayName}</span>
                        </span>
                      </div>

                      {/* Created date */}
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight font-sans">{item.title}</h2>
                    
                    {/* Bento structure showing details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850">
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">1. Clinical Bottleneck</span>
                        <p className="text-slate-600 dark:text-slate-300 font-light leading-relaxed mt-1">{item.problem}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850">
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">2. Solution Mechanics</span>
                        <p className="text-slate-600 dark:text-slate-300 font-light leading-relaxed mt-1">{item.proposedSolution}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150 dark:border-slate-850">
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">3. Anticipated Impact</span>
                        <p className="text-slate-600 dark:text-slate-300 font-light leading-relaxed mt-1">{item.expectedImpact}</p>
                      </div>
                    </div>

                    {/* Bottom Actions Line (Upvoting, Comment listing, and Admin State progression) */}
                    <div className="flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-800/40 mt-4 pt-3.5 gap-3">
                      <div className="flex items-center gap-2.5">
                        {/* Vote Button */}
                        {profile && (
                          <button
                            onClick={() => handleUpvoteClick(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                              alreadyUpvoted
                                ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-150 dark:border-indigo-900/35 text-indigo-600 dark:text-indigo-400"
                                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${alreadyUpvoted ? "fill-current" : ""}`} />
                            <span>Upvoted ({item.upvotesCount})</span>
                          </button>
                        )}

                        {/* Comments Drawer click */}
                        <button
                          onClick={() => {
                            if (selectedIdeaForComment === item.id) setSelectedIdeaForComment(null);
                            else setSelectedIdeaForComment(item.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                            selectedIdeaForComment === item.id
                              ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-150 dark:border-indigo-900/35 text-indigo-600 dark:text-indigo-400"
                              : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          <span>Praise Feedback ({item.commentsCount || 0})</span>
                        </button>
                      </div>

                      {/* Admin pipeline status adjustments */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                          <Sliders className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                          <span>Stage Progress:</span>
                          <select
                            value={item.status}
                            onChange={(e) => updateInnovationStatus(item.id, e.target.value as InnovationStatus)}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs py-0.5 px-2 text-slate-900 dark:text-white focus:outline-none"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Community Review">Community Review</option>
                            <option value="Under Consideration">Under Consideration</option>
                            <option value="Approved">Approved</option>
                            <option value="Implemented">Implemented</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Collapsible Comments Drawer Sidebar (Takes 1 column if active) */}
        {selectedIdeaForComment && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 animate-fade-in lg:col-span-1 sticky top-[95px] shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2.5">
              <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Discussion Feed</h2>
              <button 
                onClick={() => setSelectedIdeaForComment(null)}
                className="text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white text-[10px] font-mono font-semibold cursor-pointer"
              >
                [Close]
              </button>
            </div>

            {/* List current comments */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {loadLocalComments(selectedIdeaForComment).length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 text-center font-mono text-[10px] py-6">No clinical feedback logged yet.</p>
              ) : (
                loadLocalComments(selectedIdeaForComment).map((comm: any) => (
                  <div key={comm.id} className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-850">
                    <div className="flex items-center justify-between text-[10px] border-b border-slate-150 dark:border-slate-850 w-full pb-1 text-slate-400 dark:text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 italic">{comm.displayName}</span>
                      <span className="font-mono">
                        {comm.createdAt ? new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-650 dark:text-slate-200 mt-1 leading-snug">{comm.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input */}
            {profile ? (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <textarea
                  placeholder="Pose constructive critiques, alternative mechanics..."
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs py-1.5 px-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handlePostComment(selectedIdeaForComment)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Send className="h-3 w-3" />
                  <span>Send Comment</span>
                </button>
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-[10px] text-center italic">Sign in or select sandbox resident to participate.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
