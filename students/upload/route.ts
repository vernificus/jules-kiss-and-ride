import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const GRADE_ORDER: Record<string, number> = {
  "Prek": 0,
  "K": 1,
  "1": 2,
  "2": 3,
  "3": 4,
  "4": 5,
  "5": 6,
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { students } = await req.json();

  if (!students || !Array.isArray(students)) {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  const existingStudents = await prisma.student.findMany();
  let maxCarNumber = existingStudents.reduce((max, s) => Math.max(max, s.carNumber || 0), 0);

  // Sort students by grade
  const sortedStudents = [...students].sort((a, b) => {
    const gradeA = GRADE_ORDER[a.grade] ?? 99;
    const gradeB = GRADE_ORDER[b.grade] ?? 99;
    return gradeA - gradeB;
  });

  const createdStudents = [];

  for (const studentData of sortedStudents) {
    let assignedNumber = studentData.carNumber;
    if (!assignedNumber) {
      maxCarNumber++;
      assignedNumber = maxCarNumber;
    }

    const newStudent = await prisma.student.create({
      data: {
        name: studentData.name,
        grade: String(studentData.grade),
        teacher: studentData.teacher,
        carNumber: parseInt(String(assignedNumber)),
      },
    });
    createdStudents.push(newStudent);
  }

  return NextResponse.json({ message: "Upload successful", count: createdStudents.length });
}
