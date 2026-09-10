"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  User, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  Save, 
  CheckCircle2, 
  ArrowLeft, 
  Plus, 
  X, 
  Edit2, 
  Check, 
  SlidersHorizontal
} from "lucide-react";

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "Next.js", "Python", "Go", "Node.js", 
  "PostgreSQL", "Docker", "Kubernetes", "AWS", "GraphQL", "Redis", 
  "Tailwind CSS", "PyTorch", "SQL"
];

const PRESET_LOCATIONS = [
  "Remote", "Bangalore", "Gurgaon", "Noida", "Hyderabad", "Mumbai", "Pune", "Delhi", "Chennai"
];

const PRESET_INDUSTRIES = [
  "Fintech", "Developer Tools", "AI & Machine Learning", "E-Commerce", "SaaS & Cloud", "Logistics", "Healthcare Tech", "Consumer Internet"
];

const PRESET_ROLES = [
  "Full Stack Engineer", "Frontend Developer", "Backend Engineer", "AI/ML Engineer", "Product Manager", "DevOps Engineer", "Mobile Developer"
];

export default function ProfilePage() {
  // Personal Info
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex@jobstream.io");
  const [avatar, setAvatar] = useState("");
  const [headline, setHeadline] = useState("Senior Full Stack Engineer specializing in TypeScript, React & Distributed Systems");

  // Experience
  const [experienceLevel, setExperienceLevel] = useState("1-2");
  const [currentRole, setCurrentRole] = useState("Software Engineer II at Fintech Startup");
  const [industries, setIndustries] = useState<string[]>(["Fintech", "Developer Tools", "AI & Machine Learning"]);
  const [newIndustryInput, setNewIndustryInput] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>([
    "React", "TypeScript", "Next.js", "Python", "Tailwind CSS", "Node.js", "PostgreSQL"
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingSkillValue, setEditingSkillValue] = useState("");

  // Job Preferences
  const [preferredRoles, setPreferredRoles] = useState<string[]>([
    "Frontend Developer", "Full Stack Engineer", "AI Intern"
  ]);
  const [newRoleInput, setNewRoleInput] = useState("");

  const [locations, setLocations] = useState<string[]>(["Remote", "Bangalore", "Gurgaon"]);
  const [newLocationInput, setNewLocationInput] = useState("");

  const [workModes, setWorkModes] = useState<string[]>(["REMOTE", "HYBRID"]);
  const [jobTypes, setJobTypes] = useState<string[]>(["FULL_TIME", "INTERNSHIP"]);
  const [minSalary, setMinSalary] = useState(1800000);
  const [maxSalary, setMaxSalary] = useState(3600000);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load from API
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setAvatar(data.user.avatar || "");
        }
        if (data.profile) {
          const p = data.profile;
          setExperienceLevel(p.experienceLevel || "1-2");
          if (Array.isArray(p.skills) && p.skills.length > 0) setSkills(p.skills);
          if (Array.isArray(p.preferredLocations) && p.preferredLocations.length > 0) setLocations(p.preferredLocations);
          if (Array.isArray(p.preferredWorkModes) && p.preferredWorkModes.length > 0) setWorkModes(p.preferredWorkModes);
          if (Array.isArray(p.preferredJobTypes) && p.preferredJobTypes.length > 0) setJobTypes(p.preferredJobTypes);
          if (p.minSalary) setMinSalary(p.minSalary);
          if (Array.isArray(p.preferredRoles) && p.preferredRoles.length > 0) setPreferredRoles(p.preferredRoles);
          if (Array.isArray(p.preferredIndustries) && p.preferredIndustries.length > 0) setIndustries(p.preferredIndustries);
          if (p.bio) setHeadline(p.bio);
          if (p.education) setCurrentRole(p.education);
        }
      })
      .catch((err) => console.error("Error loading profile:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Save to API
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          avatar: avatar.trim(),
          skills,
          preferredLocations: locations,
          preferredWorkModes: workModes,
          preferredJobTypes: jobTypes,
          experienceLevel,
          minSalary: Number(minSalary) || 0,
          preferredRoles,
          preferredIndustries: industries,
          education: currentRole.trim(),
          bio: headline.trim(),
        }),
      });

      if (res.ok) {
        setSaveMessage("Profile saved successfully. Live job stream ranking updated.");
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage("Failed to save profile. Please check your connection.");
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Completeness Calculation
  const completeness = useMemo(() => {
    let score = 0;
    const checks = {
      name: Boolean(name.trim()),
      email: Boolean(email.trim()),
      headline: Boolean(headline.trim()),
      skills: skills.length >= 3,
      experience: Boolean(experienceLevel),
      currentRole: Boolean(currentRole.trim()),
      roles: preferredRoles.length >= 1,
      locations: locations.length >= 1,
      workModes: workModes.length >= 1,
      salary: minSalary > 0,
    };

    if (checks.name) score += 10;
    if (checks.email) score += 10;
    if (checks.headline) score += 15;
    if (checks.skills) score += 20;
    if (checks.experience) score += 10;
    if (checks.currentRole) score += 5;
    if (checks.roles) score += 10;
    if (checks.locations) score += 10;
    if (checks.workModes) score += 5;
    if (checks.salary) score += 5;

    return { score: Math.min(100, score), checks };
  }, [name, email, headline, skills, experienceLevel, currentRole, preferredRoles, locations, workModes, minSalary]);

  // Skill Handlers
  const handleAddSkill = (skillToAdd?: string) => {
    const target = (skillToAdd || newSkillInput).trim();
    if (!target) return;
    if (!skills.some((s) => s.toLowerCase() === target.toLowerCase())) {
      setSkills([...skills, target]);
    }
    if (!skillToAdd) setNewSkillInput("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
    if (editingSkillIndex === index) {
      setEditingSkillIndex(null);
    }
  };

  const startEditSkill = (index: number) => {
    setEditingSkillIndex(index);
    setEditingSkillValue(skills[index]);
  };

  const saveEditSkill = (index: number) => {
    const val = editingSkillValue.trim();
    if (val) {
      const updated = [...skills];
      updated[index] = val;
      setSkills(updated);
    }
    setEditingSkillIndex(null);
    setEditingSkillValue("");
  };

  // Location Handlers
  const handleAddLocation = (locToAdd?: string) => {
    const target = (locToAdd || newLocationInput).trim();
    if (!target) return;
    if (!locations.some((l) => l.toLowerCase() === target.toLowerCase())) {
      setLocations([...locations, target]);
    }
    if (!locToAdd) setNewLocationInput("");
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  // Preferred Roles Handlers
  const handleAddRole = (roleToAdd?: string) => {
    const target = (roleToAdd || newRoleInput).trim();
    if (!target) return;
    if (!preferredRoles.some((r) => r.toLowerCase() === target.toLowerCase())) {
      setPreferredRoles([...preferredRoles, target]);
    }
    if (!roleToAdd) setNewRoleInput("");
  };

  const handleRemoveRole = (index: number) => {
    setPreferredRoles(preferredRoles.filter((_, i) => i !== index));
  };

  // Industry Handlers
  const handleToggleIndustry = (ind: string) => {
    setIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const handleAddCustomIndustry = () => {
    const target = newIndustryInput.trim();
    if (!target) return;
    if (!industries.includes(target)) {
      setIndustries([...industries, target]);
    }
    setNewIndustryInput("");
  };

  // Work Mode & Job Type Toggles
  const toggleWorkMode = (mode: string) => {
    setWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const toggleJobType = (type: string) => {
    setJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Initials for avatar fallback
  const initials = useMemo(() => {
    if (!name.trim()) return "JS";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center font-mono text-xs text-zinc-500">
        Loading profile parameters...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Live Job Feed</span>
          </Link>
          <h1 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">Candidate Search Profile</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            Configure your professional identity, target preferences, and the parameters used by JobStream&apos;s real-time matching engine.
          </p>
        </div>

        {/* Header Save Button & Status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-zinc-950 font-semibold font-mono text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Save Success Notice */}
      {saveMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-zinc-900 border border-emerald-500/40 text-emerald-800 dark:text-emerald-400 font-mono text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{saveMessage}</span>
          </div>
          <button
            onClick={() => setSaveMessage(null)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Two-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Form (8 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          {/* Section 1: Personal Information */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Personal Information
              </h2>
            </div>

            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group">
                <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400 overflow-hidden shadow-inner">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={() => setAvatar("")}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-1">
                <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg (optional)"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-mono"
                />
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  placeholder="e.g. Alex Chen"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  placeholder="alex@jobstream.io"
                />
              </div>
            </div>

            {/* Short Professional Headline */}
            <div>
              <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1">
                Short Professional Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                placeholder="e.g. Senior Full Stack Engineer specializing in TypeScript, Next.js & Distributed Systems"
              />
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                A concise summary of your current professional focus.
              </p>
            </div>
          </div>

          {/* Section 2: Experience & Industry */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
              <Briefcase className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Experience & Background
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Total Years of Experience */}
              <div>
                <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1">
                  Total Years of Experience
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-mono"
                >
                  <option value="FRESHER">Fresher / Entry Level</option>
                  <option value="0-1">0 to 1 years</option>
                  <option value="1-2">1 to 2 years</option>
                  <option value="2-3">2 to 3 years</option>
                  <option value="3-5">3 to 5 years</option>
                  <option value="5-10">5 to 10 years</option>
                  <option value="10+">10+ years</option>
                </select>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  Used directly for the 20% experience matching weight.
                </p>
              </div>

              {/* Current / Previous Role */}
              <div>
                <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1">
                  Current or Previous Role
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                  placeholder="e.g. Software Engineer II at FinTech Startup"
                />
              </div>
            </div>

            {/* Target Industry Tags */}
            <div>
              <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-2">
                Target Industries
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_INDUSTRIES.map((ind) => {
                  const isSelected = industries.includes(ind);
                  return (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => handleToggleIndustry(ind)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        isSelected
                          ? "bg-cyan-500/15 border-cyan-500/60 text-cyan-700 dark:text-cyan-400 font-semibold"
                          : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      {ind}
                    </button>
                  );
                })}
              </div>

              {/* Custom Industry Input */}
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={newIndustryInput}
                  onChange={(e) => setNewIndustryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomIndustry();
                    }
                  }}
                  placeholder="Add custom industry..."
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddCustomIndustry}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Skills (Editable Tags) */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Technical Skills
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {skills.length} skills listed
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Skills carry the largest weight (50%) in JobStream&apos;s AI match scoring algorithm. Add, remove, or edit your stack below.
            </p>

            {/* Editable Skill Tags */}
            <div className="flex flex-wrap items-center gap-2 min-h-[44px] p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
              {skills.map((skill, index) => {
                const isEditing = editingSkillIndex === index;
                if (isEditing) {
                  return (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-emerald-500 text-xs font-mono text-zinc-900 dark:text-zinc-100 shadow-sm"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingSkillValue}
                        onChange={(e) => setEditingSkillValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEditSkill(index);
                          } else if (e.key === "Escape") {
                            setEditingSkillIndex(null);
                          }
                        }}
                        className="bg-transparent border-none outline-none text-xs font-mono text-zinc-900 dark:text-zinc-100 w-24"
                      />
                      <button
                        type="button"
                        onClick={() => saveEditSkill(index)}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 p-0.5"
                        title="Save edit"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSkillIndex(null)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <span
                    key={skill}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-xs font-mono text-zinc-800 dark:text-zinc-200 transition-colors shadow-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => startEditSkill(index)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-opacity p-0.5"
                      title="Edit skill"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-0.5"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}

              {skills.length === 0 && (
                <span className="text-xs text-zinc-500 font-mono italic">
                  No skills added yet. Type below or pick suggestions.
                </span>
              )}
            </div>

            {/* Add Skill Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a new skill (e.g. Docker, Rust, Kafka)..."
                className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 font-mono"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Suggested Skills Chips */}
            <div>
              <span className="block text-[11px] font-mono text-zinc-500 mb-1.5">
                Suggested skills to add:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter(
                  (s) => !skills.some((sk) => sk.toLowerCase() === s.toLowerCase())
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Job Preferences */}
          <div className="p-6 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
              <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h2 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Job & Work Preferences
              </h2>
            </div>

            {/* Preferred Job Titles */}
            <div>
              <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1.5">
                Preferred Job Titles
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                {preferredRoles.map((role, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 shadow-sm"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRole();
                    }
                  }}
                  placeholder="Add target job title..."
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => handleAddRole()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PRESET_ROLES.filter((r) => !preferredRoles.includes(r)).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleAddRole(r)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-sm"
                  >
                    + {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1.5">
                Target Geographic Locations
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                {locations.map((loc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 shadow-sm"
                  >
                    <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{loc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(idx)}
                      className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newLocationInput}
                  onChange={(e) => setNewLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLocation();
                    }
                  }}
                  placeholder="Add target location..."
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => handleAddLocation()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PRESET_LOCATIONS.filter((l) => !locations.includes(l)).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleAddLocation(l)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-sm"
                  >
                    + {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Mode Toggle Pills */}
            <div>
              <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-2">
                Work Mode Preferences (Multiple Allowed)
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "REMOTE", label: "Remote" },
                  { id: "HYBRID", label: "Hybrid" },
                  { id: "ON_SITE", label: "On-site" },
                ].map((mode) => {
                  const isSelected = workModes.includes(mode.id);
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => toggleWorkMode(mode.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs border transition-colors ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-700 dark:text-emerald-300 font-bold"
                          : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Employment Type */}
            <div>
              <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-2">
                Employment Types
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "FULL_TIME", label: "Full-time" },
                  { id: "PART_TIME", label: "Part-time" },
                  { id: "CONTRACT", label: "Contract" },
                  { id: "INTERNSHIP", label: "Internship" },
                  { id: "FREELANCE", label: "Freelance" },
                ].map((type) => {
                  const isSelected = jobTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleJobType(type.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors ${
                        isSelected
                          ? "bg-cyan-500/15 border-cyan-500/60 text-cyan-700 dark:text-cyan-300 font-semibold"
                          : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />}
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Salary Expectations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1">
                  Minimum Annual Salary (₹ INR)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                />
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ≈ {(minSalary / 100000).toFixed(0)} LPA
                </span>
              </div>

              <div>
                <label className="block font-mono text-xs text-zinc-700 dark:text-zinc-400 mb-1">
                  Target / Maximum Salary (₹ INR)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
                />
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ≈ {(maxSalary / 100000).toFixed(0)} LPA
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Changes take effect immediately across all matched positions.
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-zinc-950 font-semibold font-mono text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Sidebar & Intelligence (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Profile Completeness Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Profile Completeness
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {completeness.score}%
              </span>
            </div>

            {/* Solid Progress Bar (No Gradients) */}
            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${completeness.score}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${completeness.checks.name && completeness.checks.email ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-600"}`} />
                  <span>Personal info & headline</span>
                </span>
                <span className={completeness.checks.name && completeness.checks.email ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}>
                  {completeness.checks.name && completeness.checks.email ? "Complete" : "Missing"}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${completeness.checks.skills ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-600"}`} />
                  <span>Skills (3+ required)</span>
                </span>
                <span className={completeness.checks.skills ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}>
                  {skills.length} / 3
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${completeness.checks.experience ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-600"}`} />
                  <span>Experience level</span>
                </span>
                <span className={completeness.checks.experience ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}>
                  {completeness.checks.experience ? "Set" : "Not set"}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${completeness.checks.locations ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-600"}`} />
                  <span>Target locations</span>
                </span>
                <span className={completeness.checks.locations ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}>
                  {locations.length} selected
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${completeness.checks.workModes ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-600"}`} />
                  <span>Work mode preferences</span>
                </span>
                <span className={completeness.checks.workModes ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}>
                  {workModes.length} modes
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${completeness.checks.salary ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-600"}`} />
                  <span>Salary expectations</span>
                </span>
                <span className={completeness.checks.salary ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}>
                  {minSalary > 0 ? "Configured" : "None"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Job Matching Intelligence Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Job Matching Engine
              </h3>
            </div>

            <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold">
              Your profile helps JobStream rank relevant opportunities.
            </p>

            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Whenever newly discovered positions enter the live stream, our native NLP matching engine scores them against your criteria:
            </p>

            <div className="space-y-2.5 pt-1 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Skills</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">50% Weight</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal font-sans">
                  Direct overlap between required tech stack and your listed skills ({skills.slice(0, 3).join(", ")}...).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Work Mode</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">20% Weight</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal font-sans">
                  Prioritizes {workModes.map((m) => m.toLowerCase()).join(" and ")} roles matching your availability.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Experience</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">20% Weight</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal font-sans">
                  Matches roles in your target bracket ({experienceLevel} years).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Location</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">10% Weight</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal font-sans">
                  Matches preferred locations ({locations.slice(0, 2).join(", ")}).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Job Type</span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-bold">Feed Filter</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal font-sans">
                  Filters feed visibility by employment category ({jobTypes.map((t) => t.toLowerCase()).join(", ")}).
                </p>
              </div>
            </div>
          </div>

          {/* 3. Candidate Card Preview */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
              Candidate Preview
            </span>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm shadow-inner">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 truncate">{name}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{currentRole || headline}</p>
              </div>
            </div>

            <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 space-y-1 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                <span>{locations.join(" · ") || "Location flexible"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                <span>{experienceLevel} yrs experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
