-- JOBSTREAM Production PostgreSQL Schema & Migration Script
-- Compatible with PostgreSQL 14+, Supabase, Neon, AWS RDS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) DEFAULT 'user',
    "avatar" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles
CREATE TABLE IF NOT EXISTS "UserProfile" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "preferredLocations" JSONB DEFAULT '[]'::jsonb,
    "preferredWorkModes" JSONB DEFAULT '[]'::jsonb,
    "experienceLevel" VARCHAR(50) DEFAULT '0-2',
    "skills" JSONB DEFAULT '[]'::jsonb,
    "preferredJobTypes" JSONB DEFAULT '[]'::jsonb,
    "minSalary" INTEGER,
    "preferredIndustries" JSONB DEFAULT '[]'::jsonb,
    "preferredRoles" JSONB DEFAULT '[]'::jsonb,
    "education" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies
CREATE TABLE IF NOT EXISTS "Company" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255),
    "logoUrl" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "website" TEXT,
    "location" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Sources
CREATE TABLE IF NOT EXISTS "JobSource" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "type" VARCHAR(50) NOT NULL, -- 'RSS', 'API', 'DEMO'
    "endpoint" TEXT,
    "isEnabled" BOOLEAN DEFAULT true,
    "status" VARCHAR(50) DEFAULT 'HEALTHY', -- 'HEALTHY', 'DELAYED', 'ERROR'
    "lastSyncAt" TIMESTAMP WITH TIME ZONE,
    "errorCount" INTEGER DEFAULT 0,
    "lastErrorMessage" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Canonical Jobs (Deduplicated Cross-Source)
CREATE TABLE IF NOT EXISTS "CanonicalJob" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "normalizedKey" VARCHAR(512) UNIQUE NOT NULL,
    "totalSources" INTEGER DEFAULT 1,
    "primaryJobId" UUID,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Feed
CREATE TABLE IF NOT EXISTS "Job" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "canonicalJobId" UUID REFERENCES "CanonicalJob"("id") ON DELETE SET NULL,
    "companyId" UUID REFERENCES "Company"("id") ON DELETE SET NULL,
    "sourceId" UUID REFERENCES "JobSource"("id") ON DELETE SET NULL,
    "title" VARCHAR(255) NOT NULL,
    "normalizedTitle" VARCHAR(255) NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "workMode" VARCHAR(50) DEFAULT 'REMOTE', -- 'REMOTE', 'HYBRID', 'ON_SITE'
    "experienceLevel" VARCHAR(50) DEFAULT '0-1',
    "jobType" VARCHAR(50) DEFAULT 'FULL_TIME',
    "minSalary" INTEGER,
    "maxSalary" INTEGER,
    "salaryCurrency" VARCHAR(10) DEFAULT 'INR',
    "salaryPeriod" VARCHAR(20) DEFAULT 'YEAR',
    "description" TEXT NOT NULL,
    "responsibilities" JSONB DEFAULT '[]'::jsonb,
    "requirements" JSONB DEFAULT '[]'::jsonb,
    "benefits" JSONB DEFAULT '[]'::jsonb,
    "skills" JSONB DEFAULT '[]'::jsonb,
    "status" VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSED', 'EXPIRED', 'REMOVED'
    "sourceName" VARCHAR(255) NOT NULL,
    "sourceJobId" VARCHAR(255),
    "canonicalUrl" TEXT NOT NULL,
    "applyUrl" TEXT NOT NULL,
    "isDemo" BOOLEAN DEFAULT false,
    "discoveredAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "postedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "freshnessScore" INTEGER DEFAULT 99,
    "aiSummary" TEXT,
    -- Full-text search tsvector column
    "searchVector" tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce("title", '') || ' ' || coalesce("companyName", '') || ' ' || coalesce("location", '') || ' ' || coalesce("description", ''))
    ) STORED
);

-- Job Source Records (Multi-source audit)
CREATE TABLE IF NOT EXISTS "JobSourceRecord" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "canonicalJobId" UUID REFERENCES "CanonicalJob"("id") ON DELETE CASCADE,
    "jobId" UUID REFERENCES "Job"("id") ON DELETE CASCADE,
    "sourceId" UUID REFERENCES "JobSource"("id") ON DELETE SET NULL,
    "sourceName" VARCHAR(255) NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "rawData" TEXT,
    "firstSeenAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Status History
CREATE TABLE IF NOT EXISTS "JobStatusHistory" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "jobId" UUID NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE,
    "previousStatus" VARCHAR(50) NOT NULL,
    "newStatus" VARCHAR(50) NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved Jobs
CREATE TABLE IF NOT EXISTS "SavedJob" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "jobId" UUID NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE,
    "status" VARCHAR(50) DEFAULT 'SAVED', -- 'SAVED', 'APPLIED', 'INTERVIEW', 'REJECTED', 'OFFER'
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "jobId")
);

-- Job Alerts
CREATE TABLE IF NOT EXISTS "JobAlert" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "query" TEXT,
    "filters" JSONB DEFAULT '{}'::jsonb,
    "frequency" VARCHAR(50) DEFAULT 'REALTIME',
    "emailNotification" BOOLEAN DEFAULT true,
    "browserNotification" BOOLEAN DEFAULT true,
    "isEnabled" BOOLEAN DEFAULT true,
    "lastTriggeredAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crawl Runs
CREATE TABLE IF NOT EXISTS "CrawlRun" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sourceId" UUID NOT NULL REFERENCES "JobSource"("id") ON DELETE CASCADE,
    "startedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "status" VARCHAR(50) DEFAULT 'RUNNING',
    "jobsDiscovered" INTEGER DEFAULT 0,
    "jobsUpdated" INTEGER DEFAULT 0,
    "jobsClosed" INTEGER DEFAULT 0,
    "errorMessage" TEXT
);

-- Indexes for lightning fast live querying
CREATE INDEX IF NOT EXISTS "idx_jobs_status" ON "Job"("status");
CREATE INDEX IF NOT EXISTS "idx_jobs_postedAt" ON "Job"("postedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_jobs_discoveredAt" ON "Job"("discoveredAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_jobs_location" ON "Job"("location");
CREATE INDEX IF NOT EXISTS "idx_jobs_workMode" ON "Job"("workMode");
CREATE INDEX IF NOT EXISTS "idx_jobs_jobType" ON "Job"("jobType");
CREATE INDEX IF NOT EXISTS "idx_jobs_experienceLevel" ON "Job"("experienceLevel");
CREATE INDEX IF NOT EXISTS "idx_jobs_freshnessScore" ON "Job"("freshnessScore" DESC);
CREATE INDEX IF NOT EXISTS "idx_jobs_searchVector" ON "Job" USING GIN("searchVector");
CREATE INDEX IF NOT EXISTS "idx_canonical_normalizedKey" ON "CanonicalJob"("normalizedKey");
