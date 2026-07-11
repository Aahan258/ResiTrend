import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Megaphone, 
  AlertTriangle, 
  Plus, 
  Sparkles, 
  Trash2, 
  UploadCloud, 
  Zap, 
  Check,
  Award,
  Info
} from "lucide-react";

// Standard reminder structure matching backend parse outcome
interface PersonalReminder {
  id: string;
  title: string;
  date: string;
  time: string;
  category: "Duty" | "Academic" | "Deadline" | "Event" | "General";
  description: string;
  priority: "High" | "Medium" | "Low";
  isRead: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export const NotificationsPanel: React.FC = () => {
  const { profile, isFirebaseActive } = useAuth();
  
  // Notification States
  const [reminders, setReminders] = useState<PersonalReminder[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"all" | "reminders" | "announcements">("reminders");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Manual reminder creation form states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");
  const [newCategory, setNewCategory] = useState<"Duty" | "Academic" | "Deadline" | "Event" | "General">("Academic");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newDesc, setNewDesc] = useState<string>("");

  // Saturday mode state
  const [isSaturdayMode, setIsSaturdayMode] = useState<boolean>(() => {
    return localStorage.getItem("saturday_simulation_active") === "true";
  });

  // Load and sync reminders from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`pulse_reminders_${profile?.uid || "guest"}`);
    if (saved) {
      setReminders(JSON.parse(saved));
    } else {
      // Seed default individual reminders resembling the ones in the prompt's mockup images!
      const defaultReminders: PersonalReminder[] = [
        {
          id: "rem_1",
          title: "Journal Club Presentation & Slides",
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
          time: "08:00 AM",
          category: "Academic",
          description: "Prepare and rehearse presentation on 'Refractive SMILE vs LASIK clinical outcomes'.",
          priority: "High",
          isRead: false,
          isCompleted: false,
          createdAt: new Date().toISOString()
        },
        {
          id: "rem_2",
          title: "Surgical Logbook Verification Pending",
          date: new Date().toISOString().split("T")[0],
          time: "02:00 PM",
          category: "Deadline",
          description: "Request counter-signatures from Prof. Nair for your last 12 phacoemulsification records.",
          priority: "High",
          isRead: false,
          isCompleted: false,
          createdAt: new Date().toISOString()
        },
        {
          id: "rem_3",
          title: "Refractive Surgery Seminar",
          date: new Date(Date.now() + 172800000).toISOString().split("T")[0], // In 2 days
          time: "11:00 AM",
          category: "Academic",
          description: "Mandatory attendance for case review. Moderator: Dr. Jagat Ram.",
          priority: "Medium",
          isRead: true,
          isCompleted: false,
          createdAt: new Date().toISOString()
        }
      ];
      setReminders(defaultReminders);
      localStorage.setItem(`pulse_reminders_${profile?.uid || "guest"}`, JSON.stringify(defaultReminders));
    }
  }, [profile?.uid]);

  // Synchronize on change and dispatch global event to update Header count
  const saveReminders = (updatedReminders: PersonalReminder[]) => {
    setReminders(updatedReminders);
    localStorage.setItem(`pulse_reminders_${profile?.uid || "guest"}`, JSON.stringify(updatedReminders));
    window.dispatchEvent(new Event("reminders-updated"));
  };

  // Preset Notices templates for Quick Demostrations
  const presetTemplates = [
    {
      name: "📋 Ophthalmology Summer Rotation Schedule",
      fileName: "ophthalmology_rotation_june_2026.txt",
      content: `Ophthalmology Department Circular - June 2026 Rotation
All residents must report to their assigned units at 07:30 AM daily.
- Dr. Rohan Mehta: Junior Resident (Y2) is assigned to the Corneal Refractive Clinic on Tuesdays and Thursdays. Must handle Emergency On-Call triage duty on June 12th from 08:00 PM to 08:00 AM next day.
- Dr. Priya Nair: Junior Resident (Y3) is assigned to pediatric squint evaluations on Wednesdays. Case presentations scheduled for June 15th at 09:00 AM.
- Dr. Aahan Shah: Senior Resident (Glaucoma) must supervise the emergency trauma OT on June 18th. Assist juniors with surgical logs.
- General: Comprehensive grand rounds on June 20th, 08:30 AM at the central amphitheater is mandatory for all PG students.`
    },
    {
      name: "✍️ Thesis Submission and Exam Deadlines",
      fileName: "thesis_and_ethics_milestones.txt",
      content: `Resident Academic Board Circular - Urgent Milestones
1. All Junior Residents (Y2) must submit their ethical clearance final approval certificates by June 14th, 2026 to the administrative coordinator.
2. Senior Residents (Cornea & Retina) must file their primary ophthalmology journal thesis abstract reviews before June 22nd, 2026, 04:00 PM. No extensions will be granted.
3. Annual mock clinical objective evaluations (OSCE) will commence on June 28th for all residents. Register folders by June 15th.`
    }
  ];

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
    }
  };

  // Read file and parse
  const handleUploadedFile = async (file: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const reader = new FileReader();
      
      // Determine if file is PDF or text
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        reader.readAsDataURL(file); // PDF is read as base64 data URL
        reader.onload = async () => {
          const base64Data = reader.result as string;
          await sendToGeminiParser(base64Data, "application/pdf", file.name, null);
        };
      } else {
        reader.readAsText(file); // Text files read as plain text
        reader.onload = async () => {
          const textContent = reader.result as string;
          await sendToGeminiParser(null, null, file.name, textContent);
        };
      }
    } catch (err: any) {
      setErrorMsg("Unable to process this file format. Try uploading a text circular or a PDF.");
      setIsUploading(false);
    }
  };

  // Request to server API
  const sendToGeminiParser = async (fileData: string | null, mimeType: string | null, fileName: string, textContent: string | null) => {
    try {
      const response = await fetch("/api/gemini/parse-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData,
          mimeType,
          textContent,
          residentName: profile?.displayName || "Dr. Rohan Mehta",
          residentYear: profile?.year || "Junior Resident (Y2)"
        })
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.reminders)) {
        // Integrate parsed reminders
        const formatted: PersonalReminder[] = data.reminders.map((r: any, idx: number) => ({
          id: `parsed_${Date.now()}_${idx}`,
          title: r.title,
          date: r.date,
          time: r.time,
          category: r.category,
          description: r.description,
          priority: r.priority,
          isRead: false,
          isCompleted: false,
          createdAt: new Date().toISOString()
        }));

        const combined = [...formatted, ...reminders];
        saveReminders(combined);
        setSuccessMsg(`Successfully parsed "${fileName}"! Extracted ${formatted.length} individual reminders personalized for you.`);
      } else {
        throw new Error(data.error || "The server returned an invalid format.");
      }
    } catch (err: any) {
      console.warn("Real-time parsing failed. Executing custom local fallback parsing...", err);
      // Fallback parsing (Mock AI engine)
      simulateLocalParsing(textContent || fileName);
    } finally {
      setIsUploading(false);
    }
  };

  // Intelligent client-side fallback parsing when API keys are missing or offline
  const simulateLocalParsing = (contentSeed: string) => {
    setTimeout(() => {
      const nameSeed = profile?.displayName || "Dr. Rohan Mehta";
      const yearSeed = profile?.year || "Junior Resident (Y2)";
      let extracted: PersonalReminder[] = [];

      // Check content keywords for custom fallback match
      if (contentSeed.toLowerCase().includes("rotation") || contentSeed.toLowerCase().includes("schedule")) {
        extracted = [
          {
            id: `mock_rot_1_${Date.now()}`,
            title: yearSeed.includes("Y2") ? "Emergency On-Call Duty (Trauma)" : "Pediatric Squint Case Presentation",
            date: "2026-06-12",
            time: yearSeed.includes("Y2") ? "08:00 PM" : "09:00 AM",
            category: "Duty",
            description: yearSeed.includes("Y2") 
              ? "Emergency night shift triage duty at trauma block. Coordinate logs with Senior resident Dr. Aahan Shah."
              : "Prepare clinical workups for the pediatric squint seminar moderator review.",
            priority: "High",
            isRead: false,
            isCompleted: false,
            createdAt: new Date().toISOString()
          },
          {
            id: `mock_rot_2_${Date.now()}`,
            title: "Ophthalmology Grand Rounds",
            date: "2026-06-20",
            time: "08:30 AM",
            category: "Event",
            description: "Mandatory central amphitheater attendance on 'Evolving Paradigms in Complex Paediatric Cataracts'.",
            priority: "Medium",
            isRead: false,
            isCompleted: false,
            createdAt: new Date().toISOString()
          }
        ];
      } else if (contentSeed.toLowerCase().includes("thesis") || contentSeed.toLowerCase().includes("deadline")) {
        extracted = [
          {
            id: `mock_the_1_${Date.now()}`,
            title: "Ethical Clearance Final Approval",
            date: "2026-06-14",
            time: "04:00 PM",
            category: "Deadline",
            description: `Submit approved ethics clearance certificate to administrative corridor office. Key milestone for ${yearSeed}.`,
            priority: "High",
            isRead: false,
            isCompleted: false,
            createdAt: new Date().toISOString()
          },
          {
            id: `mock_the_2_${Date.now()}`,
            title: "OSCE Registration Folder Due",
            date: "2026-06-15",
            time: "12:00 PM",
            category: "Deadline",
            description: "Compile surgical log reports and clinical portfolio printouts for registration validation.",
            priority: "Medium",
            isRead: false,
            isCompleted: false,
            createdAt: new Date().toISOString()
          }
        ];
      } else {
        // General generic fallback reminder
        extracted = [
          {
            id: `mock_gen_${Date.now()}`,
            title: "Review Uploaded Notice Board circular",
            date: new Date().toISOString().split("T")[0],
            time: "All Day",
            category: "General",
            description: `A new department document was uploaded. Keep updated on new rotational changes for ${nameSeed}.`,
            priority: "Low",
            isRead: false,
            isCompleted: false,
            createdAt: new Date().toISOString()
          }
        ];
      }

      const combined = [...extracted, ...reminders];
      saveReminders(combined);
      setSuccessMsg(`Circular parsed! (Simulated local extraction) Added ${extracted.length} personalized reminders based on your profile context.`);
      setIsUploading(false);
    }, 1200);
  };

  // Action: Mark completed (rewards XP!)
  const completeReminder = (id: string) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
        if (!r.isCompleted) {
          // Trigger reward of merit points!
          awardMeritXP(r);
        }
        return { ...r, isCompleted: true, isRead: true };
      }
      return r;
    });
    saveReminders(updated);
  };

  // Helper to award merit XP
  const awardMeritXP = (reminder: PersonalReminder) => {
    // We add dynamic local merit points. When residents complete a reminder, they get +20 Merit Points (Teaching or Clinical XP)
    const savedProfiles = localStorage.getItem("pulse_profiles");
    if (savedProfiles && profile) {
      const profs = JSON.parse(savedProfiles);
      const updatedProfs = profs.map((p: any) => {
        if (p.uid === profile.uid) {
          const awardAmount = reminder.priority === "High" ? 30 : 15;
          const updatedTotal = p.totalXp + awardAmount;
          // Allocate to clinical or academic XP
          const academicXp = p.academicXp + awardAmount;
          
          return {
            ...p,
            academicXp,
            totalXp: updatedTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
      localStorage.setItem("pulse_profiles", JSON.stringify(updatedProfs));
      
      // Dispatch custom profile update event to instantly sync client dashboard
      window.dispatchEvent(new Event("profile-updated"));
      
      // Flash temporary success notification
      const awardMessage = `🏆 Duty Completed! Awarded +${reminder.priority === "High" ? 30 : 15} Merit Points to your portfolio.`;
      setSuccessMsg(awardMessage);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Action: Delete reminder
  const deleteReminder = (id: string) => {
    const filtered = reminders.filter(r => r.id !== id);
    saveReminders(filtered);
  };

  // Action: Mark all as read
  const markAllRead = () => {
    const updated = reminders.map(r => ({ ...r, isRead: true }));
    saveReminders(updated);
  };

  // Form submission
  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const custom: PersonalReminder = {
      id: `custom_${Date.now()}`,
      title: newTitle,
      date: newDate || new Date().toISOString().split("T")[0],
      time: newTime || "All Day",
      category: newCategory,
      description: newDesc,
      priority: newPriority,
      isRead: false,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    saveReminders([custom, ...reminders]);
    setNewTitle("");
    setNewDate("");
    setNewTime("");
    setNewDesc("");
    setIsFormOpen(false);
  };

  // Filters
  const unreadCount = reminders.filter(r => !r.isRead && !r.isCompleted).length;

  return (
    <div className="space-y-6 animate-fade-in" id="reminders_dashboard_panel">
      
      {/* 1. Interactive Title Banner */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <Bell className="h-5 w-5 animate-swing" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none font-sans">Notifications & Department Reminders</h1>
              <p className="text-white/60 text-xs mt-2 leading-relaxed">
                Parse official circular PDFs or rosters to generate personalized duties, case presentations, and academic targets.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold rounded-lg text-xs transition duration-150 flex items-center gap-1.5 shadow-sm shadow-indigo-500/10 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Add Reminder
          </button>
        </div>
      </div>

      {/* 2. Success and Error Messaging */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-2 text-xs text-emerald-200 shadow-md">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-light">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-2 text-xs text-red-200 shadow-md">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span className="font-light">{errorMsg}</span>
        </div>
      )}

      {/* 3. Circular Upload Parser Component & Presets (Side-by-Side Bento Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Box */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-sm backdrop-blur-sm">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-3.5 flex items-center gap-1.5 font-mono">
            <UploadCloud className="h-4 w-4 text-white/60" /> Smart Circular Parser
          </h2>
          
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition duration-200 flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
              dragActive 
                ? "border-indigo-400 bg-indigo-500/5" 
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <input 
              type="file" 
              id="circular-uploader" 
              className="hidden" 
              accept=".pdf,.txt"
              onChange={handleFileInput}
            />
            <label htmlFor="circular-uploader" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
              {isUploading ? (
                <div className="space-y-3">
                  <div className="h-8 w-8 rounded-full border-2 border-t-indigo-500 border-indigo-500/10 animate-spin mx-auto" />
                  <p className="text-white/80 font-medium text-xs font-sans">Gemini model analyzing notice contents...</p>
                  <p className="text-white/40 text-[10px]">Filtering individual assignments, rotations, & academic targets</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Bell className="h-8 w-8 text-white/20 mx-auto" />
                  <p className="text-xs font-semibold text-white/90">Drag & Drop official PDF notice or text circular here</p>
                  <p className="text-white/40 text-[10px]">Supports standard .pdf, .txt circulars • Processes server-side via Gemini 3.5</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Preset Templates Column */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-2.5 flex items-center gap-1.5 font-mono">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" /> Try Quick Demos
            </h2>
            <p className="text-white/50 text-[11px] font-light leading-relaxed mb-4">
              Click any circular preset to experience Gemini's personalized timeline extraction.
            </p>
            
            <div className="space-y-2.5">
              {presetTemplates.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsUploading(true);
                    sendToGeminiParser(null, null, preset.fileName, preset.content);
                  }}
                  disabled={isUploading}
                  className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 transition text-xs flex flex-col gap-1 cursor-pointer"
                >
                  <span className="font-bold text-white/95">{preset.name}</span>
                  <span className="text-[10px] text-white/40 truncate w-full">{preset.content.split("\n")[1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] text-white/40 leading-relaxed font-light">
            <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>Reminders are personalized based on your active profile: <strong className="text-white/80">{profile?.displayName} ({profile?.year?.split(" ")[0]})</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Manual Reminder Creation Form Modal */}
      {isFormOpen && (
        <form onSubmit={handleCreateReminder} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 animate-fade-in shadow-lg">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2.5 font-mono">
            Create Custom Portfolio Reminder
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-white/60 font-semibold">Reminder Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Ophthalmology Night Duty Preparation"
                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-400 focus:outline-none"
              />
            </div>
            
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-white/60 font-semibold">Target Date</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-white/60 font-semibold">Scheduled Time</label>
              <input
                type="text"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                placeholder="e.g. 08:30 AM"
                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-white/60 font-semibold">Action Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-400 focus:outline-none"
              >
                <option value="Academic">Academic (MCQs/Quiz/Cases)</option>
                <option value="Duty">Duty (OT/Clinics/OPD)</option>
                <option value="Deadline">Deadline (Thesis/Logs)</option>
                <option value="Event">Event (Grand Rounds/Lectures)</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-white/60 font-semibold">Task Priority</label>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as any)}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-400 focus:outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-white/60 font-semibold">Instruction Detail</label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Specific instructions or requirements..."
                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold transition cursor-pointer text-xs"
            >
              Save Custom Reminder
            </button>
          </div>
        </form>
      )}

      {/* 5. Live Notices and Reminders Feed Component */}
      <div className="space-y-4">
        
        {/* Sub-tabs header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveSubTab("reminders")}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeSubTab === "reminders" 
                  ? "border-indigo-400 text-white font-bold" 
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              Personalized Duties & Reminders ({reminders.filter(r => !r.isCompleted).length})
            </button>
            
            <button
              onClick={() => setActiveSubTab("all")}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeSubTab === "all" 
                  ? "border-indigo-400 text-white font-bold" 
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              Resolved / Archive ({reminders.filter(r => r.isCompleted).length})
            </button>
          </div>

          {activeSubTab === "reminders" && reminders.some(r => !r.isRead) && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 font-mono uppercase tracking-wider cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Reminders List Feed */}
        <div className="space-y-3">
          {reminders.filter(r => activeSubTab === "reminders" ? !r.isCompleted : r.isCompleted).length === 0 ? (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center text-white/30 text-xs flex flex-col items-center justify-center gap-2">
              <Check className="h-6 w-6 text-white/20" />
              <span>No active timeline reminders. Upload a roster or click a preset circular to parse personalized items!</span>
            </div>
          ) : (
            reminders
              .filter(r => activeSubTab === "reminders" ? !r.isCompleted : r.isCompleted)
              .map(r => {
                const isOverdue = new Date(r.date) < new Date() && !r.isCompleted;
                return (
                  <div 
                    key={r.id} 
                    className={`bg-white/5 border rounded-xl p-4 transition shadow-sm relative overflow-hidden group ${
                      r.isCompleted 
                        ? "border-white/5 opacity-60" 
                        : !r.isRead 
                          ? "border-indigo-500/30 bg-indigo-500/[0.01]" 
                          : "border-white/10 hover:border-white/15"
                    }`}
                  >
                    {/* Read/Unread Accent Dot */}
                    {!r.isRead && !r.isCompleted && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Priority Tag */}
                          <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider border font-mono ${
                            r.priority === "High" 
                              ? "bg-red-500/10 border-red-500/25 text-red-400" 
                              : r.priority === "Medium"
                                ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                                : "bg-zinc-500/10 border-zinc-500/25 text-zinc-400"
                          }`}>
                            {r.priority} Priority
                          </span>
                          
                          {/* Category Tag */}
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-[4px] text-[9px] font-bold font-mono text-white/50">
                            {r.category}
                          </span>

                          {/* Time / Date Tag */}
                          <span className={`text-[10px] font-mono flex items-center gap-1 leading-none ${isOverdue ? "text-red-400 font-bold animate-pulse" : "text-white/40"}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {r.date} • {r.time}
                          </span>
                        </div>

                        <h3 className={`text-sm font-bold tracking-tight mt-1.5 font-sans ${r.isCompleted ? "line-through text-white/50" : "text-white"}`}>
                          {r.title}
                        </h3>
                        
                        <p className="text-white/60 text-xs leading-relaxed font-light mt-1 max-w-4xl">
                          {r.description}
                        </p>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!r.isCompleted ? (
                          <button
                            onClick={() => completeReminder(r.id)}
                            className="h-8 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-zinc-950 font-bold text-[10px] uppercase tracking-wider transition flex items-center gap-1 cursor-pointer border border-indigo-500/20 shadow-sm"
                            title="Complete this target task to award merit points to your profile"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Resolve Task
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                            <Check className="h-3.5 w-3.5" /> Done (+XP Awarded)
                          </span>
                        )}

                        <button
                          onClick={() => deleteReminder(r.id)}
                          className="p-2 rounded-lg border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-white/30 hover:text-red-400 transition cursor-pointer"
                          title="Dismiss / Archive Reminder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
      
    </div>
  );
};
