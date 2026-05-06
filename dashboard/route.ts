import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Logic to clear at 3:00 PM daily.
  // If it's before 3:00 PM today, only show items from today BEFORE 3 PM, OR from yesterday after 3PM?
  // Let's simplify: Only fetch queue entries created today.
  // We'll filter out entries created before 3PM if it's currently after 3PM?
  // Wait, the requirement is "auto clear at 3:00pm daily".
  // Meaning at exactly 15:00, the list empties.
  // Let's set the "start time" for the queue to 15:00 of the previous day if current time is before 15:00,
  // or 15:00 of today if current time is after 15:00.
  // Actually, usually dismissal starts around 3:00 PM. Auto-clearing *at* 3:00 PM implies that is when dismissal starts, so you start fresh.

  const resetHour = 15; // 3:00 PM
  const startTime = new Date(now);

  if (now.getHours() >= resetHour) {
    // It's after 3 PM today. Start time is 3 PM today.
    startTime.setHours(resetHour, 0, 0, 0);
  } else {
    // It's before 3 PM today. Start time is 3 PM yesterday.
    startTime.setDate(startTime.getDate() - 1);
    startTime.setHours(resetHour, 0, 0, 0);
  }

  try {
    const queueEntries = await prisma.queueEntry.findMany({
      where: {
        createdAt: {
          gte: startTime,
        },
      },
      orderBy: {
        createdAt: "desc", // Newest first
      },
    });

    // For each queue entry, find the associated student(s)
    const dashboardData = await Promise.all(
      queueEntries.map(async (entry) => {
        const students = await prisma.student.findMany({
          where: { carNumber: entry.carNumber },
          select: { name: true, grade: true, teacher: true },
        });

        return {
          id: entry.id,
          carNumber: entry.carNumber,
          createdAt: entry.createdAt,
          students: students,
        };
      })
    );

    return NextResponse.json(dashboardData);
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
