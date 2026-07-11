import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment, collection, getDocs } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { Profile, ReputationLevel, ResidentYear, Achievement, Endorsement, Recognition, InnovationIdea, Announcement, AchievementCategory, RecognitionCategory, AnnouncementCategory, InnovationStatus } from "../types";
import { isEmailWhitelisted, getWhitelistEntry, WhitelistEntry, WHITELIST_EMAILS } from "../lib/whitelist";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  isFirebaseActive: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  // For easy iframe demo & testing bypass
  bypassAuth: (role: "resident" | "admin", name?: string, year?: ResidentYear) => void;
  // Local or Firebase sync hooks
  profiles: Profile[];
  achievements: Achievement[];
  endorsements: Endorsement[];
  recognitions: Recognition[];
  innovations: InnovationIdea[];
  announcements: Announcement[];
  addAchievement: (title: string, category: any, date: string, proofUrl?: string) => Promise<void>;
  addEndorsement: (toUserId: string, category: any) => Promise<void>;
  addSilentApplause: (toUserId: string, category: any, message: string) => Promise<void>;
  addInnovation: (title: string, problem: string, solution: string, impact: string) => Promise<void>;
  upvoteInnovation: (ideaId: string) => Promise<void>;
  addComment: (ideaId: string, text: string) => Promise<void>;
  addAnnouncement: (title: string, content: string, category: any) => Promise<void>;
  validateAchievement: (achievementId: string) => Promise<void>;
  verifyAchievementAdmin: (achievementId: string) => Promise<void>;
  updateInnovationStatus: (ideaId: string, status: any) => Promise<void>;
  updateProfileLinks: (links: { googleScholar?: string; orcid?: string; linkedIn?: string; researchGate?: string }) => Promise<void>;
  updateProfileBio: (bio: string, year: ResidentYear) => Promise<void>;
  updateProfilePhoto: (photoUrl: string) => Promise<void>;
  exportProfileToCloud: () => Promise<{ success: boolean; message: string }>;
  syncHardcodedWhitelistToCloud: () => Promise<{ success: boolean; message: string }>;
  addNewWhitelistEmail: (email: string, name: string) => Promise<{ success: boolean; message: string }>;
  fetchCloudWhitelist: () => Promise<WhitelistEntry[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// SEED DATA FOR SIMULATED EXPERIENCE & FIRST VISIT PRE-POPULATION
const SEED_PROFILES: Profile[] = [
  {
    uid: "seed_aahan",
    displayName: "Dr. Aahan Shah",
    bio: "Senior Ophthalmology Resident with research interests in deep learning models for glaucoma progression and diabetic retinopathy screening.",
    year: "Senior Resident (Glaucoma)",
    googleScholar: "https://scholar.google.com/citations?user=AahanEye",
    orcid: "https://orcid.org/0000-0002-1823-3914",
    linkedIn: "https://linkedin.com/in/aahan-ophthalmology",
    researchGate: "https://researchgate.net/profile/Aahan_Shah",
    academicXp: 320,
    teachingXp: 180,
    innovationXp: 160,
    recognitionXp: 220,
    totalXp: 880,
    reputationLevel: ReputationLevel.EXCEPTIONAL,
    endorsementCounts: {
      "Clinical Skills": 15,
      "Surgical Skills": 18,
      "Teaching": 12,
      "Research": 24,
      "Leadership": 10,
      "Teamwork": 14,
      "Communication": 11,
      "Innovation": 15
    },
    profileCompletionScore: 100,
    silentApplauseCount: 9,
    updatedAt: new Date().toISOString()
  },
  {
    uid: "seed_priya",
    displayName: "Dr. Priya Nair",
    bio: "Focused on advanced phacoemulsification techniques, micro-incision vitrectomy surgery, and pediatric refraction workflows.",
    year: "Junior Resident (Y3)",
    googleScholar: "",
    orcid: "https://orcid.org/0000-0001-9238-1248",
    linkedIn: "https://linkedin.com/in/priya-nair-eye",
    researchGate: "",
    academicXp: 210,
    teachingXp: 250,
    innovationXp: 80,
    recognitionXp: 310,
    totalXp: 850,
    reputationLevel: ReputationLevel.INFLUENTIAL,
    endorsementCounts: {
      "Clinical Skills": 18,
      "Surgical Skills": 14,
      "Teaching": 22,
      "Research": 8,
      "Leadership": 13,
      "Teamwork": 19,
      "Communication": 15,
      "Innovation": 6
    },
    profileCompletionScore: 85,
    silentApplauseCount: 12,
    updatedAt: new Date().toISOString()
  },
  {
    uid: "seed_rohan",
    displayName: "Dr. Rohan Mehta",
    bio: "Junior resident focused on comprehensive clinical optics, squint diagnostics, and designing smart 3D-printed slit lamp phone adapters.",
    year: "Junior Resident (Y2)",
    googleScholar: "",
    orcid: "",
    linkedIn: "https://linkedin.com/in/rohan-mehta-ophthalmology",
    researchGate: "https://researchgate.net/profile/Rohan_Mehta_Eye",
    academicXp: 180,
    teachingXp: 90,
    innovationXp: 300,
    recognitionXp: 140,
    totalXp: 710,
    reputationLevel: ReputationLevel.RESPECTED,
    endorsementCounts: {
      "Clinical Skills": 9,
      "Surgical Skills": 10,
      "Teaching": 8,
      "Research": 12,
      "Leadership": 14,
      "Teamwork": 9,
      "Communication": 10,
      "Innovation": 25
    },
    profileCompletionScore: 90,
    silentApplauseCount: 4,
    updatedAt: new Date().toISOString()
  },
  {
    uid: "seed_sneha",
    displayName: "Dr. Sneha Sharma",
    bio: "Junior Resident eager to optimize patient counseling in vitreo-retinal clinics and implementing paperless emergency flow charts.",
    year: "Junior Resident (Y1)",
    googleScholar: "",
    orcid: "",
    linkedIn: "",
    researchGate: "",
    academicXp: 90,
    teachingXp: 110,
    innovationXp: 120,
    recognitionXp: 160,
    totalXp: 480,
    reputationLevel: ReputationLevel.ESTABLISHED,
    endorsementCounts: {
      "Clinical Skills": 7,
      "Surgical Skills": 5,
      "Teaching": 10,
      "Research": 4,
      "Leadership": 6,
      "Teamwork": 12,
      "Communication": 16,
      "Innovation": 11
    },
    profileCompletionScore: 60,
    silentApplauseCount: 7,
    updatedAt: new Date().toISOString()
  }
];

const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach_seed_1",
    userId: "seed_aahan",
    displayName: "Dr. Aahan Shah",
    title: "AI-Augmented Screening for Diabetic Retinopathy in Rural Camps",
    category: "Research Project",
    date: "2026-03-12",
    proofUrl: "https://pubmed.ncbi.nlm.nih.gov/3039485/",
    status: "admin-verified",
    validations: ["seed_priya", "seed_rohan"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ach_seed_2",
    userId: "seed_priya",
    displayName: "Dr. Priya Nair",
    title: "Phacoemulsification independent competency certificate - 100 successful hands-on cases",
    category: "Certification",
    date: "2026-04-05",
    proofUrl: "https://advancedeyecentre.org/cert/priya-nair-phaco",
    status: "admin-verified",
    validations: ["seed_aahan"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ach_seed_3",
    userId: "seed_rohan",
    displayName: "Dr. Rohan Mehta",
    title: "Best Young Innovator Award at All India Ophthalmological Society (AIOS)",
    category: "Award",
    date: "2026-02-18",
    proofUrl: "",
    status: "admin-verified",
    validations: ["seed_sneha", "seed_aahan"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ach_seed_4",
    userId: "seed_aahan",
    displayName: "Dr. Aahan Shah",
    title: "Comprehensive Glaucoma Visual Fields Interpretation Guide for Junior Residents",
    category: "Teaching Contribution",
    date: "2026-05-10",
    proofUrl: "",
    status: "community-validated",
    validations: ["seed_rohan", "seed_sneha"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const SEED_INNOVATIONS: InnovationIdea[] = [
  {
    id: "inn_seed_1",
    userId: "seed_rohan",
    displayName: "Dr. Rohan Mehta",
    title: "3D-Printed Anterior Segment Imaging Mobile Mount",
    problem: "Capturing high-resolution slit lamp photos requires commercial ophthalmic cameras which cost thousands of dollars and are rarely available in emergency rooms.",
    proposedSolution: "Design and materialize a precise, sterilizable 3D-printable clip-on structural mount that fits standard slit-lamp eyepieces, enabling resident smartphones to capture perfect optical focal planes.",
    expectedImpact: "Saves 95% of equipment costs, allows immediate micro-photo documenting of corneal ulcers in pediatric patients, and accelerates expert remote faculty consulting.",
    status: "Implemented",
    upvotesCount: 8,
    upvotedBy: ["seed_aahan", "seed_priya", "seed_sneha"],
    commentsCount: 2,
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-04-12T15:00:00Z"
  },
  {
    id: "inn_seed_2",
    userId: "seed_sneha",
    displayName: "Dr. Sneha Sharma",
    title: "QR-Code Based Pre-Op Cataract Education Walkthrough",
    problem: "Cataract patients often receive verbal instructions which they forget by the time they reach home, leading to post-op drop non-compliance and phone call overload for on-call residents.",
    proposedSolution: "Generate an interactive, mobile-optimized patient education micro-portal in regional languages detailing preoperative preparation, drop schedules, and red flags. Place physical QR code banners in the dilation room.",
    expectedImpact: "Expect 40% reduction in elective patient anxiety, 15% fewer on-call phone inquiries for minor questions, and robust adherence to topical postoperative antibiotic shields.",
    status: "Approved",
    upvotesCount: 4,
    upvotedBy: ["seed_rohan", "seed_priya"],
    commentsCount: 1,
    createdAt: "2026-05-14T09:30:00Z",
    updatedAt: "2026-05-20T11:00:00Z"
  }
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_seed_1",
    title: "Advanced Keratoconus & Corneal Collagen Cross-Linking (CXL) Hands-on Workshop",
    content: "Special practical session on mapping irregular corneal topographies, pachymetry-guided epithelial-off protocols, and UV irradiation dosage schedules. Compulsory attendance for all Senior Residents.",
    category: "Workshops",
    date: "2026-06-15",
    createdAt: "2026-06-01T08:00:00Z",
    authorId: "admin",
    authorName: "ResiTrend Admin"
  },
  {
    id: "ann_seed_2",
    title: "Ophthalmology Legacy Grand Rounds: Dr. Jagat Ram Memorial Oration",
    content: "We are honored to host pioneering insights on 'Evolving Paradigms in Complex Paediatric Cataracts.' Light refreshments will follow in the central atrium. All fellows and residents must assemble by 08:30 AM.",
    category: "Grand Rounds",
    date: "2026-06-20",
    createdAt: "2026-06-05T09:00:00Z",
    authorId: "admin",
    authorName: "ResiTrend Admin"
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Core Data Lists (Reactive local mirrors that fall back seamlessly to localStorage)
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const local = localStorage.getItem("pulse_profiles");
    return local ? JSON.parse(local) : SEED_PROFILES;
  });
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const local = localStorage.getItem("pulse_achievements");
    return local ? JSON.parse(local) : SEED_ACHIEVEMENTS;
  });
  const [endorsements, setEndorsements] = useState<Endorsement[]>(() => {
    const local = localStorage.getItem("pulse_endorsements");
    return local ? JSON.parse(local) : [];
  });
  const [recognitions, setRecognitions] = useState<Recognition[]>(() => {
    const local = localStorage.getItem("pulse_recognitions");
    return local ? JSON.parse(local) : [];
  });
  const [innovations, setInnovations] = useState<InnovationIdea[]>(() => {
    const local = localStorage.getItem("pulse_innovations");
    return local ? JSON.parse(local) : SEED_INNOVATIONS;
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const local = localStorage.getItem("pulse_announcements");
    return local ? JSON.parse(local) : SEED_ANNOUNCEMENTS;
  });

  // Sync state changes back to localStorage for seamless persistence
  useEffect(() => {
    localStorage.setItem("pulse_profiles", JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem("pulse_achievements", JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem("pulse_endorsements", JSON.stringify(endorsements));
  }, [endorsements]);

  useEffect(() => {
    localStorage.setItem("pulse_recognitions", JSON.stringify(recognitions));
  }, [recognitions]);

  useEffect(() => {
    localStorage.setItem("pulse_innovations", JSON.stringify(innovations));
  }, [innovations]);

  useEffect(() => {
    localStorage.setItem("pulse_announcements", JSON.stringify(announcements));
  }, [announcements]);

  // Firebase auth state hook
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            // Whitelist Check before proceeding (with cloud database secure backup)
            let isWhitelisted = isEmailWhitelisted(fbUser.email);
            let whitelistEntryName = "";

            if (isWhitelisted) {
              const localEntry = getWhitelistEntry(fbUser.email);
              if (localEntry) whitelistEntryName = localEntry.name;
            } else if (fbUser.email) {
              try {
                const whitelistDoc = await getDoc(doc(db, "whitelist", fbUser.email.trim().toLowerCase()));
                if (whitelistDoc.exists()) {
                  isWhitelisted = true;
                  whitelistEntryName = whitelistDoc.data()?.name || "";
                }
              } catch (err) {
                console.warn("Could not check cloud whitelist fallback during auth state change:", err);
              }
            }

            if (!isWhitelisted) {
              setAuthError(`The email "${fbUser.email || ''}" is not authorized for ResiTrend. Please contact the administrator.`);
              await signOut(auth);
              setUser(null);
              setProfile(null);
              setIsAdmin(false);
              
              // Fallback to local session simulated guest so they can still preview safely
              const localSession = localStorage.getItem("pulse_simulated_user");
              if (localSession) {
                const sim = JSON.parse(localSession);
                setUser(sim.user);
                setProfile(sim.profile);
                setIsAdmin(sim.isAdmin);
              } else {
                bypassAuth("resident", "Dr. Rohan Mehta", "Junior Resident (Y2)");
              }
              setLoading(false);
              return;
            }

            setUser(fbUser);
            setIsFirebaseActive(true);
            const isFounder = fbUser.email === "aahanshah2580@gmail.com";
            setIsAdmin(isFounder);

            // Fetch or create profile in Firestore securely
            const profileRef = doc(db, "profiles", fbUser.uid);
            let profileSnap;
            try {
              profileSnap = await getDoc(profileRef);
            } catch (error) {
              handleFirestoreError(error, OperationType.GET, `profiles/${fbUser.uid}`);
              return;
            }

            if (profileSnap && profileSnap.exists()) {
               const fetchedProf = profileSnap.data() as Profile;
               setProfile(fetchedProf);
               // Update local lists mirror with this active profile
               setProfiles(prev => {
                 const filtered = prev.filter(p => p.uid !== fetchedProf.uid);
                 return [fetchedProf, ...filtered];
               });
            } else {
              // Create dynamic new profile for newly registered users
              const resolvedName = whitelistEntryName || (fbUser.displayName || fbUser.email?.split("@")[0] || "Ophthalmic Resident");
              const newProf: Profile = {
                uid: fbUser.uid,
                displayName: resolvedName,
                bio: "Resident Physician specializing in clinical care.",
                year: "Junior Resident (Y1)",
                googleScholar: "",
                orcid: "",
                linkedIn: "",
                researchGate: "",
                academicXp: 0,
                teachingXp: 0,
                innovationXp: 0,
                recognitionXp: 0,
                totalXp: 0,
                reputationLevel: ReputationLevel.EMERGING,
                endorsementCounts: {
                  "Clinical Skills": 0,
                  "Surgical Skills": 0,
                  "Teaching": 0,
                  "Research": 0,
                  "Leadership": 0,
                  "Teamwork": 0,
                  "Communication": 0,
                  "Innovation": 0
                },
                profileCompletionScore: 30, // Default bio filled starts layout at 30%
                silentApplauseCount: 0,
                updatedAt: new Date().toISOString()
              };

              try {
                await setDoc(profileRef, newProf);
              } catch (error) {
                handleFirestoreError(error, OperationType.CREATE, `profiles/${fbUser.uid}`);
                return;
              }

              try {
                // Save a local shadow config to `users` collection too as documented in blueprint
                await setDoc(doc(db, "users", fbUser.uid), {
                  uid: fbUser.uid,
                  email: fbUser.email,
                  role: isFounder ? "admin" : "resident",
                  emailVerified: fbUser.emailVerified || isFounder,
                  createdAt: new Date().toISOString()
                });
              } catch (error) {
                handleFirestoreError(error, OperationType.CREATE, `users/${fbUser.uid}`);
                return;
              }

              setProfile(newProf);
              setProfiles(prev => [newProf, ...prev.filter(p => p.uid !== newProf.uid)]);
            }

            // Load other collections from Firestore for real-time compliance and session consistency
            try {
              const profilesSnap = await getDocs(collection(db, "profiles"));
              const fetchedProfList: Profile[] = [];
              profilesSnap.forEach((docSnap) => {
                fetchedProfList.push(docSnap.data() as Profile);
              });
              if (fetchedProfList.length > 0) {
                setProfiles(fetchedProfList);
                const active = fetchedProfList.find((p) => p.uid === fbUser.uid);
                if (active) {
                  setProfile(active);
                }
              }
            } catch (err) {
              console.warn("Failed to load profiles from Firestore:", err);
            }

            try {
              const achievementsSnap = await getDocs(collection(db, "achievements"));
              const fetchedAchievements: Achievement[] = [];
              achievementsSnap.forEach((docSnap) => {
                fetchedAchievements.push(docSnap.data() as Achievement);
              });
              if (fetchedAchievements.length > 0) {
                setAchievements(fetchedAchievements);
              }
            } catch (err) {
              console.warn("Failed to load achievements from Firestore:", err);
            }

            try {
              const endorsementsSnap = await getDocs(collection(db, "endorsements"));
              const fetchedEndorsements: Endorsement[] = [];
              endorsementsSnap.forEach((docSnap) => {
                fetchedEndorsements.push(docSnap.data() as Endorsement);
              });
              if (fetchedEndorsements.length > 0) {
                setEndorsemets(fetchedEndorsements);
              }
            } catch (err) {
              console.warn("Failed to load endorsements from Firestore:", err);
            }

            try {
              const recognitionsSnap = await getDocs(collection(db, "recognitions"));
              const fetchedRecognitions: Recognition[] = [];
              recognitionsSnap.forEach((docSnap) => {
                fetchedRecognitions.push(docSnap.data() as Recognition);
              });
              if (fetchedRecognitions.length > 0) {
                setRecognitions(fetchedRecognitions);
              }
            } catch (err) {
              console.warn("Failed to load recognitions from Firestore:", err);
            }

            try {
              const innovationsSnap = await getDocs(collection(db, "innovationIdeas"));
              const fetchedInnovations: InnovationIdea[] = [];
              innovationsSnap.forEach((docSnap) => {
                fetchedInnovations.push(docSnap.data() as InnovationIdea);
              });
              if (fetchedInnovations.length > 0) {
                setInnovations(fetchedInnovations);
              }
            } catch (err) {
              console.warn("Failed to load innovations from Firestore:", err);
            }

            try {
              const announcementsSnap = await getDocs(collection(db, "announcements"));
              const fetchedAnnouncements: Announcement[] = [];
              announcementsSnap.forEach((docSnap) => {
                fetchedAnnouncements.push(docSnap.data() as Announcement);
              });
              if (fetchedAnnouncements.length > 0) {
                setAnnouncements(fetchedAnnouncements);
              }
            } catch (err) {
              console.warn("Failed to load announcements from Firestore:", err);
            }
          } else {
            // No Google User, let's keep simulated fallback session if any
            const localSession = localStorage.getItem("pulse_simulated_user");
            if (localSession) {
              const sim = JSON.parse(localSession);
              setUser(sim.user);
              setProfile(sim.profile);
              setIsAdmin(sim.isAdmin);
            } else {
              // No auto-bypass by default to respect landing page public states
              setUser(null);
              setProfile(null);
              setIsAdmin(false);
            }
          }
          setLoading(false);
        });
        return unsubscribe;
      } catch (err) {
        console.warn("Firebase Auth listener disconnected or sandbox blocking. Using local simulator.", err);
        setLoading(false);
      }
    };
    checkFirebase();
  }, []);

  // AUTOMATED XP CALCULATOR & REPUTATION SCORE UPDATER (Automation First)
  const calculateReputationAndScore = (targetProfile: Profile, allAchievements: Achievement[], allEndorsements: Endorsement[], allRecognitions: Recognition[], allInnovations: InnovationIdea[]): Profile => {
    const uid = targetProfile.uid;

    // Filter relevant nodes
    const myAchievements = allAchievements.filter(a => a.userId === uid);
    const myEndorsements = allEndorsements.filter(e => e.toUserId === uid);
    const myRecognitions = allRecognitions.filter(r => r.toUserId === uid);
    const myInnovations = allInnovations.filter(i => i.userId === uid);

    // 1. Calculate XP by Specific Categories
    // Academic Achievements XP: 50 XP per self-declared, 100 XP per community valid, 200 XP for verified
    let academicXp = 0;
    myAchievements.forEach(a => {
      if (a.status === "admin-verified") academicXp += 200;
      else if (a.status === "community-validated") academicXp += 100;
      else academicXp += 50;
    });

    // Teaching Achievements and Endorsements: 30 XP per peer endorsement, 150 XP per certified Teaching contribution
    let teachingXp = 0;
    myAchievements.filter(a => a.category === "Teaching Contribution").forEach(a => {
      teachingXp += a.status === "admin-verified" ? 150 : 75;
    });
    const teachingEndords = myEndorsements.filter(e => e.category === "Teaching").length;
    teachingXp += teachingEndords * 30;

    // Innovation Achievements: 100 XP per approved innovation, 250 XP per implemented innovation
    let innovationXp = 0;
    myInnovations.forEach(i => {
      if (i.status === "Implemented") innovationXp += 250;
      else if (i.status === "Approved" || i.status === "Under Consideration") innovationXp += 150;
      else innovationXp += 50;
    });
    const innovationEndords = myEndorsements.filter(e => e.category === "Innovation").length;
    innovationXp += innovationEndords * 30;

    // Recognition XP: 40 XP per Anonymous Silent Applause note, plus standard skill endorsements
    let recognitionXp = myRecognitions.length * 40;
    const remainingEndords = myEndorsements.filter(e => e.category !== "Teaching" && e.category !== "Innovation").length;
    recognitionXp += remainingEndords * 25;

    // --- High-Engagement Gamification Drivers for Senders ---
    // 1. Silent Applause Sent: +2 XP per clinical appreciation sent to peers
    const mySentRecognitionsCount = allRecognitions.filter(r => r.fromUserId === uid).length;
    recognitionXp += mySentRecognitionsCount * 2;

    // 2. Peer Endorsements Sent: +2 XP per professional skill endorsement sent to colleagues
    const mySentEndorsementsCount = allEndorsements.filter(e => e.fromUserId === uid).length;
    recognitionXp += mySentEndorsementsCount * 2;

    // 3. Innovation Upvotes Cast: +1 XP per upvote cast on a peer's innovation idea
    const peerUpvotesCastCount = allInnovations.filter(i => i.upvotedBy.includes(uid) && i.userId !== uid).length;
    innovationXp += peerUpvotesCastCount * 1;

    // 4. Comments Cast on Innovations: +3 XP per constructive comment posted
    const myCommentsSent = JSON.parse(localStorage.getItem(`pulse_comments_sent_${uid}`) || "[]");
    innovationXp += myCommentsSent.length * 3;

    const totalXp = academicXp + teachingXp + innovationXp + recognitionXp;

    // 2. Generate Professional Reputation Level based on total contributions as specified
    // Levels: Emerging, Established, Respected, Influential, Exceptional
    let reputationLevel = ReputationLevel.EMERGING;
    if (totalXp >= 800 || (myAchievements.filter(a => a.status === "admin-verified").length >= 3)) {
      reputationLevel = ReputationLevel.EXCEPTIONAL;
    } else if (totalXp >= 500) {
      reputationLevel = ReputationLevel.INFLUENTIAL;
    } else if (totalXp >= 300) {
      reputationLevel = ReputationLevel.RESPECTED;
    } else if (totalXp >= 150) {
      reputationLevel = ReputationLevel.ESTABLISHED;
    }

    // 3. Re-calculate Endorsement counts mapped by category for rapid UI lookup
    const endorsementCounts = {
      "Clinical Skills": myEndorsements.filter(e => e.category === "Clinical Skills").length,
      "Surgical Skills": myEndorsements.filter(e => e.category === "Surgical Skills").length,
      "Teaching": teachingEndords,
      "Research": myEndorsements.filter(e => e.category === "Research").length,
      "Leadership": myEndorsements.filter(e => e.category === "Leadership").length,
      "Teamwork": myEndorsements.filter(e => e.category === "Teamwork").length,
      "Communication": myEndorsements.filter(e => e.category === "Communication").length,
      "Innovation": innovationEndords
    };

    // 4. Calculate Profile Completion Score: 20% for bio, 10% per filled link (linkedIn, scholar, orcid, researchGate) (40% total), 10% for adding profile photo, 10% if has at least 1 verified achievement
    let profileCompletionScore = 30;
    if (targetProfile.bio && targetProfile.bio.length > 20) profileCompletionScore += 10;
    if (targetProfile.photoUrl) profileCompletionScore += 10;
    if (targetProfile.linkedIn) profileCompletionScore += 10;
    if (targetProfile.googleScholar) profileCompletionScore += 10;
    if (targetProfile.orcid) profileCompletionScore += 10;
    if (targetProfile.researchGate) profileCompletionScore += 10;
    if (myAchievements.length > 0) profileCompletionScore += 10;

    profileCompletionScore = Math.min(profileCompletionScore, 100);

    return {
      ...targetProfile,
      academicXp,
      teachingXp,
      innovationXp,
      recognitionXp,
      totalXp,
      reputationLevel,
      endorsementCounts,
      profileCompletionScore,
      silentApplauseCount: myRecognitions.length,
      updatedAt: new Date().toISOString()
    };
  };

  // Safe operation wrap tool that syncs with Firebase IF connected, or falls back to local
  const executeDataAction = async (
    localAction: (
      currProfs: Profile[], 
      currAchs: Achievement[], 
      currEnds: Endorsement[], 
      currRecs: Recognition[], 
      currInns: InnovationIdea[],
      currAnns: Announcement[]
    ) => {
      profiles: Profile[];
      achievements?: Achievement[];
      endorsements?: Endorsement[];
      recognitions?: Recognition[];
      innovations?: InnovationIdea[];
      announcements?: Announcement[];
    },
    firebaseAction: () => Promise<void>
  ) => {
    // 1. Process local updates immediately for snappy UI feel + offline PWA functionality
    const outputs = localAction(profiles, achievements, endorsements, recognitions, innovations, announcements);
    
    // Automatically trigger automatic recalculation & score re-run for all profiles involved.
    let updatedProfiles = [...outputs.profiles];
    const targetAchs = outputs.achievements || achievements;
    const targetEnds = outputs.endorsements || endorsements;
    const targetRecs = outputs.recognitions || recognitions;
    const targetInns = outputs.innovations || innovations;

    updatedProfiles = updatedProfiles.map(p => 
      calculateReputationAndScore(p, targetAchs, targetEnds, targetRecs, targetInns)
    );

    // Apply states
    setProfiles(updatedProfiles);
    if (outputs.achievements) setAchievements(outputs.achievements);
    if (outputs.endorsements) setEndorsemets(outputs.endorsements);
    if (outputs.recognitions) setRecognitions(outputs.recognitions);
    if (outputs.innovations) setInnovations(outputs.innovations);
    if (outputs.announcements) setAnnouncements(outputs.announcements);

    // Check if user's own profile was updated, and refresh it
    if (profile) {
      const updatedSelf = updatedProfiles.find(p => p.uid === profile.uid);
      if (updatedSelf) setProfile(updatedSelf);
    }

    // 2. Perform background Firebase cloud write if available, failure will be caught cleanly without blocking
    if (isFirebaseActive) {
      try {
        await firebaseAction();
      } catch (err) {
        console.warn("Background cloud write bypassed. Operations logged locally.", err);
      }
    }
  };

  // Helper set functions for typing
  const setEndorsemets = (val: Endorsement[]) => setEndorsements(val);

  // AUTH ACTIONS:
  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      
      let isWhitelisted = isEmailWhitelisted(email);
      if (!isWhitelisted && email) {
        try {
          const whitelistDoc = await getDoc(doc(db, "whitelist", email.trim().toLowerCase()));
          if (whitelistDoc.exists()) {
            isWhitelisted = true;
          }
        } catch (err) {
          console.warn("Google login cloud whitelist fallback failed:", err);
        }
      }

      if (!isWhitelisted) {
        setAuthError(`The email "${email || ''}" is not authorized for ResiTrend. Please contact the administrator.`);
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        // Fallback to a preview guest
        const localSession = localStorage.getItem("pulse_simulated_user");
        if (localSession) {
          const sim = JSON.parse(localSession);
          setUser(sim.user);
          setProfile(sim.profile);
          setIsAdmin(sim.isAdmin);
        } else {
          bypassAuth("resident", "Dr. Rohan Mehta", "Junior Resident (Y2)");
        }
        return;
      }
      setIsFirebaseActive(true);
      setUser(result.user);
    } catch (error: any) {
      console.error("Google login failed. Using local session bypass active.", error);
      // If user dismissed popup, show safe fail message instead of hard crash
      setAuthError("Google authentication flow was cancelled or unable to complete.");
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseActive) {
        await signOut(auth);
      }
    } catch (err) {
      console.log(err);
    }
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    localStorage.removeItem("pulse_simulated_user");
  };

  const bypassAuth = (role: "resident" | "admin", name: string = "Dr. Rohan Mehta", year: ResidentYear = "Junior Resident (Y2)") => {
    let mockUid = role === "admin" ? "seed_founder_admin" : "seed_rohan";
    if (name === "Dr. Aahan Shah") mockUid = "seed_aahan";
    else if (name === "Dr. Priya Nair") mockUid = "seed_priya";

    const mockUser = {
      uid: mockUid,
      email: role === "admin" ? "aahanshah2580@gmail.com" : `${name.toLowerCase().replace(/[^a-z]/g, "")}@resitrend.org`,
      displayName: name,
      emailVerified: true
    } as FirebaseUser;

    let existingProf = profiles.find(p => p.uid === mockUid);
    if (!existingProf) {
      existingProf = {
        uid: mockUid,
        displayName: name,
        bio: `${year} dedicated to pioneering corneal diagnostics and surgical skill curation.`,
        year,
        academicXp: 120,
        teachingXp: 80,
        innovationXp: 90,
        recognitionXp: 110,
        totalXp: 400,
        reputationLevel: ReputationLevel.RESPECTED,
        endorsementCounts: {
          "Clinical Skills": 4,
          "Surgical Skills": 5,
          "Teaching": 3,
          "Research": 6,
          "Leadership": 4,
          "Teamwork": 8,
          "Communication": 10,
          "Innovation": 7
        },
        profileCompletionScore: 70,
        silentApplauseCount: 4,
        updatedAt: new Date().toISOString()
      };
    }

    setUser(mockUser);
    setProfile(existingProf);
    setIsAdmin(role === "admin" || mockUser.email === "aahanshah2580@gmail.com");

    const sessionState = {
      user: {
        uid: mockUid,
        email: mockUser.email,
        displayName: name,
        emailVerified: true
      },
      profile: existingProf,
      isAdmin: role === "admin" || mockUser.email === "aahanshah2580@gmail.com"
    };
    localStorage.setItem("pulse_simulated_user", JSON.stringify(sessionState));
    
    // Add dynamically to profiles if not present
    setProfiles(prev => {
      if (prev.some(p => p.uid === mockUid)) return prev;
      return [existingProf!, ...prev];
    });
  };

  // LOGICAL DATABASE ACTIONS:
  const addAchievement = async (title: string, category: AchievementCategory, date: string, proofUrl?: string) => {
    if (!profile) return;
    const newId = `ach_${Date.now()}`;
    const newAch: Achievement = {
      id: newId,
      userId: profile.uid,
      displayName: profile.displayName,
      title,
      category,
      date,
      proofUrl: proofUrl || "",
      status: "self-declared",
      validations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await executeDataAction(
      (p, a, e, r, i, n) => ({
        profiles: p,
        achievements: [newAch, ...a]
      }),
      async () => {
        try {
          await setDoc(doc(db, "achievements", newId), newAch);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `achievements/${newId}`);
        }
      }
    );
  };

  const addEndorsement = async (toUserId: string, category: any) => {
    if (!profile || profile.uid === toUserId) return;

    // Limit check: max 3 per day, max 30 per month
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const mySentEndorsements = endorsements.filter(e => e.fromUserId === profile.uid);
    const sentToday = mySentEndorsements.filter(e => {
      const createdAtTime = new Date(e.createdAt).getTime();
      return createdAtTime >= startOfDay;
    }).length;

    const sentThisMonth = mySentEndorsements.filter(e => {
      const createdAtTime = new Date(e.createdAt).getTime();
      return createdAtTime >= startOfMonth;
    }).length;

    if (sentToday >= 3) {
      throw new Error(`Daily limit reached: High-engagement gamification rules cap peer endorsements at 3 per day. (${sentToday}/3 sent today)`);
    }

    if (sentThisMonth >= 30) {
      throw new Error(`Monthly limit reached: Gamification safety limits cap peer endorsements at 30 per month. (${sentThisMonth}/30 sent this month)`);
    }

    const newId = `end_${Date.now()}`;
    const newEnd: Endorsement = {
      id: newId,
      fromUserId: profile.uid,
      fromName: profile.displayName,
      toUserId,
      category,
      createdAt: new Date().toISOString()
    };

    await executeDataAction(
      (p, a, e, r, i, n) => {
        const targetProf = p.find(x => x.uid === toUserId);
        return {
          profiles: targetProf ? p : p, // profiles array triggers recalculation automatically
          endorsements: [newEnd, ...e]
        };
      },
      async () => {
        try {
          await setDoc(doc(db, "endorsements", newId), newEnd);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `endorsements/${newId}`);
        }
        try {
          // Direct increment on target public stats profiles
          const profileRef = doc(db, "profiles", toUserId);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            await updateDoc(profileRef, {
              [`endorsementCounts.${category}`]: increment(1),
              updatedAt: new Date().toISOString()
            });
          } else {
            // Seed profile doesn't exist in Firestore yet. Look it up from local state and save it!
            const seedProf = profiles.find(p => p.uid === toUserId);
            if (seedProf) {
              const newCounts = { ...seedProf.endorsementCounts };
              newCounts[category as keyof typeof seedProf.endorsementCounts] = (newCounts[category as keyof typeof seedProf.endorsementCounts] || 0) + 1;
              const fullProf: Profile = {
                ...seedProf,
                endorsementCounts: newCounts,
                updatedAt: new Date().toISOString()
              };
              await setDoc(profileRef, fullProf);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `profiles/${toUserId}`);
        }
      }
    );
  };

  const addSilentApplause = async (toUserId: string, category: RecognitionCategory, message: string) => {
    if (!profile || profile.uid === toUserId) return;
    
    // Limit check: max 2 per day, max 30 per month
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const mySentRecognitions = recognitions.filter(r => r.fromUserId === profile.uid);
    const sentToday = mySentRecognitions.filter(r => {
      const createdAtTime = new Date(r.createdAt).getTime();
      return createdAtTime >= startOfDay;
    }).length;

    const sentThisMonth = mySentRecognitions.filter(r => {
      const createdAtTime = new Date(r.createdAt).getTime();
      return createdAtTime >= startOfMonth;
    }).length;

    if (sentToday >= 2) {
      throw new Error(`Daily limit reached: High-engagement gamification rules cap anonymous appreciations at 2 per day to maintain professional credibility. (${sentToday}/2 sent today)`);
    }

    if (sentThisMonth >= 30) {
      throw new Error(`Monthly limit reached: Gamification safety limits cap anonymous appreciations at 30 per month. (${sentThisMonth}/30 sent this month)`);
    }

    // Prevent duplicate voting anonymously using a monthly compound hash
    const date = new Date();
    const currentMonthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const fromUserIdHash = `hash_${profile.uid.substring(0, 5)}_${toUserId.substring(0, 5)}_${category.substring(0, 4)}_${currentMonthKey}`;

    if (recognitions.some(r => r.fromUserIdHash === fromUserIdHash)) {
      throw new Error("Duplicate check active: You have already appreciated this resident for this skill block this month!");
    }

    const newId = `rec_${Date.now()}`;
    const newRec: Recognition = {
      id: newId,
      fromUserIdHash,
      toUserId,
      message,
      category,
      createdAt: new Date().toISOString(),
      fromUserId: profile.uid // Secure mapping for XP attribution and limit checking
    };

    await executeDataAction(
      (p, a, e, r, i, n) => ({
        profiles: p,
        recognitions: [newRec, ...r]
      }),
      async () => {
        try {
          await setDoc(doc(db, "recognitions", newId), newRec);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `recognitions/${newId}`);
        }
        try {
          const profileRef = doc(db, "profiles", toUserId);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            await updateDoc(profileRef, {
              silentApplauseCount: increment(1),
              updatedAt: new Date().toISOString()
            });
          } else {
            const seedProf = profiles.find(p => p.uid === toUserId);
            if (seedProf) {
              const fullProf: Profile = {
                ...seedProf,
                silentApplauseCount: (seedProf.silentApplauseCount || 0) + 1,
                updatedAt: new Date().toISOString()
              };
              await setDoc(profileRef, fullProf);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `profiles/${toUserId}`);
        }
      }
    );
  };

  const addInnovation = async (title: string, problem: string, solution: string, impact: string) => {
    if (!profile) return;
    const newId = `inn_${Date.now()}`;
    const newInn: InnovationIdea = {
      id: newId,
      userId: profile.uid,
      displayName: profile.displayName,
      title,
      problem,
      proposedSolution: solution,
      expectedImpact: impact,
      status: "Submitted",
      upvotesCount: 1,
      upvotedBy: [profile.uid],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await executeDataAction(
      (p, a, e, r, i, n) => ({
        profiles: p,
        innovations: [newInn, ...i]
      }),
      async () => {
        try {
          await setDoc(doc(db, "innovationIdeas", newId), newInn);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `innovationIdeas/${newId}`);
        }
      }
    );
  };

  const upvoteInnovation = async (ideaId: string) => {
    if (!profile) return;

    await executeDataAction(
      (p, a, e, r, i, n) => {
        const item = i.find(x => x.id === ideaId);
        if (!item) return { profiles: p };

        const upvoted = item.upvotedBy.includes(profile.uid);
        const upvotedBy = upvoted 
          ? item.upvotedBy.filter(x => x !== profile.uid)
          : [...item.upvotedBy, profile.uid];
        const upvotesCount = upvotedBy.length;

        const updatedInns = i.map(x => x.id === ideaId ? { ...x, upvotedBy, upvotesCount, updatedAt: new Date().toISOString() } : x);
        return {
          profiles: p,
          innovations: updatedInns
        };
      },
      async () => {
        const item = innovations.find(x => x.id === ideaId);
        if (!item) return;
        const upvoted = item.upvotedBy.includes(profile.uid);
        const actionPayload = upvoted 
          ? { upvotesCount: increment(-1), upvotedBy: item.upvotedBy.filter(x => x !== profile.uid) }
          : { upvotesCount: increment(1), upvotedBy: arrayUnion(profile.uid) };

        try {
          const docRef = doc(db, "innovationIdeas", ideaId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            await updateDoc(docRef, {
              ...actionPayload,
              updatedAt: new Date().toISOString()
            });
          } else {
            // Seed innovation idea doesn't exist in Firestore yet. Look it up from local and write it!
            const seedInn = innovations.find(x => x.id === ideaId);
            if (seedInn) {
              const fullInn: InnovationIdea = {
                ...seedInn,
                upvotedBy: upvoted 
                  ? seedInn.upvotedBy.filter(x => x !== profile.uid) 
                  : [...seedInn.upvotedBy, profile.uid],
                upvotesCount: upvoted ? seedInn.upvotesCount - 1 : seedInn.upvotesCount + 1,
                updatedAt: new Date().toISOString()
              };
              await setDoc(docRef, fullInn);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `innovationIdeas/${ideaId}`);
        }
      }
    );
  };

  const addComment = async (ideaId: string, text: string) => {
    if (!profile) return;
    
    // Check daily and monthly comment limit: max 3 per day, max 30 per month
    const myCommentsSent = JSON.parse(localStorage.getItem(`pulse_comments_sent_${profile.uid}`) || "[]");
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const commentsToday = myCommentsSent.filter((c: any) => new Date(c.createdAt).getTime() >= startOfDay).length;
    const commentsThisMonth = myCommentsSent.filter((c: any) => new Date(c.createdAt).getTime() >= startOfMonth).length;

    if (commentsToday >= 3) {
      throw new Error(`Daily limit reached: High-engagement gamification rules cap comments on ideas at 3 per day. (${commentsToday}/3 sent today)`);
    }

    if (commentsThisMonth >= 30) {
      throw new Error(`Monthly limit reached: Gamification safety limits cap comments on ideas at 30 per month. (${commentsThisMonth}/30 sent this month)`);
    }

    // We update the local comments count and structure
    await executeDataAction(
      (p, a, e, r, i, n) => {
        const updatedInns = i.map(x => x.id === ideaId ? { ...x, commentsCount: (x.commentsCount || 0) + 1, updatedAt: new Date().toISOString() } : x);
        
        // Save comment to helper local structures
        const commentsList = JSON.parse(localStorage.getItem(`pulse_comments_${ideaId}`) || "[]");
        const newCommId = `comm_${Date.now()}`;
        const newComm = {
          id: newCommId,
          ideaId,
          userId: profile.uid,
          displayName: profile.displayName,
          text,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`pulse_comments_${ideaId}`, JSON.stringify([newComm, ...commentsList]));

        // Log this comment action for XP tracking
        myCommentsSent.push({ id: newCommId, ideaId, createdAt: new Date().toISOString() });
        localStorage.setItem(`pulse_comments_sent_${profile.uid}`, JSON.stringify(myCommentsSent));

        return {
          profiles: p,
          innovations: updatedInns
        };
      },
      async () => {
        try {
          // Increment count on cloud idea doc
          const docRef = doc(db, "innovationIdeas", ideaId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            await updateDoc(docRef, {
              commentsCount: increment(1),
              updatedAt: new Date().toISOString()
            });
          } else {
            // Seed innovation idea doesn't exist in Firestore yet. Load it from local and write it!
            const seedInn = innovations.find(x => x.id === ideaId);
            if (seedInn) {
              const fullInn: InnovationIdea = {
                ...seedInn,
                commentsCount: (seedInn.commentsCount || 0) + 1,
                updatedAt: new Date().toISOString()
              };
              await setDoc(docRef, fullInn);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `innovationIdeas/${ideaId}`);
          return;
        }

        try {
          // Write detail comment doc to a subcollection (safe write fallback)
          const colRef = collection(db, "innovationIdeas", ideaId, "comments");
          const commentId = `comm_${Date.now()}`;
          await setDoc(doc(colRef, commentId), {
            id: commentId,
            ideaId,
            userId: profile.uid,
            displayName: profile.displayName,
            text,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `innovationIdeas/${ideaId}/comments`);
        }
      }
    );
  };

  const addAnnouncement = async (title: string, content: string, category: AnnouncementCategory) => {
    if (!profile || !isAdmin) return;
    const newId = `ann_${Date.now()}`;
    const newAnn: Announcement = {
      id: newId,
      title,
      content,
      category,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      authorId: profile.uid,
      authorName: profile.displayName
    };

    await executeDataAction(
      (p, a, e, r, i, n) => ({
        profiles: p,
        announcements: [newAnn, ...n]
      }),
      async () => {
        try {
          await setDoc(doc(db, "announcements", newId), newAnn);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `announcements/${newId}`);
        }
      }
    );
  };

  // Community validates the achievements! (Validation incrementer)
  const validateAchievement = async (achievementId: string) => {
    if (!profile) return;

    await executeDataAction(
      (p, a, e, r, i, n) => {
        const ach = a.find(x => x.id === achievementId);
        if (!ach || ach.userId === profile.uid || ach.validations.includes(profile.uid)) return { profiles: p };

        const validations = [...ach.validations, profile.uid];
        // Automatic upgrade to 'community-validated' if validations >= 2
        let status = ach.status;
        if (status === "self-declared" && validations.length >= 2) {
          status = "community-validated";
        }

        const updatedAchs = a.map(x => x.id === achievementId ? { ...x, validations, status, updatedAt: new Date().toISOString() } : x);
        return {
          profiles: p,
          achievements: updatedAchs
        };
      },
      async () => {
        const ach = achievements.find(x => x.id === achievementId);
        if (!ach) return;
        const validations = [...ach.validations, profile.uid];
        let status = ach.status;
        if (status === "self-declared" && validations.length >= 2) {
          status = "community-validated";
        }
        try {
          const docRef = doc(db, "achievements", achievementId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            await updateDoc(docRef, {
              validations: arrayUnion(profile.uid),
              status,
              updatedAt: new Date().toISOString()
            });
          } else {
            // Document doesn't exist in Firestore (e.g., it is a local seed item). Write it as a full document!
            const fullAch: Achievement = {
              ...ach,
              validations: [...ach.validations, profile.uid],
              status,
              updatedAt: new Date().toISOString()
            };
            await setDoc(docRef, fullAch);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `achievements/${achievementId}`);
        }
      }
    );
  };

  // Administrator confirms the authentic achievements! (Verification lock)
  const verifyAchievementAdmin = async (achievementId: string) => {
    if (!isAdmin) return;

    await executeDataAction(
      (p, a, e, r, i, n) => {
        const updatedAchs = a.map(x => x.id === achievementId ? { ...x, status: "admin-verified" as const, verifiedBy: profile?.uid, updatedAt: new Date().toISOString() } : x);
        return {
          profiles: p,
          achievements: updatedAchs
        };
      },
      async () => {
        const ach = achievements.find(x => x.id === achievementId);
        if (!ach) return;
        try {
          const docRef = doc(db, "achievements", achievementId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            await updateDoc(docRef, {
              status: "admin-verified",
              verifiedBy: profile?.uid,
              updatedAt: new Date().toISOString()
            });
          } else {
            // Document doesn't exist in Firestore (e.g., it is a local seed item). Write it as a full document!
            const fullAch: Achievement = {
              ...ach,
              status: "admin-verified",
              verifiedBy: profile?.uid,
              updatedAt: new Date().toISOString()
            };
            await setDoc(docRef, fullAch);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `achievements/${achievementId}`);
        }
      }
    );
  };

  const updateInnovationStatus = async (ideaId: string, status: InnovationStatus) => {
    if (!isAdmin) return;

    await executeDataAction(
      (p, a, e, r, i, n) => {
        const updatedInns = i.map(x => x.id === ideaId ? { ...x, status, updatedAt: new Date().toISOString() } : x);
        return {
          profiles: p,
          innovations: updatedInns
        };
      },
      async () => {
        try {
          const docRef = doc(db, "innovationIdeas", ideaId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            await updateDoc(docRef, {
              status,
              updatedAt: new Date().toISOString()
            });
          } else {
            const seedInn = innovations.find(x => x.id === ideaId);
            if (seedInn) {
              const fullInn: InnovationIdea = {
                ...seedInn,
                status,
                updatedAt: new Date().toISOString()
              };
              await setDoc(docRef, fullInn);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `innovationIdeas/${ideaId}`);
        }
      }
    );
  };

  const updateProfileLinks = async (links: { googleScholar?: string; orcid?: string; linkedIn?: string; researchGate?: string }) => {
    if (!profile) return;

    await executeDataAction(
      (p, a, e, r, i, n) => {
        const updatedSelf = { ...profile, ...links, updatedAt: new Date().toISOString() };
        const updatedProfs = p.map(x => x.uid === profile.uid ? updatedSelf : x);
        return {
          profiles: updatedProfs
        };
      },
      async () => {
        try {
          await updateDoc(doc(db, "profiles", profile.uid), {
            ...links,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `profiles/${profile.uid}`);
        }
      }
    );
  };

  const updateProfileBio = async (bio: string, year: ResidentYear) => {
    if (!profile) return;

    await executeDataAction(
      (p, a, e, r, i, n) => {
        const updatedSelf = { ...profile, bio, year, updatedAt: new Date().toISOString() };
        const updatedProfs = p.map(x => x.uid === profile.uid ? updatedSelf : x);
        return {
          profiles: updatedProfs
        };
      },
      async () => {
        try {
          await updateDoc(doc(db, "profiles", profile.uid), {
            bio,
            year,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `profiles/${profile.uid}`);
        }
      }
    );
  };

  const updateProfilePhoto = async (photoUrl: string) => {
    if (!profile) return;

    await executeDataAction(
      (p, a, e, r, i, n) => {
        const updatedSelf = { ...profile, photoUrl, updatedAt: new Date().toISOString() };
        const updatedProfs = p.map(x => x.uid === profile.uid ? updatedSelf : x);
        return {
          profiles: updatedProfs
        };
      },
      async () => {
        try {
          await updateDoc(doc(db, "profiles", profile.uid), {
            photoUrl,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `profiles/${profile.uid}`);
        }
      }
    );
  };

  const exportProfileToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!profile) {
      return { success: false, message: "No active profile session found to export." };
    }
    if (!isFirebaseActive) {
      return { success: false, message: "Google Database authentication is not active. Please sign in with Google first." };
    }

    try {
      const profileRef = doc(db, "profiles", profile.uid);
      const profileSnap = await getDoc(profileRef);

      // Re-evaluate the latest statistics to ensure high fidelity
      const latestSelf = calculateReputationAndScore(profile, achievements, endorsements, recognitions, innovations);

      if (!profileSnap.exists()) {
        // Enforce Firestore Create rules limit (totalXp: 0, silentApplauseCount: 0)
        const initialProf: Profile = {
          ...latestSelf,
          totalXp: 0,
          academicXp: 0,
          teachingXp: 0,
          innovationXp: 0,
          recognitionXp: 0,
          silentApplauseCount: 0,
          reputationLevel: ReputationLevel.EMERGING,
          profileCompletionScore: 30,
          updatedAt: new Date().toISOString()
        };
        await setDoc(profileRef, initialProf);
      }

      // Perform atomic updates with the real, aggregated stats cache
      await updateDoc(profileRef, {
        displayName: latestSelf.displayName,
        bio: latestSelf.bio,
        year: latestSelf.year,
        googleScholar: latestSelf.googleScholar || "",
        orcid: latestSelf.orcid || "",
        linkedIn: latestSelf.linkedIn || "",
        researchGate: latestSelf.researchGate || "",
        academicXp: latestSelf.academicXp,
        teachingXp: latestSelf.teachingXp,
        innovationXp: latestSelf.innovationXp,
        recognitionXp: latestSelf.recognitionXp,
        totalXp: latestSelf.totalXp,
        reputationLevel: latestSelf.reputationLevel,
        endorsementCounts: latestSelf.endorsementCounts,
        profileCompletionScore: latestSelf.profileCompletionScore,
        silentApplauseCount: latestSelf.silentApplauseCount,
        photoUrl: latestSelf.photoUrl || "",
        updatedAt: new Date().toISOString()
      });

      // Synchronize the logged-in resident's achievements
      const myAchievements = achievements.filter(a => a.userId === profile.uid);
      for (const ach of myAchievements) {
        await setDoc(doc(db, "achievements", ach.id), ach);
      }

      // Synchronize the logged-in resident's innovation designs
      const myInnovations = innovations.filter(i => i.userId === profile.uid);
      for (const inn of myInnovations) {
        await setDoc(doc(db, "innovationIdeas", inn.id), {
          ...inn,
          userId: profile.uid,
          displayName: profile.displayName
        });
      }

      setProfile(latestSelf);
      setProfiles(prev => [latestSelf, ...prev.filter(p => p.uid !== latestSelf.uid)]);

      return {
        success: true,
        message: "Cloud Sync Successful! All profile metrics, validation achievements, and innovation proposals are now securely preserved."
      };
    } catch (error) {
      console.error("Cloud export failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Synchronization transaction rejected by cloud security assertions."
      };
    }
  };

  const syncHardcodedWhitelistToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: "Administrator role required." };
    }
    if (!isFirebaseActive) {
      return { success: false, message: "Google Database authentication is not active. Please sign in with Google first." };
    }
    try {
      for (const entry of WHITELIST_EMAILS) {
        const docRef = doc(db, "whitelist", entry.email.trim().toLowerCase());
        await setDoc(docRef, {
          email: entry.email.trim().toLowerCase(),
          name: entry.name,
          createdAt: new Date().toISOString()
        });
      }
      return {
        success: true,
        message: `Successfully synchronized ${WHITELIST_EMAILS.length} whitelisted users directly into Firestore security registry!`
      };
    } catch (error) {
      console.error("Whitelist sync failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Sync transaction rejected by database rules."
      };
    }
  };

  const addNewWhitelistEmail = async (email: string, name: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: "Administrator role required." };
    }
    if (!isFirebaseActive) {
      return { success: false, message: "Google Database authentication is not active. Please sign in with Google first." };
    }
    if (!email.trim() || !name.trim()) {
      return { success: false, message: "Email and name are required." };
    }
    try {
      const emailRef = doc(db, "whitelist", email.trim().toLowerCase());
      await setDoc(emailRef, {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        createdAt: new Date().toISOString()
      });
      return {
        success: true,
        message: `Successfully whitelisted "${name}" (${email.trim().toLowerCase()}) in Firestore cloud security registry!`
      };
    } catch (error) {
      console.error("Add whitelist entry failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Security rules rejected whitelist creation."
      };
    }
  };

  const fetchCloudWhitelist = async (): Promise<WhitelistEntry[]> => {
    if (!isFirebaseActive) {
      return [];
    }
    try {
      const colSnap = await getDocs(collection(db, "whitelist"));
      const list: WhitelistEntry[] = [];
      colSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.email && data.name) {
          list.push({
            email: data.email,
            name: data.name
          });
        }
      });
      return list;
    } catch (error) {
      console.warn("Could not load cloud whitelist:", error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isFirebaseActive,
        loginWithGoogle,
        logout,
        authError,
        clearAuthError,
        bypassAuth,
        profiles,
        achievements,
        endorsements,
        recognitions,
        innovations,
        announcements,
        addAchievement,
        addEndorsement,
        addSilentApplause,
        addInnovation,
        upvoteInnovation,
        addComment,
        addAnnouncement,
        validateAchievement,
        verifyAchievementAdmin,
        updateInnovationStatus,
        updateProfileLinks,
        updateProfileBio,
        updateProfilePhoto,
        exportProfileToCloud,
        syncHardcodedWhitelistToCloud,
        addNewWhitelistEmail,
        fetchCloudWhitelist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
