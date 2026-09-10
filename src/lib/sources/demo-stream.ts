import { JobSourceAdapter, RawDiscoveredJob } from "./adapter.interface";

export const DEMO_SOURCE_ID = "demo-stream";
export const DEMO_SOURCE_NAME = "Demo Stream Engine";

const DEMO_JOB_POOL = [
  {
    companyName: "Razorpay",
    title: "Senior Frontend Engineer (Design Systems)",
    location: "Bangalore, India",
    workMode: "HYBRID" as const,
    experienceLevel: "3-5" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 2800000,
    maxSalary: 4200000,
    salaryCurrency: "INR",
    skills: ["React", "TypeScript", "Design Systems", "Web Performance", "Tailwind CSS"],
    description: "Join the Razorpay core checkout UI team building lightning-fast payment experiences for 50M+ users across India. You will architect accessible design systems, micro-frontends, and high-conversion payment widgets.",
    responsibilities: [
      "Own core Razorpay Checkout UI libraries and Blade design system components",
      "Optimize bundle size and First Contentful Paint to sub-500ms on 3G networks",
      "Collaborate with product designers and security engineers on payment compliance UI"
    ],
    requirements: [
      "4+ years of production experience in React, TypeScript, and state management",
      "Deep understanding of browser rendering performance, DOM profiling, and accessibility (WCAG AA)",
      "Experience maintaining or creating shared npm component libraries"
    ],
    benefits: ["Comprehensive medical insurance", "ESOP opportunities", "₹75,000 annual learning stipend", "Catered lunch at Bangalore HQ"],
  },
  {
    companyName: "Zerodha",
    title: "Go / Systems Software Engineer",
    location: "Bangalore, India",
    workMode: "ON_SITE" as const,
    experienceLevel: "2-3" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 2400000,
    maxSalary: 3600000,
    salaryCurrency: "INR",
    skills: ["Go", "PostgreSQL", "Redis", "Distributed Systems", "Kafka", "Linux"],
    description: "Zerodha processes 15%+ of all Indian stock trading retail volume. We build lean, self-hosted, high-throughput financial systems using Go, Python, and PostgreSQL without enterprise bloat.",
    responsibilities: [
      "Build high-concurrency order routing and streaming tick data pipelines",
      "Optimize low-latency PostgreSQL queries and in-memory caches",
      "Write zero-dependency, robust backend microservices handling peak market spikes"
    ],
    requirements: [
      "2+ years experience building concurrent systems in Go or C/C++",
      "Solid foundation in Linux networking, IPC, and relational database internals",
      "Passion for simplicity and minimal external dependencies"
    ],
    benefits: ["Generous profit-sharing bonus", "Ergonomic hardware setup", "Breakfast and snacks provided", "Flat hierarchy"],
  },
  {
    companyName: "Swiggy",
    title: "AI / ML Engineer (Delivery Logistics)",
    location: "Bangalore, India",
    workMode: "HYBRID" as const,
    experienceLevel: "2-3" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 2500000,
    maxSalary: 3800000,
    salaryCurrency: "INR",
    skills: ["Python", "Machine Learning", "PyTorch", "ETA Prediction", "FastAPI", "Docker"],
    description: "Swiggy powers millions of hyperlocal grocery and food orders every day. Help build dynamic pricing, routing optimization, and real-time delivery partner allocation models.",
    responsibilities: [
      "Train and deploy spatial-temporal deep learning models for minute-level ETA forecasting",
      "Implement multi-objective optimization algorithms for batching food orders",
      "Monitor real-time model drift and conduct A/B testing on dispatch algorithms"
    ],
    requirements: [
      "2-4 years experience applying ML to production supply chain or logistics problems",
      "Strong Python, PyTorch/TensorFlow, and feature store experience (Feast / Redis)",
      "Degree in Computer Science, Operations Research, or related quantitative field"
    ],
    benefits: ["Comprehensive health coverage", "Flexible work schedule", "Swiggy One membership", "Home office allowance"],
  },
  {
    companyName: "CRED",
    title: "Backend Engineer (Payments & Core Banking)",
    location: "Bangalore, India",
    workMode: "ON_SITE" as const,
    experienceLevel: "3-5" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 3500000,
    maxSalary: 5000000,
    salaryCurrency: "INR",
    skills: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Microservices", "Fintech"],
    description: "CRED is building the financial ecosystem for India's high-trust creditworthy community. Architect double-entry ledger systems, instant UPI integrations, and fraud-resistant billing.",
    responsibilities: [
      "Architect ledger systems with strict idempotency and zero-tolerance reconciliation",
      "Build low-latency payment rails interfacing directly with NPCI and partner banks",
      "Lead cross-functional architecture reviews with security and compliance teams"
    ],
    requirements: [
      "4+ years building high-volume distributed backend systems in Java/Kotlin/Go",
      "Demonstrated experience with event-driven architecture (Kafka) and transaction semantics",
      "Prior fintech, payment gateway, or banking core experience is a big plus"
    ],
    benefits: ["Industry-leading compensation & ESOPs", "Premium health cover for family", "Gym & wellness allowances", "State-of-the-art office in Indiranagar"],
  },
  {
    companyName: "Postman",
    title: "Full Stack Developer (API Client)",
    location: "Bangalore, India",
    workMode: "REMOTE" as const,
    experienceLevel: "1-2" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 1800000,
    maxSalary: 2600000,
    salaryCurrency: "INR",
    skills: ["React", "Node.js", "TypeScript", "Electron", "REST", "GraphQL"],
    description: "Postman is used by over 30 million developers around the world to build, test, and collaborate on APIs. Work on the core desktop and web client.",
    responsibilities: [
      "Build intuitive UI workflows for API collections, environment switching, and mock servers",
      "Contribute to offline-first synchronization protocols across desktop and cloud",
      "Diagnose client memory leaks and optimize Monaco editor integrations"
    ],
    requirements: [
      "1-3 years of modern web application development (React/Node/TypeScript)",
      "Strong grasp of HTTP specs, REST, WebSockets, and gRPC",
      "Excitement for developer tooling and empathetic UX"
    ],
    benefits: ["Fully remote across India", "Annual home workspace setup fund", "Unlimited PTO policy", "Wellness reimbursement"],
  },
  {
    companyName: "Zomato / Blinkit",
    title: "Frontend Intern (Quick Commerce UI)",
    location: "Gurgaon, India",
    workMode: "ON_SITE" as const,
    experienceLevel: "FRESHER" as const,
    jobType: "INTERNSHIP" as const,
    minSalary: 40000,
    maxSalary: 60000,
    salaryCurrency: "INR",
    salaryPeriod: "MONTH",
    skills: ["React", "JavaScript", "CSS", "Tailwind CSS", "Mobile Web"],
    description: "Blinkit delivers groceries in 10 minutes. Join the high-velocity consumer web and PWA team to craft ultra-responsive search and basket experiences.",
    responsibilities: [
      "Implement smooth micro-interactions for cart recommendations and instant checkout",
      "Assist in testing responsiveness across low-end Android devices and diverse screen sizes",
      "Write clean, modular React components with TypeScript and Tailwind"
    ],
    requirements: [
      "Final year student or recent graduate in Computer Science or related branch",
      "Strong JavaScript / TypeScript fundamentals and React project portfolio",
      "Eager to learn high-scale web engineering in a fast-paced environment"
    ],
    benefits: ["₹50,000/month stipend", "Opportunity for full-time PPO", "Zomato Gold membership", "Free office meals"],
  },
  {
    companyName: "Flipkart",
    title: "Software Development Engineer II (Search & Recommendations)",
    location: "Bangalore, India",
    workMode: "HYBRID" as const,
    experienceLevel: "3-5" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 3200000,
    maxSalary: 4600000,
    salaryCurrency: "INR",
    skills: ["Java", "Elasticsearch", "Distributed Caching", "Information Retrieval", "Kubernetes"],
    description: "Help hundreds of millions of shoppers discover products seamlessly across millions of SKUs during Big Billion Days and year-round.",
    responsibilities: [
      "Optimize inverted indexes and query scoring pipelines in Elasticsearch",
      "Build personalized re-ranking services handling 100k+ QPS with p99 < 20ms",
      "Design resilient fallback paths during flash sales and traffic spikes"
    ],
    requirements: [
      "3-5 years solid software engineering experience in Java or C++",
      "Deep understanding of search algorithms, inverted indexes, and tokenizers",
      "Hands-on experience with Kafka, Redis, and containerized deployments"
    ],
    benefits: ["Substantial retention bonuses", "Parental health insurance", "Relocation assistance", "Hybrid work flexibility"],
  },
  {
    companyName: "Stripe",
    title: "Software Engineer (Global Payouts)",
    location: "Remote - India",
    workMode: "REMOTE" as const,
    experienceLevel: "2-3" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 3800000,
    maxSalary: 5500000,
    salaryCurrency: "INR",
    skills: ["Ruby", "Go", "Distributed Systems", "SQL", "Fintech", "API Design"],
    description: "Stripe builds economic infrastructure for the internet. The Payouts team moves tens of billions of dollars every month to businesses globally.",
    responsibilities: [
      "Integrate with global banking rails and local clearing houses",
      "Write resilient, idempotent payment dispatching logic with automated reconciliation",
      "Collaborate with distributed engineering teams across North America, Europe, and APAC"
    ],
    requirements: [
      "2+ years experience in backend software engineering with high reliability standards",
      "Strong data modeling and SQL expertise (PostgreSQL/MySQL)",
      "Strong communication skills for asynchronous, remote-first collaboration"
    ],
    benefits: ["World-class health and dental insurance", "Competitive equity grant", "Generous remote workspace stipend", "Flexible paid time off"],
  },
  {
    companyName: "Urban Company",
    title: "Product Manager (Partner Experience)",
    location: "Gurgaon, India",
    workMode: "HYBRID" as const,
    experienceLevel: "2-3" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 2200000,
    maxSalary: 3200000,
    salaryCurrency: "INR",
    skills: ["Product Strategy", "User Research", "Data Analytics", "SQL", "Mobile Products"],
    description: "Urban Company is Asia's largest home services platform. Shape the tools, training workflows, and earnings transparency for 40,000+ service partners.",
    responsibilities: [
      "Define PRDs and user flows for partner onboarding, safety training, and job dispatch",
      "Analyze funnel drop-offs and conduct in-person fieldwork with service professionals",
      "Partner with engineering and operations leads to drive partner NPS and retention"
    ],
    requirements: [
      "2-4 years product management experience at a consumer tech or gig marketplace startup",
      "Proficiency in SQL, Mixpanel, and data-driven hypothesis testing",
      "Empathy for blue-collar gig economy workers and vernacular UI design"
    ],
    benefits: ["Health insurance", "Annual retreat", "Company transport", "Performance bonus"],
  },
  {
    companyName: "DeepCompute Labs",
    title: "AI Research Engineer (LLM Fine-Tuning)",
    location: "Hyderabad, India",
    workMode: "REMOTE" as const,
    experienceLevel: "1-2" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 2000000,
    maxSalary: 3000000,
    salaryCurrency: "INR",
    skills: ["Python", "PyTorch", "LLMs", "LoRA", "Hugging Face", "vLLM"],
    description: "We are an applied AI lab developing domain-specific generative models for legal and compliance workflows. Looking for passionate builders to fine-tune open weights models.",
    responsibilities: [
      "Implement parameter-efficient fine-tuning (LoRA, QLoRA) on Llama 3 and Mistral architectures",
      "Build high-throughput inference serving pipelines using vLLM and TensorRT-LLM",
      "Curate synthetic evaluation benchmarks and alignment reward models"
    ],
    requirements: [
      "1-2 years experience working with transformer architectures and PyTorch",
      "Hands-on experience fine-tuning LLMs with Hugging Face transformers and PEFT",
      "Proficient in GPU memory optimization and distributed training"
    ],
    benefits: ["Dedicated H100 GPU cluster access", "Remote-first culture", "Conference travel sponsorship", "Health cover"],
  },
  {
    companyName: "Paytm",
    title: "DevOps / SRE Engineer",
    location: "Noida, India",
    workMode: "ON_SITE" as const,
    experienceLevel: "3-5" as const,
    jobType: "FULL_TIME" as const,
    minSalary: 2000000,
    maxSalary: 2800000,
    salaryCurrency: "INR",
    skills: ["Kubernetes", "AWS", "Terraform", "Prometheus", "Linux", "CI/CD"],
    description: "Paytm processes billions of transactions every month. Join our core reliability engineering group maintaining 99.99% uptime on multi-region cloud infrastructures.",
    responsibilities: [
      "Manage and scale multi-tenant Kubernetes clusters running 2000+ microservices",
      "Implement Infrastructure as Code using Terraform and automated GitOps pipelines",
      "Drive incident post-mortems and establish automated chaos engineering tests"
    ],
    requirements: [
      "3-5 years production SRE / DevOps experience with AWS and Kubernetes",
      "Deep understanding of TCP/IP, DNS, load balancers, and Linux system calls",
      "Proficiency in scripting (Python, Bash, or Go)"
    ],
    benefits: ["Comprehensive medical insurance", "On-site cafeteria and gym", "Subsidized commute", "Annual bonus"],
  },
  {
    companyName: "Freshworks",
    title: "React Frontend Intern",
    location: "Chennai, India",
    workMode: "HYBRID" as const,
    experienceLevel: "FRESHER" as const,
    jobType: "INTERNSHIP" as const,
    minSalary: 25000,
    maxSalary: 35000,
    salaryCurrency: "INR",
    salaryPeriod: "MONTH",
    skills: ["React", "JavaScript", "HTML5", "CSS3", "Git"],
    description: "Freshworks makes business software people love. Join our CRM design platform team to learn how to build enterprise-grade SaaS interfaces used worldwide.",
    responsibilities: [
      "Build reusable UI components in React adhering to the Freshworks Crayons design system",
      "Write unit tests with Jest and React Testing Library",
      "Collaborate with senior developers through pair programming and code reviews"
    ],
    requirements: [
      "Graduating in 2025/2026 with Computer Science, IT, or related degree",
      "Demonstrated passion for frontend web development with sample projects on GitHub",
      "Strong analytical and problem-solving skills"
    ],
    benefits: ["Monthly stipend of ₹30,000", "Mentorship from senior staff engineers", "Free lunch and transport", "Full-time conversion opportunity"],
  }
];

