'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/student-login');
        return;
      }

      // Profile Data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, batch')
        .eq('id', session.user.id)
        .single();

      if (profileData) setStudent(profileData);

      // Exams List
      const { data: examData } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (examData) setExams(examData);

      // Student er nijer Result Data
      const { data: resultData } = await supabase
        .from('results')
        .select(`id, marks, total_marks, exams(title)`)
        .eq('student_id', session.user.id);

      if (resultData) setMyResults(resultData);
      
    } catch (error) {
      console.error("Dashboard Error:", error.message);
    } finally {
      setLoading(false); // এরর হলেও লোডিং বন্ধ হবে
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-indigo-600 animate-pulse">⏳ Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            ExamPortal
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/dashboard/profile" className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full">
            Profile
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-full">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-4 space-y-8">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Welcome, {student?.full_name || 'Student'}! 👋</h2>
            <p className="text-indigo-100">Ready to test your knowledge today? Choose an exam from below.</p>
          </div>
        </section>

        {/* Available Exams Cards */}
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>📚</span> Available Exams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                <h4 className="text-lg font-bold text-gray-800 mb-2">{exam.title}</h4>
                <p className="text-gray-500 text-sm mb-4">⏱ {exam.duration || 30} Mins</p>
                <Link href={`/dashboard/exam/${exam.id}`} className="block w-full text-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-indigo-700">
                  Start Exam →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* My Results Table */}
        <section className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>📊</span> My Exam Results
          </h3>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <th className="p-4 font-semibold text-sm">Exam Name</th>
                    <th className="p-4 font-semibold text-sm">Marks / Total</th>
                    <th className="p-4 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myResults.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-gray-500">
                        You haven't attended any exams yet.
                      </td>
                    </tr>
                  ) : (
                    myResults.map((result, index) => {
                      const percentage = (result.marks / result.total_marks) * 100;
                      const isPass = percentage >= 40;

                      return (
                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-800">
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}