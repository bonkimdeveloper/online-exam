import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl px-4">
        <div className="mb-6 inline-block p-4 bg-indigo-100 rounded-full text-5xl">
          🎓
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          Online Exam Platform
        </h1>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          Welcome to our smart exam portal! Here you can easily participate in exams, track your progress, and view your results instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Student Login Button */}
          <Link 
            href="/student-login" 
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-lg"
          >
            Student Login
          </Link>
          
          {/* Admin Login Button */}
          <Link 
            href="/login" 
            className="px-8 py-4 bg-white text-gray-700 border border-gray-300 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-lg"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}