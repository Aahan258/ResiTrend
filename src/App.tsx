import React, { useState } from "react";
import { motion } from "motion/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";

const bannerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const bannerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18
    }
  }
};

// Core views
import { HallOfImpact } from "./components/HallOfImpact";
import { SilentApplause } from "./components/SilentApplause";
import { EndorsementsComponent } from "./components/EndorsementsComponent";
import { InnovationHub } from "./components/InnovationHub";
import { LeaderboardsComponent } from "./components/LeaderboardsComponent";
import { Announcements } from "./components/Announcements";
import { AdminPanel } from "./components/AdminPanel";
import { SettingsPanel } from "./components/SettingsPanel";

// Mobile icon shortcuts
import { 
  Award, 
  Heart, 
  CheckCircle, 
  Lightbulb, 
  Trophy, 
  Megaphone, 
  Settings,
  Shield,
  Zap,
  Sparkles,
  AlertCircle,
  Camera,
  Edit3,
  Upload,
  X,
  FileImage,
  Share2
} from "lucide-react";

const compressImage = (
  base64Str: string,
  maxWidth = 150,
  maxHeight = 150,
  quality = 0.75
): Promise<{ compressedBase64: string; originalSizeKb: number; compressedSizeKb: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);

      const originalSizeKb = Math.round(((base64Str.length - (base64Str.indexOf(",") + 1)) * 3) / 4 / 1024);
      const compressedSizeKb = Math.round(((compressedBase64.length - (compressedBase64.indexOf(",") + 1)) * 3) / 4 / 1024);

      resolve({
        compressedBase64,
        originalSizeKb,
        compressedSizeKb,
      });
    };
    img.onerror = (err) => reject(err);
  });
};

const ProfileCompletionCountUp: React.FC<{ target: number }> = ({ target }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number | null = null;
    const duration = 1200; // 1.2s smooth animation

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const animFrame = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animFrame);
  }, [target]);

  return <>{count}</>;
};

