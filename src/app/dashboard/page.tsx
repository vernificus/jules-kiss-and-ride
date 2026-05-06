"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type DashboardEntry = {
  id: string;
  carNumber: number;
  createdAt: string;
  students: {
    name: string;
    grade: string;
    teacher: string;
  }[];
};

export default function DashboardPage() {
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    // Poll every 3 seconds for updates
    const interval = setInterval(fetchDashboard, 3000);
    return () => clearInterval(interval);
  }, []);

  const newestEntry = entries.length > 0 ? entries[0] : null;
  const historyEntries = entries.length > 1 ? entries.slice(1) : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-blue-900">Car Rider Dismissal Dashboard</h1>
        <button onClick={() => signOut()} className="text-sm text-red-500 font-semibold hover:underline">
          Logout
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Newest Entry (Large Display) */}
        <div className="flex-1 p-8 flex items-center justify-center bg-blue-50 border-b md:border-b-0 md:border-r border-blue-200">
          {loading && entries.length === 0 ? (
            <div className="text-3xl text-gray-400 font-bold animate-pulse">Loading...</div>
          ) : newestEntry ? (
            <div className="text-center w-full max-w-2xl bg-white p-12 rounded-3xl shadow-2xl transform transition-all duration-500 scale-100">
              <div className="text-9xl font-black text-blue-600 mb-8 tracking-tighter">
                #{newestEntry.carNumber}
              </div>

              {newestEntry.students.length > 0 ? (
                <div className="space-y-6">
                  {newestEntry.students.map((student, idx) => (
                    <div key={idx} className="bg-blue-100 p-6 rounded-xl">
                      <div className="text-5xl font-bold text-gray-800 mb-2">{student.name}</div>
                      <div className="text-3xl text-gray-600 font-medium">
                        Grade: {student.grade} <span className="mx-2">•</span> {student.teacher}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-3xl text-red-500 font-bold bg-red-50 p-6 rounded-xl">
                  Unassigned Number
                </div>
              )}
            </div>
          ) : (
            <div className="text-4xl text-gray-400 font-bold text-center">
              Waiting for numbers...
            </div>
          )}
        </div>

        {/* Right Side: History List */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-inner overflow-y-auto">
          <div className="p-4 bg-gray-100 border-b font-bold text-gray-600 sticky top-0 uppercase tracking-wider text-sm shadow-sm">
            Previous Calls
          </div>
          <div className="divide-y divide-gray-100">
            {historyEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-gray-200 text-gray-800 text-3xl font-bold px-4 py-2 rounded-lg min-w-[80px] text-center">
                    {entry.carNumber}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {entry.students.length > 0 ? (
                  <div className="space-y-3 pl-2 border-l-4 border-blue-200">
                    {entry.students.map((student, idx) => (
                      <div key={idx} className="ml-2">
                        <div className="font-bold text-xl text-gray-800">{student.name}</div>
                        <div className="text-gray-500 font-medium">Grade {student.grade}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-red-400 font-medium pl-4">Unassigned</div>
                )}
              </div>
            ))}

            {historyEntries.length === 0 && !loading && entries.length > 0 && (
              <div className="p-8 text-center text-gray-400 italic">
                No history yet today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
