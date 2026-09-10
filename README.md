# ⚡ JOBSTREAM — The Internet’s Live Job Feed

> **"Don't search for jobs. Let the jobs find you."**

JOBSTREAM is a real-time job discovery and canonical aggregation platform designed like a financial intelligence terminal meets Linear and modern AI search. Instead of manually checking fragmented job boards, JOBSTREAM continuously discovers opportunities from authorized public RSS feeds, official developer APIs, and verified company endpoints, presenting them in one unified, live feed with dynamic freshness decay, AI match scoring, and multi-source canonical deduplication.

---

## 🔐 Environment Variables

The project uses environment variables for database connections, application URLs, and optional AI model providers.

### Setup Instructions

1. **Copy the example configuration file:**
   - **Bash (Linux/macOS):**
     ```bash
     cp .env.example .env.local
     ```
   - **PowerShell (Windows):**
     ```powershell
     Copy-Item .env.example .env.local
     ```

2. **Configure your values:**
   Open `.env.local` and set your desired database connection:
   - For local development, the default SQLite configuration works out-of-the-box:
     ```env
     DATABASE_URL="file:./dev.db"
     ```
   - For PostgreSQL/Supabase production:
     ```env
     DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require"
     ```

3. **Security Hygiene Rules:**
   - **Never commit `.env`, `.env.local`, or any `*.env` files to git.** (Enforced via `.gitignore`).
   - **Never share API keys or production database credentials publicly.**
   - Only non-sensitive variables intended for browser access are prefixed with `NEXT_PUBLIC_`.

---

## 🚀 Key Highlights

1. **Real-Time Live Feed Engine**:
   - Dynamic countdown ticker (`🟢 LIVE • Last updated 14s ago • Next update in 46s`).
   - Incremental 60-second polling and feed diffing: detects newly discovered jobs, status closures, and listing updates without reloading the page.
   - Non-intrusive floating update notification pill: `⚡ X new jobs found • 🔴 Y jobs closed • ♻️ Z jobs updated` with smooth prepend.

2. **Dynamic Freshness Decay System**:
   - Discovered `< 1 min` ago: `🔥 99` (Just now)
   - Discovered `< 5 min` ago: `🔥 96` (Xm ago)
   - Discovered `< 30 min` ago: `🟡 85`
   - Discovered `< 3 hours` ago: `🟡 65`
   - Discovered `< 24 hours` ago: `⚪ 50`
   - Discovered `< 7 days` ago: `⚪ 30`
   - Real-time relative timers that tick dynamically every 10 seconds.

3. **Closed Job Detection**:
   - Position lifecycle tracking: `ACTIVE`, `CLOSED`, `EXPIRED`, `REMOVED`.
   - When a job is confirmed closed, it is automatically removed from active feeds.
   - If a user is viewing a job when it closes: the Apply button is immediately disabled and a warning banner appears:
     `🔴 This job has just closed and was removed from your results.`

4. **Canonical Cross-Source Deduplication**:
   - Composite signature normalizer (`normalized_company::normalized_title::normalized_location`).
   - Clusters listings across sources into a single canonical record with an audit badge: `Found on X sources` (e.g. Company Careers Direct + Demo Stream + WeWorkRemotely).

5. **AI Matching & Profiling Layer**:
   - Personalized match percentage (`🤖 96% Match`) with green pulse glow.
   - Breakdown checklist of matched skills (`✓ React`, `✓ TypeScript`), missing skills (`⚠ Docker preferred`), and match rationale.
   - Pluggable AI architecture: native heuristic NLP parser by default + extensible cloud LLM adapter.

6. **Modular Source Adapter Architecture**:
   - Strictly compliant data sourcing: **no CAPTCHA bypasses, anti-bot evading, or terms-of-service violations**.
   - Standardized `JobSourceAdapter` interface with:
     - `WeWorkRemotelyAdapter`: Authorized public RSS feed.
     - `RemoteOkAdapter`: Official public developer JSON API.
     - `HackerNewsHiringAdapter`: Algolia / Firebase public hiring API.
     - `DemoStreamAdapter`: High-fidelity simulator for top tech hubs (Bangalore, Gurgaon, Noida, Remote, Hyderabad, Mumbai) badged `[DEMO DATA]`.

7. **Telemetry & Admin Health Operations**:
   - Source Health status monitoring: `🟢 Healthy`, `🟡 Delayed`, `🔴 Error`.
   - Real-time counters for jobs discovered today and in the past hour.
   - Interactive buttons: **"Sync All Sources Now"** and **"Simulate Live Event"** (immediately injects a fresh listing and closes an older position to demonstrate live feed reactions).

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, clsx, tailwind-merge.
- **Backend & Service Layer**: Next.js API Routes, Prisma ORM, Ingestion Pipeline, Deduplication Engine, AI Matcher.
- **Database**:
  - Development: SQLite (zero-config, zero-dependency out-of-the-box local execution).
  - Production: PostgreSQL ready (`prisma/schema.postgresql.sql` with B-Tree & GIN indexes, tsvector full-text search).

---

## 💻 Getting Started Locally

```bash
# Navigate to the project directory
cd C:\Users\Hp\.gemini\antigravity\scratch\jobstream

# Setup local environment variables
# Windows PowerShell:
Copy-Item .env.example .env.local
# or Bash:
# cp .env.example .env.local

# Install dependencies
npm install

# Push Prisma database schema
npx prisma db push

# Seed with initial tech jobs and test profile
node prisma/seed.js

# Start the application in development mode
npm run dev

# Or run optimized production build
npx next build
npx next start -p 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Page Sitemap

- **`/`**: Live Job Feed with Hero Search, real-time countdown, filter panel, and job drawer.
- **`/jobs/[id]`**: Standalone canonical job view with cross-source audit links.
- **`/explore`**: Tech market intelligence, top hiring companies, and high-velocity stacks.
- **`/saved`**: Saved & applied jobs tracker (Saved, Applied, Interview, Rejected, Offer).
- **`/alerts`**: Real-time opportunity watcher and notification criteria manager.
- **`/dashboard`**: Logged-in user telemetry (Matching jobs, hourly discoveries, applications).
- **`/admin`**: Source health monitor, crawl logs, and interactive event simulator.
- **`/profile`**: User search preferences and tech skills manager.