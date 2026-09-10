import { db } from "../db";
import { generateCanonicalKey } from "../utils";

export interface DeduplicationResult {
  canonicalJobId: string;
  isNewCanonical: boolean;
  totalSources: number;
}

export async function processCanonicalJob(
  companyName: string,
  title: string,
  location: string,
  jobId: string,
  sourceId: string,
  sourceName: string,
  canonicalUrl: string,
  rawData?: any
): Promise<DeduplicationResult> {
  const normalizedKey = generateCanonicalKey(companyName, title, location);

  // Check if canonical entry already exists
  let canonical = await db.canonicalJob.findUnique({
    where: { normalizedKey },
    include: { sources: true },
  });

  if (!canonical) {
    // Create new canonical cluster
    canonical = await db.canonicalJob.create({
      data: {
        title,
        companyName,
        normalizedKey,
        totalSources: 1,
        primaryJobId: jobId,
      },
      include: { sources: true },
    });

    // Create source audit record
    await db.jobSourceRecord.create({
      data: {
        canonicalJobId: canonical.id,
        jobId,
        sourceId,
        sourceName,
        originalUrl: canonicalUrl,
        rawData: rawData ? JSON.stringify(rawData) : null,
      },
    });

    return {
      canonicalJobId: canonical.id,
      isNewCanonical: true,
      totalSources: 1,
    };
  } else {
    // Canonical already exists! Record this new source occurrence
    const existingSourceRecord = canonical.sources.find(
      (s) => s.sourceName === sourceName || s.originalUrl === canonicalUrl
    );

    if (!existingSourceRecord) {
      await db.jobSourceRecord.create({
        data: {
          canonicalJobId: canonical.id,
          jobId,
          sourceId,
          sourceName,
          originalUrl: canonicalUrl,
          rawData: rawData ? JSON.stringify(rawData) : null,
        },
      });

      const updatedCount = canonical.sources.length + 1;
      await db.canonicalJob.update({
        where: { id: canonical.id },
        data: { totalSources: updatedCount },
      });

      return {
        canonicalJobId: canonical.id,
        isNewCanonical: false,
        totalSources: updatedCount,
      };
    }

    return {
      canonicalJobId: canonical.id,
      isNewCanonical: false,
      totalSources: canonical.totalSources,
    };
  }
}
