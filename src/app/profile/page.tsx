"use client";

import { useState, useEffect } from "react";
import { User, Sparkles, MapPin, Briefcase, DollarSign, Save, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [name, setName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex@jobstream.io");
  const [skills, setSkills] = useState("React, TypeScript, Next.js, Python, Tailwind CSS, Node.js, PostgreSQL");
  const [locations, setLocations] = useState("Remote, Bangalore, Gurgaon");
  const [experienceLevel, setExperienceLevel] = useState("1-2");
  const [workModes, setWorkModes] = useState<string[]>(["REMOTE", "HYBRID"]);
  const [jobTypes, setJobTypes] = useState<string[]>(["FULL_TIME", "INTERNSHIP"]);
  const [minSalary, setMinSalary] = useState(1800000);
  const [preferredRoles, setPreferredRoles] = useState("Frontend Developer, Full Stack Engineer, AI Intern");
  const [education, setEducation] = useState("B.Tech in Computer Science");
  const [bio, setBio] = useState("Passionate full-stack developer focusing on modern web apps, high-throughput APIs, and AI systems.");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name);
          setEmail(data.user.email);
        }
        if (data.profile) {
          const p = data.profile;
          setExperienceLevel(p.experienceLevel || "1-2");
          setSkills(p.skills?.join(", ") || "");
          setLocations(p.preferredLocations?.join(", ") || "");
          setWorkModes(p.preferredWorkModes || ["REMOTE", "HYBRID"]);
          setJobTypes(p.preferredJobTypes || ["FULL_TIME"]);
          setMinSalary(p.minSalary || 1800000);
          setPreferredRoles(p.preferredRoles?.join(", ") || "");
          setEducation(p.education || "");
          setBio(p.bio || "");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const locationsArray = locations.split(",").map((s) => s.trim()).filter(Boolean);
      const rolesArray = preferredRoles.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          skills: skillsArray,
          preferredLocations: locationsArray,
          preferredWorkModes: workModes,
          preferredJobTypes: jobTypes,
          experienceLevel,
          minSalary: Number(minSalary),
          preferredRoles: rolesArray,
          education,
          bio,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWorkMode = (mode: string) => {
    setWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <User className="w-6 h-6 text-emerald-400" />
        <h1 className="text-2xl font-bold font-mono text-zinc-100">Job Search & AI Matching Profile</h1>
      </div>
      <p className="text-xs text-zinc-400 mb-8">
        JOBSTREAM uses these preferences to calculate real-time match percentages (e.g. 96% Match) and filter your live discovery stream.
      </p>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile updated! AI matching algorithms will reflect your new preferences across the live feed.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs text-zinc-300">
        {/* Basic Info */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider mb-2">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-zinc-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block font-mono text-zinc-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-zinc-400 mb-1">Bio / Headline</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100"
              placeholder="e.g. Senior Frontend Engineer specializing in Next.js and distributed UI"
            />
          </div>
        </div>

        {/* Skills & Experience */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider mb-2">
            Skills & Experience Level
          </h2>

          <div>
            <label className="block font-mono text-zinc-400 mb-1">
              Your Primary Tech Skills (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100"
              placeholder="React, TypeScript, Python, Go, PyTorch"
            />
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">
              Used directly by the AI matching engine to calculate skill overlap percentages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-zinc-400 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100"
              >
                <option value="FRESHER">Fresher / Graduate</option>
                <option value="0-1">0 to 1 years</option>
                <option value="1-2">1 to 2 years</option>
                <option value="2-3">2 to 3 years</option>
                <option value="3-5">3 to 5 years</option>
                <option value="5-10">5 to 10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-zinc-400 mb-1">Education</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100"
                placeholder="B.Tech Computer Science"
              />
            </div>
          </div>
        </div>

        {/* Location, Work Mode & Salary */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider mb-2">
            Target Locations & Preferences
          </h2>

          <div>
            <label className="block font-mono text-zinc-400 mb-1">
              Preferred Locations (comma separated)
            </label>
            <input
              type="text"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100"
              placeholder="Remote, Bangalore, Gurgaon"
            />
          </div>

          <div>
            <label className="block font-mono text-zinc-400 mb-2">Preferred Work Mode</label>
            <div className="flex gap-3">
              {["REMOTE", "HYBRID", "ON_SITE"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleWorkMode(mode)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs border transition-colors ${
                    workModes.includes(mode)
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-zinc-400 mb-1">Minimum Annual Salary Expectation (₹ INR)</label>
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving Preferences..." : "Save Job-Search Profile"}</span>
        </button>
      </form>
    </div>
  );
}