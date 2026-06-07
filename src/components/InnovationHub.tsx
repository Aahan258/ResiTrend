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
    try {
      await addComment(ideaId, commentText.trim());
      setCommentText("");
    } catch (err) {
      console.error(err);
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

  const workflowStatuses: { id: string; label: string; color: string }[] = [
    { id: "all", label: "All Submissions", color: "bg-white/5 border-white/10 text-white/70" },
    { id: "Submitted", label: "Submitted", color: "bg-[#09090b]/80 text-white/80 border-white/10" },
    { id: "Community Review", label: "Community Review", color: "bg-[#09090b]/80 text-white/80 border-white/10" },
    { id: "Under Consideration", label: "Under Consideration", color: "bg-white/10 text-white border-white/15" },
    { id: "Approved", label: "Approved", color: "bg-white/15 text-white border-white/20 font-semibold" },
    { id: "Implemented", label: "Implemented", color: "bg-white text-[#09090b] font-bold border-white" }
  ];

  const filteredInnovations = innovations.filter(item => {
    if (activeWorkflowTab === "all") return true;
    return item.status === activeWorkflowTab;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="innovation_hub_panel">
      {/* 1. Header Hero Panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-white" />
              <h1 className="text-base font-bold text-white tracking-tight leading-none font-sans">Innovation Hub</h1>
            </div>
            <p className="text-white/60 text-xs max-w-2xl leading-relaxed">
              Have an idea to optimize workflow times, surgical teaching tools, laser procedures, or diagnostic lines? Log them below! Earn community upvotes, participate in peer evaluations, and see your idea implemented. Approved and Implemented ideas earn +150 to +250 XP.
            </p>
          </div>
          <button
            onClick={() => setIsSubmitting(!isSubmitting)}
            className="bg-white hover:bg-white/90 text-[#09090b] border border-transparent px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-stretch lg:self-auto justify-center shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Suggest Improvement
          </button>
        </div>
      </div>

      {/* 2. Pipeline Progress Filters Bar */}
      <div className="flex flex-wrap items-center bg-white/5 border border-white/10 rounded-xl p-1.5 gap-2 overflow-x-auto shadow-sm">
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
                  ? "bg-white/10 text-white border border-white/20 shadow-sm" 
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/10 text-white font-bold" : "bg-white/5 text-white/30"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Dropping Addition Form */}
      {isSubmitting && (
        <form onSubmit={handleCreate} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 animate-fade-in relative z-20 backdrop-blur-md shadow-md">
          <h2 className="text-sm font-semibold text-white">Draft Surgical or Clinical Innovation Idea-Card</h2>
          {errorMsg && <p className="text-rose-300 text-xs font-mono">{errorMsg}</p>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">Title of Innovation / Solution Name</label>
              <input
                type="text"
                placeholder="e.g. 3D Printed Indirect Ophthalmoscopy Retaining Plate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">What is the bottleneck or problem?</label>
                <textarea
                  placeholder="Specify current time delays or patient discomfort points..."
                  rows={4}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">What is your proposed solution?</label>
                <textarea
                  placeholder="Describe mechanics, 3D printing details, or scheduling updates..."
                  rows={4}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1.5">What is the expected impact?</label>
                <textarea
                  placeholder="Reduce patient dilation queues by 15 mins, decrease equipment fatigue, etc..."
                  rows={4}
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-2 px-3 text-white focus:outline-none focus:border-white/35 resize-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setIsSubmitting(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs border border-white/10 text-white/60 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-white hover:bg-white/90 text-[#09090b] px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
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
            <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-12 text-center text-white/40 text-xs shadow-sm">
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
                    className={`bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition shadow-sm ${
                      item.status === "Implemented" 
                        ? "border-emerald-500/20 shadow-lg bg-gradient-to-b from-white/5 to-emerald-500/5" 
                        : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-4">
                      {/* Name, Status & category */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase font-bold border ${statusConfig?.color || "bg-white/5 border-white/10"}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">
                          Suggested by <span className="text-white/70 italic font-semibold">{item.displayName}</span>
                        </span>
                      </div>

                      {/* Created date */}
                      <span className="text-[9px] font-mono text-white/30">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-white tracking-tight font-sans">{item.title}</h2>
                    
                    {/* Bento structure showing details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                      <div className="bg-white/2 p-3 rounded-lg border border-white/5">
                        <span className="block text-[9px] text-white/30 font-bold uppercase tracking-wider font-mono">1. Clinical Bottleneck</span>
                        <p className="text-white/70 font-light leading-relaxed mt-1">{item.problem}</p>
                      </div>
                      <div className="bg-white/2 p-3 rounded-lg border border-white/5">
                        <span className="block text-[9px] text-white/30 font-bold uppercase tracking-wider font-mono">2. Solution Mechanics</span>
                        <p className="text-white/70 font-light leading-relaxed mt-1">{item.proposedSolution}</p>
                      </div>
                      <div className="bg-white/2 p-3 rounded-lg border border-white/5">
                        <span className="block text-[9px] text-white/30 font-bold uppercase tracking-wider font-mono">3. Anticipated Impact</span>
                        <p className="text-white/70 font-light leading-relaxed mt-1">{item.expectedImpact}</p>
                      </div>
                    </div>

                    {/* Bottom Actions Line (Upvoting, Comment listing, and Admin State progression) */}
                    <div className="flex flex-wrap items-center justify-between border-t border-white/5 mt-4 pt-3.5 gap-3">
                      <div className="flex items-center gap-2.5">
                        {/* Vote Button */}
                        {profile && (
                          <button
                            onClick={() => upvoteInnovation(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                              alreadyUpvoted
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${alreadyUpvoted ? "fill-white" : ""}`} />
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
                              ? "bg-white/15 border-white/25 text-white"
                              : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-white/40" />
                          <span>Praise Feedback ({item.commentsCount || 0})</span>
                        </button>
                      </div>

                      {/* Admin pipeline status adjustments */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 bg-[#09090b] px-2 py-1 rounded-lg border border-white/10 text-xs text-white/60">
                          <Sliders className="h-3 w-3 text-white" />
                          <span>Stage Progress:</span>
                          <select
                            value={item.status}
                            onChange={(e) => updateInnovationStatus(item.id, e.target.value as InnovationStatus)}
                            className="bg-[#09090b] border-none rounded text-xs py-0.5 px-2 text-white focus:outline-none"
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 animate-fade-in lg:col-span-1 sticky top-[95px] backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Discussion Feed</h2>
              <button 
                onClick={() => setSelectedIdeaForComment(null)}
                className="text-white/40 hover:text-white text-[10px] font-mono font-semibold cursor-pointer"
              >
                [Close]
              </button>
            </div>

            {/* List current comments */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {loadLocalComments(selectedIdeaForComment).length === 0 ? (
                <p className="text-white/30 text-center font-mono text-[10px] py-6">No clinical feedback logged yet.</p>
              ) : (
                loadLocalComments(selectedIdeaForComment).map((comm: any) => (
                  <div key={comm.id} className="bg-[#09090b] p-2.5 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between text-[10px] border-b border-white/5 w-full pb-1 text-white/40">
                      <span className="font-semibold text-white/60 italic">{comm.displayName}</span>
                      <span className="font-mono">
                        {comm.createdAt ? new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/80 mt-1 leading-snug">{comm.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input */}
            {profile ? (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <textarea
                  placeholder="Pose constructive critiques, alternative mechanics..."
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg text-xs py-1.5 px-2 text-white focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => handlePostComment(selectedIdeaForComment)}
                  className="w-full bg-white hover:bg-white/90 text-[#09090b] py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Send className="h-3 w-3" />
                  <span>Send Comment</span>
                </button>
              </div>
            ) : (
              <p className="text-white/30 text-[10px] text-center italic">Sign in or select sandbox resident to participate.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
