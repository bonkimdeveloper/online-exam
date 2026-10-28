'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    // সেফ কুয়েরি যাতে রিলেশন বা কলাম না থাকলেও অ্যাপ ক্র্যাশ না করে
    const { data, error } = await supabase
      .from('results')
      .select(`
        id,
        marks,
        total_marks,
        student_id,
        exam_id,
        profiles (full_name, batch),
        exams (title)
      `);

    if (error) {
      console.error("Error fetching results:", error.message);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  const filteredResults = results.filter((result) => {
    const studentName = result.profiles?.full_name?.toLowerCase() || '';
    return studentName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Student Results</h2>
        
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search student by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
          Loading results...
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          {searchQuery ? 'No student found with that name.' : 'No results found yet. (Students need to complete an exam first)'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900 border-b border-indigo-100">
                <th className="p-4 font-semibold text-sm">Sl No.</th>
                <th className="p-4 font-semibold text-sm">Student Name</th>
                <th className="p-4 font-semibold text-sm">Batch</th>
                <th className="p-4 font-semibold text-sm">Exam Name</th>
                <th className="p-4 font-semibold text-sm">Marks / Total</th>
                <th className="p-4 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => {
                const percentage = result.total_marks ? (result.marks / result.total_marks) * 100 : 0;
                const isPass = percentage >= 40;

                return (
                  <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      {result.profiles?.full_name || 'Unknown Student'}
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                        {result.profiles?.batch || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">
                      {result.exams?.title || 'Unknown Exam'}
                    </td>
                    <td className="p-4 font-bold text-indigo-600">
                      {result.marks} <span className="text-gray-400 font-normal">/ {result.total_marks}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isPass ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}