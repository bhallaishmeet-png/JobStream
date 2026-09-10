const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding JOBSTREAM database...");

  // 1. Create Default User
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
  const sources = [
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

  for (const s of sources) {
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

  // 3. Create realistic initial jobs across Bangalore, Gurgaon, Noida, Remote
  const initialJobs = [
    {
      companyName: "Razorpay",
      title: "Senior Frontend Engineer (Design Systems)",
      location: "Bangalore, India",
      workMode: "HYBRID",
      experienceLevel: "3-5",
      jobType: "FULL_TIME",
      minSalary: 2800000,
      maxSalary: 4200000,
      salaryCurrency: "INR",
      skills: ["React", "TypeScript", "Design Systems", "Web Performance", "Tailwind CSS"],
      description: "Join the Razorpay core checkout UI team building lightning-fast payment experiences for 50M+ users across India. You will architect accessible design systems, micro-frontends, and high-conversion payment widgets.",
      responsibilities: ["Own core Razorpay Checkout UI libraries and Blade design system", "Optimize bundle size and FCP to sub-500ms on 3G", "Collaborate with product designers on payment compliance UI"],
      requirements: ["4+ years production experience in React & TypeScript", "Deep understanding of browser performance and DOM profiling", "Experience creating shared npm component packages"],
      benefits: ["Comprehensive medical insurance", "ESOP opportunities", "₹75,000 annual learning stipend", "Catered lunch at Bangalore HQ"],
      offsetMin: 2,
    },
    {
      companyName: "Zerodha",
      title: "Go / Systems Software Engineer",
      location: "Bangalore, India",
      workMode: "ON_SITE",
      experienceLevel: "2-3",
      jobType: "FULL_TIME",
      minSalary: 2400000,
      maxSalary: 3600000,
      salaryCurrency: "INR",
      skills: ["Go", "PostgreSQL", "Redis", "Distributed Systems", "Kafka", "Linux"],
      description: "Zerodha processes 15%+ of all Indian stock trading retail volume. We build lean, self-hosted, high-throughput financial systems using Go, Python, and PostgreSQL without enterprise bloat.",
      responsibilities: ["Build high-concurrency order routing and streaming tick data pipelines", "Optimize low-latency PostgreSQL queries and in-memory caches", "Write zero-dependency, robust microservices handling peak market spikes"],
      requirements: ["2+ years experience building concurrent systems in Go or C/C++", "Solid foundation in Linux networking, IPC, and database internals", "Passion for simplicity and minimal external dependencies"],
      benefits: ["Generous profit-sharing bonus", "Ergonomic hardware setup", "Breakfast and snacks provided", "Flat hierarchy"],
      offsetMin: 6,
    },
    {
      companyName: "Swiggy",
      title: "AI / ML Engineer (Delivery Logistics)",
      location: "Bangalore, India",
      workMode: "HYBRID",
      experienceLevel: "2-3",
      jobType: "FULL_TIME",
      minSalary: 2500000,
      maxSalary: 3800000,
      salaryCurrency: "INR",
      skills: ["Python", "Machine Learning", "PyTorch", "FastAPI", "Docker"],
      description: "Swiggy powers millions of hyperlocal grocery and food orders every day. Help build dynamic pricing, routing optimization, and real-time delivery partner allocation models.",
      responsibilities: ["Train spatial-temporal deep learning models for minute-level ETA forecasting", "Implement multi-objective optimization algorithms for batching orders", "Monitor real-time model drift and conduct A/B testing on dispatch algorithms"],
      requirements: ["2-4 years applying ML to production supply chain or logistics", "Strong Python, PyTorch, and feature store experience (Feast/Redis)", "Degree in Computer Science, Operations Research, or related field"],
      benefits: ["Comprehensive health coverage", "Flexible work schedule", "Swiggy One membership", "Home office allowance"],
      offsetMin: 14,
    },
    {
      companyName: "CRED",
      title: "Backend Engineer (Payments & Core Banking)",
      location: "Bangalore, India",
      workMode: "ON_SITE",
      experienceLevel: "3-5",
      jobType: "FULL_TIME",
      minSalary: 3500000,
      maxSalary: 5000000,
      salaryCurrency: "INR",
      skills: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Microservices", "Fintech"],
      description: "CRED is building the financial ecosystem for India's high-trust creditworthy community. Architect double-entry ledger systems, instant UPI integrations, and fraud-resistant billing.",
      responsibilities: ["Architect ledger systems with strict idempotency and zero reconciliation discrepancies", "Build low-latency payment rails interfacing directly with NPCI and partner banks", "Lead cross-functional architecture reviews with security teams"],
      requirements: ["4+ years building high-volume distributed backend systems in Java/Kotlin/Go", "Demonstrated experience with event-driven architecture (Kafka) and transaction semantics", "Prior fintech, payment gateway, or banking core experience is a big plus"],
      benefits: ["Industry-leading compensation & ESOPs", "Premium health cover for family", "Gym & wellness allowances", "State-of-the-art office in Indiranagar"],
      offsetMin: 22,
    },
    {
      companyName: "Postman",
      title: "Full Stack Developer (API Client)",
      location: "Remote · India",
      workMode: "REMOTE",
      experienceLevel: "1-2",
      jobType: "FULL_TIME",
      minSalary: 1800000,
      maxSalary: 2600000,
      salaryCurrency: "INR",
      skills: ["React", "Node.js", "TypeScript", "Electron", "REST", "GraphQL"],
      description: "Postman is used by over 30 million developers around the world to build, test, and collaborate on APIs. Work on the core desktop and web client.",
      responsibilities: ["Build intuitive UI workflows for API collections, environment switching, and mock servers", "Contribute to offline-first synchronization protocols across desktop and cloud", "Diagnose client memory leaks and optimize Monaco editor integrations"],
      requirements: ["1-3 years of modern web application development (React/Node/TypeScript)", "Strong grasp of HTTP specs, REST, WebSockets, and gRPC", "Excitement for developer tooling and empathetic UX"],
      benefits: ["Fully remote across India", "Annual home workspace setup fund", "Unlimited PTO policy", "Wellness reimbursement"],
      offsetMin: 35,
    },
    {
      companyName: "Zomato / Blinkit",
      title: "Frontend Intern (Quick Commerce UI)",
      location: "Gurgaon, India",
      workMode: "ON_SITE",
      experienceLevel: "FRESHER",
      jobType: "INTERNSHIP",
      minSalary: 40000,
      maxSalary: 60000,
      salaryCurrency: "INR",
      salaryPeriod: "MONTH",
      skills: ["React", "JavaScript", "CSS", "Tailwind CSS", "Mobile Web"],
      description: "Blinkit delivers groceries in 10 minutes. Join the high-velocity consumer web and PWA team to craft ultra-responsive search and basket experiences.",
      responsibilities: ["Implement smooth micro-interactions for cart recommendations and instant checkout", "Assist in testing responsiveness across low-end Android devices and diverse screen sizes", "Write clean, modular React components with TypeScript and Tailwind"],
      requirements: ["Final year student or recent graduate in Computer Science or related branch", "Strong JavaScript / TypeScript fundamentals and React project portfolio", "Eager to learn high-scale web engineering in a fast-paced environment"],
      benefits: ["₹50,000/month stipend", "Opportunity for full-time PPO", "Zomato Gold membership", "Free office meals"],
      offsetMin: 45,
    },
    {
      companyName: "DeepCompute Labs",
      title: "AI Research Engineer (LLM Fine-Tuning)",
      location: "Hyderabad, India",
      workMode: "REMOTE",
      experienceLevel: "1-2",
      jobType: "FULL_TIME",
      minSalary: 2000000,
      maxSalary: 3000000,
      salaryCurrency: "INR",
      skills: ["Python", "PyTorch", "LLMs", "LoRA", "Hugging Face", "vLLM"],
      description: "We are an applied AI lab developing domain-specific generative models for legal and compliance workflows. Looking for passionate builders to fine-tune open weights models.",
      responsibilities: ["Implement parameter-efficient fine-tuning (LoRA, QLoRA) on Llama 3 and Mistral architectures", "Build high-throughput inference serving pipelines using vLLM and TensorRT-LLM", "Curate synthetic evaluation benchmarks and alignment reward models"],
      requirements: ["1-2 years experience working with transformer architectures and PyTorch", "Hands-on experience fine-tuning LLMs with Hugging Face transformers and PEFT", "Proficient in GPU memory optimization and distributed training"],
      benefits: ["Dedicated H100 GPU cluster access", "Remote-first culture", "Conference travel sponsorship", "Health cover"],
      offsetMin: 55,
    },
    {
      companyName: "Stripe",
      title: "Software Engineer (Global Payouts)",
      location: "Remote · India",
      workMode: "REMOTE",
      experienceLevel: "2-3",
      jobType: "FULL_TIME",
      minSalary: 3800000,
      maxSalary: 5500000,
      salaryCurrency: "INR",
      skills: ["Ruby", "Go", "Distributed Systems", "SQL", "Fintech", "API Design"],
      description: "Stripe builds economic infrastructure for the internet. The Payouts team moves tens of billions of dollars every month to businesses globally.",
      responsibilities: ["Integrate with global banking rails and local clearing houses", "Write resilient, idempotent payment dispatching logic with automated reconciliation", "Collaborate with distributed engineering teams across North America, Europe, and APAC"],
      requirements: ["2+ years experience in backend software engineering with high reliability standards", "Strong data modeling and SQL expertise (PostgreSQL/MySQL)", "Strong communication skills for asynchronous, remote-first collaboration"],
      benefits: ["World-class health and dental insurance", "Competitive equity grant", "Generous remote workspace stipend", "Flexible paid time off"],
      offsetMin: 90,
    }
  ];

  const demoSource = await prisma.jobSource.findUnique({ where: { name: "Demo Stream Engine" } });

  const now = new Date();

  for (const j of initialJobs) {
    const postedAt = new Date(now.getTime() - j.offsetMin * 60 * 1000);
    const sourceJobId = `seed-${j.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${j.offsetMin}`;
    const canonicalUrl = `https://careers.${j.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com/jobs/${sourceJobId}`;

    const normKey = `${j.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}::${j.title.toLowerCase().replace(/[^a-z0-9]/g, "")}::${j.location.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    // Create or find canonical job
    const canonical = await prisma.canonicalJob.upsert({
      where: { normalizedKey: normKey },
      update: {},
      create: {
        title: j.title,
        companyName: j.companyName,
        normalizedKey: normKey,
        totalSources: 1,
      },
    });

    const job = await prisma.job.create({
      data: {
        canonicalJobId: canonical.id,
        title: j.title,
        normalizedTitle: j.title.toLowerCase(),
        companyName: j.companyName,
        location: j.location,
        workMode: j.workMode,
        experienceLevel: j.experienceLevel,
        jobType: j.jobType,
        minSalary: j.minSalary,
        maxSalary: j.maxSalary,
        salaryCurrency: j.salaryCurrency,
        salaryPeriod: j.salaryPeriod || "YEAR",
        description: j.description,
        responsibilities: JSON.stringify(j.responsibilities),
        requirements: JSON.stringify(j.requirements),
        benefits: JSON.stringify(j.benefits),
        skills: JSON.stringify(j.skills),
        status: "ACTIVE",
        sourceId: demoSource.id,
        sourceName: "Demo Stream Engine",
        sourceJobId,
        canonicalUrl,
        applyUrl: canonicalUrl,
        isDemo: true,
        postedAt,
        discoveredAt: postedAt,
        lastCheckedAt: now,
        lastUpdatedAt: now,
        freshnessScore: j.offsetMin < 5 ? 96 : j.offsetMin < 30 ? 85 : 65,
        aiSummary: `Exciting opening at ${j.companyName} for ${j.title}. Focuses on ${j.skills.slice(0, 3).join(", ")}.`,
      },
    });

    await prisma.jobSourceRecord.create({
      data: {
        canonicalJobId: canonical.id,
        jobId: job.id,
        sourceId: demoSource.id,
        sourceName: "Demo Stream Engine",
        originalUrl: canonicalUrl,
      },
    });
  }

  // Also add a multi-source canonical duplicate test to show "Found on 2 sources"
  const multiSourceJob = await prisma.job.findFirst({ where: { companyName: "Razorpay" } });
  if (multiSourceJob && multiSourceJob.canonicalJobId) {
    await prisma.jobSourceRecord.create({
      data: {
        canonicalJobId: multiSourceJob.canonicalJobId,
        sourceName: "Company Careers Direct",
        originalUrl: "https://razorpay.com/jobs/senior-frontend",
      },
    });
    await prisma.canonicalJob.update({
      where: { id: multiSourceJob.canonicalJobId },
      data: { totalSources: 2 },
    });
  }

  console.log("Database seeded successfully with initial jobs and canonical records!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());