export class DemoStreamAdapter implements JobSourceAdapter {
  id = DEMO_SOURCE_ID;
  name = DEMO_SOURCE_NAME;
  type = "DEMO" as const;

  async fetchJobs(): Promise<RawDiscoveredJob[]> {
    const now = new Date();

    return DEMO_JOB_POOL.map((item, index) => {
      // Stagger posted dates so some are 1-2 minutes ago, some 15m, some 1-2 hours ago
      const offsetMinutes = (index * 7) % 180;
      const postedDate = new Date(now.getTime() - offsetMinutes * 60 * 1000);

      const sourceJobId = `demo-${item.companyName.toLowerCase().replace(/\s+/g, "")}-${index}`;
      const canonicalUrl = `https://demo.jobstream.io/careers/${item.companyName.toLowerCase().replace(/\s+/g, "")}/${sourceJobId}`;

      return {
        sourceJobId,
        title: item.title,
        companyName: item.companyName,
        companyLogo: `https://avatar.vercel.sh/${encodeURIComponent(item.companyName)}.svg?text=${encodeURIComponent(item.companyName.slice(0, 2).toUpperCase())}`,
        location: item.location,
        workMode: item.workMode,
        experienceLevel: item.experienceLevel,
        jobType: item.jobType,
        minSalary: item.minSalary,
        maxSalary: item.maxSalary,
        salaryCurrency: item.salaryCurrency,
        salaryPeriod: item.salaryPeriod || "YEAR",
        description: item.description,
        responsibilities: item.responsibilities,
        requirements: item.requirements,
        benefits: item.benefits,
        skills: item.skills,
        canonicalUrl,
        applyUrl: `${canonicalUrl}/apply`,
        postedAt: postedDate,
        isDemo: true,
      };
    });
  }

  async checkJobStatus(sourceJobId: string): Promise<"ACTIVE" | "CLOSED" | "EXPIRED" | "UNKNOWN"> {
    // In demo mode, jobs remain ACTIVE unless manually toggled or expired
    return "ACTIVE";
  }
}
