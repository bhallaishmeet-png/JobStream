import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatSalary } from "@/lib/utils";
import { formatRelativeTime, calculateFreshness } from "@/lib/freshness";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Home, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  CheckCircle2,
  Ban
} from "lucide-react";

export default async function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const job = await db.job.findUnique({
    where: { id: params.id },
    include: {
      canonicalJob: {
        include: { sources: true },
      },
      sourceRecords: true,
    },
  });

  if (!job) {
    notFound();
  }

  const freshness = calculateFreshness(job.postedAt);
  const salaryDisplay = formatSalary(
    job.minSalary,
    job.maxSalary,
    job.salaryCurrency,
    job.salaryPeriod
  );

  const skills: string[] = JSON.parse(job.skills || "[]");
  const responsibilities: string[] = JSON.parse(job.responsibilities || "[]");
  const requirements: string[] = JSON.parse(job.requirements || "[]");
  const benefits: string[] = JSON.parse(job.benefits || "[]");

  const sourcesList = (job.canonicalJob?.sources || []).map((s) => ({
    name: s.sourceName,
    url: s.originalUrl,
  }));

  if (sourcesList.length === 0) {
    sourcesList.push({
      name: job.sourceName,
      url: job.canonicalUrl,
    });
  }

  const isClosed = job.status !== "ACTIVE";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-emerald-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Job Feed</span>
      </Link>

      {/* Closed Banner */}
      {isClosed && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold">
          <Ban className="w-4 h-4 text-rose-400" />
          <span>This job has just closed and was removed from your results.</span>
        </div>
      )}

      {/* Main Job Card */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-bold font-mono text-zinc-100">{job.title}</h1>
              {job.isDemo && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                  DEMO DATA
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="text-zinc-200 font-semibold text-sm">{job.companyName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {job.location}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-mono font-medium">{salaryDisplay}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg border font-mono text-xs font-bold ${freshness.badgeColor} ${freshness.textColor}`}>
              Freshness {freshness.score}
            </div>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400">
          <div>Discovered: {formatRelativeTime(job.discoveredAt)}</div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Active Feed</span>
          </div>
        </div>

        {/* Canonical Sources */}
        {sourcesList.length > 0 && (
          <div className="my-5 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-2">
              <Layers className="w-4 h-4" />
              <span>Discovered on {sourcesList.length} distinct source(s)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sourcesList.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs transition-colors"
                >
                  <span>{src.name}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {job.aiSummary && (
          <div className="my-6 p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Job Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{job.aiSummary}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="my-6">
            <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="my-6">
          <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold mb-2">Role Overview</h3>
          <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-900/20 p-4 rounded-xl border border-zinc-800/60">
            {job.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-zinc-800 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium"
          >
            Explore More Jobs
          </Link>

          {isClosed ? (
            <button
              disabled
              className="px-6 py-2.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs font-bold cursor-not-allowed"
            >
              This job is no longer available
            </button>
          ) : (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-sm transition-all"
            >
              <span>Apply Directly on {job.sourceName}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}