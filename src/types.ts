export enum ReputationLevel {
  EMERGING = "Emerging",
  ESTABLISHED = "Established",
  RESPECTED = "Respected",
  INFLUENTIAL = "Influential",
  EXCEPTIONAL = "Exceptional"
}

export type ResidentYear = 
  | "Junior Resident (Y1)"
  | "Junior Resident (Y2)"
  | "Junior Resident (Y3)"
  | "Senior Resident (Y4)"
  | "Senior Resident (Y5)"
  | "Senior Resident (Y6)";

export interface UserAccount {
  uid: string;
  email: string;
  role: "resident" | "admin";
  emailVerified: boolean;
  createdAt: string;
}

export interface Profile {
  uid: string;
  displayName: string;
  bio: string;
  year: ResidentYear;
  googleScholar?: string;
  orcid?: string;
  linkedIn?: string;
  researchGate?: string;
  // XP metrics
  academicXp: number;
  teachingXp: number;
  innovationXp: number;
  recognitionXp: number;
  totalXp: number;
  reputationLevel: ReputationLevel;
  // skill endorsements totals
  endorsementCounts: {
    "Clinical Skills": number;
    "Surgical Skills": number;
    "Teaching": number;
    "Research": number;
    "Leadership": number;
    "Teamwork": number;
    "Communication": number;
    "Innovation": number;
  };
  profileCompletionScore: number;
  silentApplauseCount: number;
  photoUrl?: string;
  updatedAt: string;
}

export type AchievementCategory =
  | "Academic Achievement"
  | "Award"
  | "Certification"
  | "Fellowship"
  | "Conference Presentation"
  | "Publication"
  | "Research Project"
  | "Teaching Contribution"
  | "Innovation Contribution";

export type AchievementStatus = "self-declared" | "community-validated" | "admin-verified";

export interface Achievement {
  id: string;
  userId: string;
  displayName: string;
  title: string;
  category: AchievementCategory;
  date: string;
  proofUrl?: string;
  status: AchievementStatus;
  verifiedBy?: string; // admin user id if applicable
  validations: string[]; // List of user IDs who validated this
  createdAt: string;
  updatedAt: string;
}

export interface Endorsement {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  category:
    | "Clinical Skills"
    | "Surgical Skills"
    | "Teaching"
    | "Research"
    | "Leadership"
    | "Teamwork"
    | "Communication"
    | "Innovation";
  createdAt: string;
}

export type RecognitionCategory =
  | "Teaching help"
  | "Emergency support"
  | "Research assistance"
  | "Clinical teamwork"
  | "Leadership";

export interface Recognition {
  id: string;
  fromUserIdHash: string; // Composite unique key or anonymous hash to prevent duplicate voting
  toUserId: string;
  message: string;
  category: RecognitionCategory;
  createdAt: string;
}

export type InnovationStatus = "Submitted" | "Community Review" | "Under Consideration" | "Approved" | "Implemented";

export interface InnovationIdea {
  id: string;
  userId: string;
  displayName: string;
  title: string;
  problem: string;
  proposedSolution: string;
  expectedImpact: string;
  status: InnovationStatus;
  upvotesCount: number;
  upvotedBy: string[]; // User IDs who upvoted
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ideaId: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: string;
}

export type AnnouncementCategory = "Academic Events" | "Grand Rounds" | "Workshops" | "Conferences" | "Deadlines";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  date: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

export interface XpLog {
  id: string;
  userId: string;
  category: "Academic" | "Teaching" | "Innovation" | "Recognition";
  amount: number;
  reason: string;
  createdAt: string;
}

export interface AnalyticsReport {
  userCount: number;
  engagementTrend: { date: string; activeCount: number }[];
  recognitionCount: number;
  innovationCount: number;
  categoriesBreakdown: { [key: string]: number };
}
