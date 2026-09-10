export interface RawDiscoveredJob {
  sourceJobId: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  workMode?: "REMOTE" | "HYBRID" | "ON_SITE";
  experienceLevel?: "FRESHER" | "0-1" | "1-2" | "2-3" | "3-5" | "5-10" | "10+";
  jobType?: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE";
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  canonicalUrl: string;
  applyUrl: string;
  postedAt: Date;
  isDemo?: boolean;
}

export interface JobSourceAdapter {
  id: string;
  name: string;
  type: "RSS" | "API" | "DEMO";
  endpoint?: string;
  fetchJobs(): Promise<RawDiscoveredJob[]>;
  checkJobStatus(sourceJobId: string, canonicalUrl: string): Promise<"ACTIVE" | "CLOSED" | "EXPIRED" | "UNKNOWN">;
}
