export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let user = await db.user.findFirst({
      include: { profile: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: "alex@jobstream.io",
          name: "Alex Chen",
          role: "user",
          profile: {
            create: {
              experienceLevel: "1-2",
              skills: JSON.stringify(["React", "TypeScript", "Next.js", "Python", "Tailwind CSS", "Node.js", "PostgreSQL"]),
              preferredLocations: JSON.stringify(["Remote", "Bangalore", "Gurgaon"]),
              preferredWorkModes: JSON.stringify(["REMOTE", "HYBRID"]),
              preferredJobTypes: JSON.stringify(["FULL_TIME", "INTERNSHIP"]),
              minSalary: 1800000,
              preferredRoles: JSON.stringify(["Frontend Developer", "Full Stack Engineer", "AI Intern"]),
              education: "B.Tech in Computer Science",
              bio: "Passionate full-stack developer focusing on modern web apps and AI systems.",
            },
          },
        },
        include: { profile: true },
      });
    }

    const p = user.profile;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      profile: {
        id: p?.id,
        userId: user.id,
        experienceLevel: p?.experienceLevel || "1-2",
        skills: JSON.parse(p?.skills || "[]"),
        preferredLocations: JSON.parse(p?.preferredLocations || "[]"),
        preferredWorkModes: JSON.parse(p?.preferredWorkModes || "[]"),
        preferredJobTypes: JSON.parse(p?.preferredJobTypes || "[]"),
        minSalary: p?.minSalary,
        preferredRoles: JSON.parse(p?.preferredRoles || "[]"),
        preferredIndustries: JSON.parse(p?.preferredIndustries || "[]"),
        education: p?.education,
        bio: p?.bio,
      },
    });
  } catch (error: any) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      avatar,
      skills,
      preferredLocations,
      preferredWorkModes,
      preferredJobTypes,
      experienceLevel,
      minSalary,
      preferredRoles,
      preferredIndustries,
      education,
      bio,
    } = body;

    let user = await db.user.findFirst({
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name || email || avatar !== undefined) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          email: email || user.email,
          avatar: avatar !== undefined ? avatar : user.avatar,
        },
        include: { profile: true },
      });
    }

    const updatedProfile = await db.userProfile.upsert({
      where: { userId: user.id },
      update: {
        skills: skills ? JSON.stringify(skills) : undefined,
        preferredLocations: preferredLocations ? JSON.stringify(preferredLocations) : undefined,
        preferredWorkModes: preferredWorkModes ? JSON.stringify(preferredWorkModes) : undefined,
        preferredJobTypes: preferredJobTypes ? JSON.stringify(preferredJobTypes) : undefined,
        experienceLevel: experienceLevel || undefined,
        minSalary: minSalary !== undefined ? minSalary : undefined,
        preferredRoles: preferredRoles ? JSON.stringify(preferredRoles) : undefined,
        preferredIndustries: preferredIndustries ? JSON.stringify(preferredIndustries) : undefined,
        education: education !== undefined ? education : undefined,
        bio: bio !== undefined ? bio : undefined,
      },
      create: {
        userId: user.id,
        skills: JSON.stringify(skills || []),
        preferredLocations: JSON.stringify(preferredLocations || []),
        preferredWorkModes: JSON.stringify(preferredWorkModes || ["REMOTE"]),
        preferredJobTypes: JSON.stringify(preferredJobTypes || ["FULL_TIME"]),
        experienceLevel: experienceLevel || "1-2",
        minSalary: minSalary || 1800000,
        preferredRoles: JSON.stringify(preferredRoles || []),
        preferredIndustries: JSON.stringify(preferredIndustries || []),
        education,
        bio,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      profile: {
        id: updatedProfile.id,
        userId: user.id,
        experienceLevel: updatedProfile.experienceLevel,
        skills: JSON.parse(updatedProfile.skills),
        preferredLocations: JSON.parse(updatedProfile.preferredLocations),
        preferredWorkModes: JSON.parse(updatedProfile.preferredWorkModes),
        preferredJobTypes: JSON.parse(updatedProfile.preferredJobTypes),
        minSalary: updatedProfile.minSalary,
        preferredRoles: JSON.parse(updatedProfile.preferredRoles),
        preferredIndustries: JSON.parse(updatedProfile.preferredIndustries || "[]"),
        education: updatedProfile.education,
        bio: updatedProfile.bio,
      },
    });
  } catch (error: any) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}