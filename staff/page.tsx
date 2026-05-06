"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function StaffPage() {
  const [currentNumber, setCurrentNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleKeyPress = (num: string) => {
    setCurrentNumber((prev) => prev + num);
  };

  const handleDelete = () => {
    setCurrentNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCurrentNumber("");
  };

  const handleSubmit = async () => {
    if (!currentNumber) return;

    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carNumber: currentNumber }),
      });

      if (res.ok) {
        setMessage(`Number ${currentNumber} submitted successfully!`);
        setCurrentNumber("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`Error submitting ${currentNumber}`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold">Line Walker Input</h1>
        <button onClick={() => signOut()} className="text-sm text-red-500">Logout</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {message && (
          <div className="mb-4 text-green-600 font-bold text-lg text-center h-8">
            {message}
          </div>
        )}

        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <input
              type="text"
              readOnly
              value={currentNumber}
              placeholder="Enter Car #"
              className="w-full text-center text-4xl font-bold border-b-4 border-blue-500 py-4 outline-none bg-gray-50 rounded-t-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-3xl font-semibold py-6 rounded-lg transition"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 text-xl font-bold py-6 rounded-lg transition"
            >
              CLEAR
            </button>
            <button
              onClick={() => handleKeyPress("0")}
              className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-3xl font-semibold py-6 rounded-lg transition"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 active:bg-yellow-300 text-xl font-bold py-6 rounded-lg transition flex items-center justify-center"
            >
              DEL
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!currentNumber}
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 text-white text-2xl font-bold py-6 rounded-lg transition shadow-md"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
}