const CircularProgressRing: React.FC<{ value: number; size?: number; strokeWidth?: number }> = ({
  value,
  size = 40,
  strokeWidth = 3,
}) => {
  const [currentValue, setCurrentValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number | null = null;
    const duration = 1200; // Smooth 1.2s matching the count-up

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      
      setCurrentValue(easeProgress * value);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const animFrame = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animFrame);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentValue / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }} id="circular_progress_inner_wrapper">
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Track Circle */}
        <circle
          className="text-white/10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated Progress Circle */}
        <circle
          className="text-emerald-400 transition-all duration-75 ease-out"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Central Value */}
      <span className="absolute text-[9px] font-bold text-white font-mono leading-none">
        {Math.round(currentValue)}%
      </span>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("impact");
  const { isAdmin, profile, authError, clearAuthError, updateProfilePhoto, updateProfileBio } = useAuth();

  // Action modals states
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [bioInputText, setBioInputText] = useState("");
  const [photoDragActive, setPhotoDragActive] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState("");
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);

  const handleShareProfile = async () => {
    if (!profile) return;
    const shareUrl = `${window.location.origin}/?resident=${profile.uid}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedProfileLink(true);
      setTimeout(() => setCopiedProfileLink(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // High efficiency compression states
  const [isCompressing, setIsCompressing] = useState(false);
  const [customImageStats, setCustomImageStats] = useState<{ originalSizeKb: number; compressedSizeKb: number } | null>(null);

  const presetAvatars = [
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80",
  ];

  const handleOpenBioModal = () => {
    setBioInputText(profile?.bio || "");
    setIsBioModalOpen(true);
  };

  const handleSaveBio = async () => {
    if (!bioInputText.trim() || !profile) return;
    setIsSavingBio(true);
    try {
      await updateProfileBio(bioInputText.trim(), profile.year);
      setIsBioModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setPhotoDragActive(true);
    } else if (e.type === "dragleave") {
      setPhotoDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    setIsCompressing(true);
    reader.onload = async (event) => {
      if (event.target?.result) {
        const rawBase64 = event.target.result as string;
        try {
          const result = await compressImage(rawBase64);
          setTempPhotoUrl(result.compressedBase64);
          setCustomImageStats({
            originalSizeKb: result.originalSizeKb,
            compressedSizeKb: result.compressedSizeKb,
          });
        } catch (error) {
          console.error("Image compression error:", error);
          setTempPhotoUrl(rawBase64);
          setCustomImageStats(null);
        } finally {
          setIsCompressing(false);
        }
      } else {
        setIsCompressing(false);
      }
    };
    reader.onerror = () => {
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSavePhoto = async () => {
    if (!tempPhotoUrl) return;
    setIsSavingPhoto(true);
    try {
      await updateProfilePhoto(tempPhotoUrl);
      setIsPhotoModalOpen(false);
      setTempPhotoUrl("");
      setCustomImageStats(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Route/Tab switcher logic
  const renderContent = () => {
    switch (activeTab) {
      case "impact":
        return <HallOfImpact />;
      case "applause":
        return <SilentApplause />;
      case "endorsements":
        return <EndorsementsComponent />;
      case "innovation":
        return <InnovationHub />;
      case "leaderboards":
        return <LeaderboardsComponent />;
      case "announcements":
        return <Announcements />;
      case "settings":
        return <SettingsPanel />;
      case "admin":
        return isAdmin ? <AdminPanel /> : <HallOfImpact />;
      default:
        return <HallOfImpact />;
    }
  };

  // Mobile Navigation Bottom Bar Configuration
  const mobileNavItems = [
    { id: "impact", label: "Impact", icon: Award },
    { id: "applause", label: "Applause", icon: Heart },
    { id: "endorsements", label: "Skills", icon: CheckCircle },
    { id: "innovation", label: "Ideas", icon: Lightbulb },
    { id: "leaderboards", label: "Boards", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none" id="main_layout_scaffold">
      {/* 1. Global Navigation Header */}
      <Header />

      {/* 2. Main content container */}
      <div className="flex-1 flex" id="main_dashboard_viewport">
        {/* Sidebar Navigation - Desktop only */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content canvas with responsive bounds */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 md:pb-8" id="primary_panel_content_canvas">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Whitelist Denied Warning Banner */}
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-center justify-between text-xs text-red-200 animate-fade-in shadow-[0_0_15px_rgba(239,68,68,0.03)]" id="whitelist_auth_error_alert">
                <p className="font-light leading-snug flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>{authError}</span>
                </p>
                <button 
                  onClick={clearAuthError}
                  className="text-red-400 hover:text-red-300 ml-4 font-mono text-[10px] uppercase tracking-wider cursor-pointer font-bold shrink-0 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Top Bulletin Banner / Announcement highlight (Real-time positive reinforcement) */}
            {profile && (
              <motion.div 
                className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-[0_0_15px_rgba(255,255,255,0.03)]" 
                id="bulletin_completion_banner"
                variants={bannerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <motion.div variants={bannerItemVariants} className="shrink-0 pt-0.5">
                    <CircularProgressRing value={profile.profileCompletionScore || 0} size={42} strokeWidth={3} />
                  </motion.div>
                  <motion.div variants={bannerItemVariants} className="space-y-1 min-w-0 flex-1 sm:flex-initial">
                    <p className="text-white/90 font-medium leading-none flex items-center gap-1.5 font-sans">
                      <Sparkles className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
                      <span className="truncate">Welcome back, <span className="font-bold text-white">{profile.displayName}</span></span>
                    </p>
                    <p className="text-white/50 text-[11px] font-light leading-snug">
                      Your portfolio completion is currently at <span className="text-emerald-400 font-semibold font-mono"><ProfileCompletionCountUp target={profile.profileCompletionScore || 0} />%</span>. Keep building your clinical profile!
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1.5" id="completion_banner_actions_group">
                      <button 
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition hover:underline bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/5 shadow-sm shrink-0"
                        id="bulletin_upload_photo_btn"
                      >
                        <Camera className="h-3 w-3" /> Upload Photo
                      </button>
                      <button 
                        onClick={handleOpenBioModal}
                        className="text-amber-400 hover:text-amber-300 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition hover:underline bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/5 shadow-sm shrink-0"
                        id="bulletin_edit_bio_btn"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Bio
                      </button>
                      <button 
                        onClick={handleShareProfile}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition hover:underline bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/5 shadow-sm font-mono shrink-0"
                        id="bulletin_share_profile_btn"
                      >
                        <Share2 className="h-3 w-3" /> 
                        <span>{copiedProfileLink ? "Copied!" : "Share Profile"}</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
                <motion.button 
                  variants={bannerItemVariants}
                  onClick={() => setActiveTab("settings")}
                  className="text-white/70 hover:text-white hover:bg-white/10 border border-white/5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-mono text-[9px] uppercase tracking-wider font-semibold shrink-0"
                >
                  Configure Links
                </motion.button>
              </motion.div>
            )}

            {/* Simulated Router Workspace */}
            {renderContent()}

          </div>
        </main>
      </div>

      {/* 3. Mobile Navigation Bottom Bar - Mobile devices only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/5 backdrop-blur-xl border-t border-white/10 py-2.5 px-4 flex items-center justify-around md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.3)]" id="mobile_floating_nav_dock">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition cursor-pointer ${
                isActive ? "text-white font-bold" : "text-white/40 hover:text-white/70"
              }`}
              id={`mobile_tab_${item.id}`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "scale-110 text-white" : "text-white/40"}`} />
              <span className="leading-none">{item.label}</span>
            </button>
          );
        })}
        {/* Mobile Settings Shortcut */}
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition cursor-pointer ${
            activeTab === "settings" ? "text-white font-bold" : "text-white/40"
          }`}
          id="mobile_tab_settings"
        >
          <Settings className={`h-4.5 w-4.5 ${activeTab === "settings" ? "text-white" : "text-white/40"}`} />
          <span className="leading-none">Links</span>
        </button>
      </nav>

      {/* Edit Bio Modal Overlay */}
      {isBioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" id="edit_bio_modal_overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-904 bg-[#09090b] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4"
            id="edit_bio_modal_box"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-amber-400" /> Edit Professional Bio
              </h3>
              <button 
                onClick={() => setIsBioModalOpen(false)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-white/50 leading-relaxed">
                Describe your research interests, specialty clinical highlights, and residency focal points to complete your identity card.
              </p>
              <textarea
                value={bioInputText}
                onChange={(e) => setBioInputText(e.target.value)}
                placeholder="e.g. Senior Eye Resident focused on clinical ocular oncology trials and sutureless cataract incision methodologies..."
                rows={5}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl text-xs py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-amber-400/50 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBioModalOpen(false)}
                className="px-3 py-1.5 text-xs text-white/60 hover:text-white font-medium hover:bg-white/5 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBio}
                disabled={isSavingBio || !bioInputText.trim()}
                className="bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-zinc-950 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer flex items-center gap-1 shadow-md shadow-amber-400/10"
              >
                {isSavingBio ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Photo Modal Overlay */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" id="upload_photo_modal_overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-904 bg-[#09090b] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5"
            id="upload_photo_modal_box"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                <Camera className="h-4 w-4 text-emerald-400" /> Upload Profile Image
              </h3>
              <button 
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setTempPhotoUrl("");
                  setCustomImageStats(null);
                }}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Selection Options (Preset vs Custom Upload) */}
            <div className="space-y-4">
              {/* Option A: Quick-start preset Avatars */}
              <div className="space-y-2">
                <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">A. Choose a Professional Avatar</span>
                <div className="grid grid-cols-4 gap-3 bg-zinc-950 p-2.5 rounded-xl border border-white/5">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTempPhotoUrl(url);
                        setCustomImageStats(null);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${tempPhotoUrl === url ? "border-emerald-400 scale-95 shadow-md shadow-emerald-400/20" : "border-transparent hover:border-white/20 hover:scale-95"}`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover animate-fade-in" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Option B: Custom File Upload (Drag & Drop + Input Select) */}
              <div className="space-y-2">
                <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">B. Or Upload Custom Image</span>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("avatar_file_input")?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    photoDragActive 
                      ? "border-emerald-400 bg-emerald-500/5" 
                      : tempPhotoUrl && !presetAvatars.includes(tempPhotoUrl)
                        ? "border-emerald-400/60 bg-zinc-950"
                        : "border-white/10 hover:border-white/20 bg-zinc-950 hover:bg-zinc-950/80"
                  }`}
                  id="drag_drop_avatar_area"
                >
                  <input 
                    type="file"
                    id="avatar_file_input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {isCompressing ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="h-8 w-8 rounded-full border-2 border-t-emerald-400 border-zinc-800 animate-spin" />
                      <span className="text-[10px] text-emerald-400 font-mono text-center animate-pulse">Compressing Ophthalmic Image...</span>
                    </div>
                  ) : tempPhotoUrl && !presetAvatars.includes(tempPhotoUrl) ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-14 w-14 rounded-full overflow-hidden border border-emerald-400/50 shadow-md">
                        <img src={tempPhotoUrl} alt="Preview" className="w-full h-full object-cover animate-fade-in" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono text-center truncate max-w-[200px]">Custom Image Selected</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-white/30" />
                      <div className="text-center">
                        <p className="text-xs text-white/80 font-medium font-sans">Drag & drop profile picture or click</p>
                        <p className="text-[9px] text-white/40 mt-1 font-mono">JPG, PNG, GIF up to 5MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Displaying Live Preview */}
            {tempPhotoUrl && (
              <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 flex flex-col gap-3" id="avatar_upload_preview_row">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800">
                      <img src={tempPhotoUrl} alt="Selected Avatar preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-white">Avatar Selected</span>
                      <span className="block text-[10px] text-emerald-400 font-mono">+10% Profile Completion Bonus</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTempPhotoUrl("");
                      setCustomImageStats(null);
                    }}
                    className="text-[10px] font-mono text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>
                {/* Image compression stats badge/metrics */}
                {customImageStats && (
                  <div className="border-t border-white/5 pt-2 flex flex-wrap items-center gap-2 text-[10px]" id="compression_stats_panel">
                    <span className="text-zinc-500 font-mono">Original: <span className="text-zinc-400">{customImageStats.originalSizeKb} KB</span></span>
                    <span className="text-zinc-500 h-3 w-px bg-white/10" />
                    <span className="text-emerald-400 font-semibold font-mono">Compressed: <span>{customImageStats.compressedSizeKb} KB</span></span>
                    <span className="text-zinc-500 h-3 w-px bg-white/10" />
                    <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">
                      {Math.max(0, Math.round(((customImageStats.originalSizeKb - customImageStats.compressedSizeKb) / customImageStats.originalSizeKb) * 100))}% Saved! 🚀
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setTempPhotoUrl("");
                  setCustomImageStats(null);
                }}
                className="px-3 py-1.5 text-xs text-white/60 hover:text-white font-medium hover:bg-white/5 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={isSavingPhoto || isCompressing || !tempPhotoUrl}
                className="bg-emerald-400 hover:bg-emerald-500 disabled:opacity-50 text-zinc-950 px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-400/10"
              >
                {isSavingPhoto ? "Saving..." : "Apply Profile Image"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
