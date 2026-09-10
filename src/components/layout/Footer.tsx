import { ShieldCheck, Cpu, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/60 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-300 font-mono font-medium">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>JOBSTREAM INTELLIGENCE ENGINE v1.0</span>
          </div>
          <p className="text-zinc-500 text-[11px] max-w-md">
            Continuously discovering jobs via authorized feeds, verified public career endpoints, and certified open source protocols. Zero scraping of restricted or bot-blocked systems.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>COMPLIANT DATA PIPELINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>CANONICAL DEDUPLICATION</span>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500">© 2026 JOBSTREAM Inc.</span>
        </div>
      </div>
    </footer>
  );
}