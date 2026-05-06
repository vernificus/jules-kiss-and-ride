"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Student = {
  id: string;
  name: string;
  grade: string;
  teacher: string;
  carNumber: number;
};

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await fetch("/api/students");
    if (res.ok) {
      const data = await res.json();
      setStudents(data);
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedStudents = results.data.map((row: any) => ({
          name: row.Name || row.name,
          grade: row.Grade || row.grade,
          teacher: row.Teacher || row.teacher,
        }));

        const res = await fetch("/api/students/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: parsedStudents }),
        });

        if (res.ok) {
          alert("Students uploaded and numbers assigned successfully!");
          fetchStudents();
        } else {
          alert("Failed to upload students");
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchStudents();
    }
  };

  const handlePrintCards = async () => {
    const pdf = new jsPDF("p", "pt", "letter");

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const cardContainer = document.createElement('div');
      cardContainer.style.width = '612pt';
      cardContainer.style.height = '792pt'; // Letter size portrait
      cardContainer.style.position = 'absolute';
      cardContainer.style.left = '-9999px';
      cardContainer.style.top = '-9999px';
      cardContainer.style.backgroundColor = 'white';
      cardContainer.style.display = 'flex';
      cardContainer.style.flexDirection = 'column';
      cardContainer.style.justifyContent = 'space-around';
      cardContainer.style.padding = '40pt';

      const cardHtml = `
        <div style="border: 4px solid black; border-radius: 16px; padding: 40px; text-align: center; height: 320pt; display: flex; flex-direction: column; justify-content: center;">
          <h1 style="font-size: 140px; font-weight: bold; margin: 0;">${student.carNumber}</h1>
          <h2 style="font-size: 40px; margin: 10px 0;">${student.name}</h2>
          <p style="font-size: 30px; margin: 0; color: #555;">Grade: ${student.grade}</p>
        </div>
      `;

      // 2 identical cards per page
      cardContainer.innerHTML = cardHtml + cardHtml;
      document.body.appendChild(cardContainer);

      const canvas = await html2canvas(cardContainer);
      const imgData = canvas.toDataURL("image/png");

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "PNG", 0, 0, 612, 792);

      document.body.removeChild(cardContainer);
    }

    pdf.save("car-rider-cards.pdf");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={handlePrintCards}
            className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 transition disabled:opacity-50"
            disabled={students.length === 0}
          >
            Export PDF Cards
          </button>
          <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition">
            Upload CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4">Car Number</th>
              <th className="p-4">Name</th>
              <th className="p-4">Grade</th>
              <th className="p-4">Teacher</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">Loading...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">No students found. Upload a CSV to get started.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold text-lg">{student.carNumber}</td>
                  <td className="p-4">{student.name}</td>
                  <td className="p-4">{student.grade}</td>
                  <td className="p-4">{student.teacher}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
