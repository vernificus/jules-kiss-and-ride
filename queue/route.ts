import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { carNumber } = await req.json();

  if (!carNumber || isNaN(parseInt(carNumber))) {
    return NextResponse.json({ error: "Invalid car number" }, { status: 400 });
  }

  try {
    const queueEntry = await prisma.queueEntry.create({
      data: {
        carNumber: parseInt(carNumber),
        status: "WAITING",
      },
    });

    return NextResponse.json(queueEntry);
  } catch {
    return NextResponse.json({ error: "Failed to add to queue" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch only today's queue
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const queue = await prisma.queueEntry.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
      orderBy: {
        createdAt: "desc", // Newest first
      },
    });

    return NextResponse.json(queue);
  } catch {
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 });
  }
}
