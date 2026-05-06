import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    orderBy: { carNumber: 'asc' },
  });
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { name, grade, teacher, carNumber } = data;

  const student = await prisma.student.create({
    data: {
      name,
      grade,
      teacher,
      carNumber: carNumber ? parseInt(carNumber) : null,
    },
  });

  return NextResponse.json(student);
}
