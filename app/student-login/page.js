'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        setMessage('✅ Account created successfully! You can now log in.');
        setIsLogin(true);
        setPassword(''); // সিকিউরিটির জন্য পাসওয়ার্ড ফিল্ড ক্লিয়ার করে দেওয়া হলো
      }
    } catch (error) {
      console.error("Auth Error:", error.message);
      // ইউজার ফ্রেন্ডলি এরর মেসেজ
      if (error.message === 'Invalid login credentials') {
        setMessage('❌ Error: ভুল ইমেইল বা পাসওয়ার্ড দিয়েছেন!');
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false); // যাই হোক না কেন লোডিং বন্ধ হবে
    }
  };

  // গুগল লগিন ফাংশন
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {isLogin ? 'Student Login' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Sign up to start taking exams.'}
          </p>
        </div>

        {/* Google Login Button */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors mb-6 shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Email Address</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com" required
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-black transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required minLength="6"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-black transition-all"
            />
          </div>

          {message && (
            <p className={`text-sm font-semibold p-3 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </p>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-indigo-400"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login with Email' : 'Sign Up with Email')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up here' : 'Login here'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 hover:underline font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}