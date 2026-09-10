import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding JOBSTREAM database...");

  // 1. Create Default User & Profile
  const user = await prisma.user.upsert({
    where: { email: "alex@jobstream.io" },
    update: {},
    create: {
      email: "alex@jobstream.io",
      name: "Alex Chen",
      role: "user",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      experienceLevel: "1-2",
      skills: JSON.stringify(["React", "TypeScript", "Next.js", "Python", "Tailwind CSS", "Node.js", "PostgreSQL"]),
      preferredLocations: JSON.stringify(["Remote", "Bangalore", "Gurgaon"]),
      preferredWorkModes: JSON.stringify(["REMOTE", "HYBRID"]),
      preferredJobTypes: JSON.stringify(["FULL_TIME", "INTERNSHIP"]),
      minSalary: 1800000,
      preferredRoles: JSON.stringify(["Frontend Developer", "Full Stack Engineer", "AI Intern"]),
      education: "B.Tech in Computer Science",
      bio: "Passionate full-stack developer focusing on modern web apps, high-throughput APIs, and AI integrations.",
    },
  });

  // 2. Create Sources
  const sourcesData = [
    {
      id: "demo-stream",
      name: "Demo Stream Engine",
      type: "DEMO",
      endpoint: "internal://stream-simulator",
      status: "HEALTHY",
    },
    {
      id: "weworkremotely-rss",
      name: "WeWorkRemotely RSS",
      type: "RSS",
      endpoint: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
      status: "HEALTHY",
    },
    {
      id: "remoteok-api",
      name: "RemoteOK Public API",
      type: "API",
      endpoint: "https://remoteok.com/api",
      status: "HEALTHY",
    },
    {
      id: "hacker-news-hiring",
      name: "Hacker News: Who is Hiring?",
      type: "API",
      endpoint: "https://hn.algolia.com/api/v1/search_by_date?tags=comment,author_whoishiring",
      status: "HEALTHY",
    },
  ];

  for (const s of sourcesData) {
    await prisma.jobSource.upsert({
      where: { name: s.name },
      update: { status: s.status },
      create: {
        id: s.id,
        name: s.name,
        type: s.type,
        endpoint: s.endpoint,
        status: s.status,
        lastSyncAt: new Date(),
      },
    });
  }

  console.log("Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
