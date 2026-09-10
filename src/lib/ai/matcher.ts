import { JobItem, UserSearchProfile } from "../types";

export interface MatchEvaluation {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

export function evaluateJobMatch(job: Partial<JobItem>, profile: Partial<UserSearchProfile>): MatchEvaluation {
  if (!profile || !profile.skills || profile.skills.length === 0) {
    // Default fallback baseline match if profile is uninitialized
    return {
      score: 75,
      matchedSkills: (job.skills || []).slice(0, 2),
      missingSkills: [],
      reasons: ["General software engineering alignment"],
    };
  }

  let totalScore = 0;
  const reasons: string[] = [];

  // 1. Skill evaluation (50 points maximum)
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
  const profileSkills = (profile.skills || []).map((s) => s.toLowerCase());

  const matchedSkillsRaw = (job.skills || []).filter((s) =>
    profileSkills.includes(s.toLowerCase())
  );
  const missingSkillsRaw = (job.skills || []).filter(
    (s) => !profileSkills.includes(s.toLowerCase())
  );

  if (jobSkills.length > 0) {
    const ratio = matchedSkillsRaw.length / Math.min(jobSkills.length, 5);
    const skillScore = Math.min(50, Math.round(ratio * 50));
    totalScore += skillScore;
    if (matchedSkillsRaw.length > 0) {
      reasons.push(`Strong overlap with your skills: ${matchedSkillsRaw.slice(0, 3).join(", ")}`);
    }
  } else {
    totalScore += 30;
  }

  // 2. Work Mode evaluation (20 points)
  const preferredModes = profile.preferredWorkModes || ["REMOTE"];
  if (job.workMode && preferredModes.includes(job.workMode)) {
    totalScore += 20;
    reasons.push(`${job.workMode} matches your preferred work mode`);
  } else if (job.workMode === "REMOTE") {
    totalScore += 18;
    reasons.push("Fully Remote aligns well with flexible location preferences");
  } else {
    totalScore += 5;
  }

  // 3. Experience level evaluation (20 points)
  if (profile.experienceLevel && job.experienceLevel) {
    if (profile.experienceLevel === job.experienceLevel) {
      totalScore += 20;
      reasons.push(`Experience level (${job.experienceLevel} years) matches your target`);
    } else {
      totalScore += 12;
    }
  } else {
    totalScore += 15;
  }

  // 4. Location match (10 points)
  const userLocations = (profile.preferredLocations || []).map((l) => l.toLowerCase());
  const jobLoc = (job.location || "").toLowerCase();
  const locationMatches = userLocations.some(
    (loc) => jobLoc.includes(loc) || loc.includes("remote") && jobLoc.includes("remote")
  );

  if (locationMatches) {
    totalScore += 10;
    reasons.push(`Location (${job.location}) aligns with your preferred zones`);
  } else {
    totalScore += 4;
  }

  const finalScore = Math.min(99, Math.max(45, totalScore));

  return {
    score: finalScore,
    matchedSkills: matchedSkillsRaw,
    missingSkills: missingSkillsRaw.slice(0, 3),
    reasons: reasons.length > 0 ? reasons : ["Compatible tech stack and role profile"],
  };
}
