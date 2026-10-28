'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const hasToken = cookies.some(c => c.trim().startsWith('admin_token='));

    if (!hasToken) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // লগআউট ফাংশন 
  const handleLogout = () => {
    // অ্যাডমিন টোকেন কুকি থেকে মুছে ফেলা হচ্ছে
    document.cookie = "admin_token=; path=/; max-age=0";
    
    // টোকেন মোছার পর হোম পেজে (বা স্টুডেন্ট লগিন পেজে) পাঠিয়ে দেওয়া হবে
    router.push('/');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-indigo-600 animate-pulse">🔒 Checking Security...</div>
      </div>
    );
  }

  // এখান থেকে Upload CSV অপশনটি সরিয়ে ফেলা হয়েছে
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Manage Exams', path: '/admin/manage-exams', icon: '📝' },
    { name: 'Student Results', path: '/admin/results', icon: '🏆' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 text-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-indigo-400">Admin Pro</h2>
          <p className="text-xs text-gray-400 mt-1">Exam Management System</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          {/* লগআউট বাটন যুক্ত করা হলো */}
          <button 
            onClick={handleLogout} 
            className="block w-full text-center py-2 px-4 bg-gray-800 hover:bg-red-600 rounded text-sm font-semibold transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}