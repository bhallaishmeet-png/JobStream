export type WorkMode = "REMOTE" | "HYBRID" | "ON_SITE";
export type ExperienceLevel = "FRESHER" | "0-1" | "1-2" | "2-3" | "3-5" | "5-10" | "10+";
export type JobType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE";
export type JobStatus = "ACTIVE" | "CLOSED" | "EXPIRED" | "REMOVED";
export type SourceStatus = "HEALTHY" | "DELAYED" | "ERROR";
export type SavedStatus = "SAVED" | "APPLIED" | "INTERVIEW" | "REJECTED" | "OFFER";

export interface JobItem {
  id: string;
  canonicalJobId?: string | null;
  companyId?: string | null;
  sourceId?: string | null;
  title: string;
  normalizedTitle: string;
  companyName: string;
  companyLogo?: string | null;
  location: string;
  city?: string | null;
  country?: string | null;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  jobType: JobType;
  minSalary?: number | null;
  maxSalary?: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  status: JobStatus;
  sourceName: string;
  sourceJobId?: string | null;
  canonicalUrl: string;
  applyUrl: string;
  isDemo: boolean;
  discoveredAt: string;
  postedAt: string;
  lastCheckedAt: string;
  lastUpdatedAt: string;
  freshnessScore: number;
  aiSummary?: string | null;
  matchScore?: number;
  matchReasons?: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  totalSources?: number;
  sourcesList?: {
    sourceName: string;
    originalUrl: string;
    firstSeenAt: string;
  }[];
}

export interface UserSearchProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  preferredLocations: string[];
  preferredWorkModes: WorkMode[];
  experienceLevel: ExperienceLevel;
  skills: string[];
  preferredJobTypes: JobType[];
  minSalary?: number;
  preferredIndustries: string[];
  preferredRoles: string[];
  education?: string;
  bio?: string;
}

export interface JobFilterState {
  searchQuery: string;
  locations: string[];
  experienceLevels: string[];
  workModes: string[];
  jobTypes: string[];
  minSalary?: number;
  maxSalary?: number;
  postedWithin?: string; // "5m" | "15m" | "30m" | "1h" | "3h" | "24h" | "7d"
  skills: string[];
  company?: string;
  source?: string;
  sortBy: "newest" | "best_match" | "highest_salary" | "lowest_exp" | "relevance";
  page: number;
  limit: number;
}

export interface LiveDiffResponse {
  timestamp: string;
  newJobs: JobItem[];
  closedJobIds: string[];
  updatedJobs: JobItem[];
  totalActiveCount: number;
  discoveredLastHour: number;
  activeSourcesCount: number;
}

export interface SourceHealthItem {
  id: string;
  name: string;
  type: string;
  endpoint?: string | null;
  isEnabled: boolean;
  status: SourceStatus;
  lastSyncAt: string | null;
  errorCount: number;
  lastErrorMessage: string | null;
  jobCount: number;
  jobsDiscoveredToday: number;
}

export interface AlertItem {
  id: string;
  name: string;
  query?: string | null;
  filters: {
    locations?: string[];
    experienceLevels?: string[];
    jobTypes?: string[];
    workModes?: string[];
    skills?: string[];
  };
  frequency: string;
  emailNotification: boolean;
  browserNotification: boolean;
  isEnabled: boolean;
  lastTriggeredAt?: string | null;
  createdAt: string;
}
