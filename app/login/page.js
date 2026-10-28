'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, AlertCircle, Laptop2, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // States
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPublicDevice, setIsPublicDevice] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // আপনার দেওয়া আগের লগিন লজিক
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const ADMIN_PASSWORD = 'admin'; 

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        document.cookie = "admin_token=true; path=/; max-age=86400";
        router.push('/admin');
      } else {
        setError('❌ পাসওয়ার্ড ভুল হয়েছে!');
        setIsLoading(false);
      }
    }, 800); // একটু লোডিং ইফেক্ট দেখানোর জন্য
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in to Exam Portal
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your credentials to access the dashboard.
            </p>
          </div>
        </div>

        {/* Role Segmented Controller */}
        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex items-center justify-center gap-2 rounded-md py-2 transition-all duration-150 cursor-pointer ${
              role === 'student' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-2 rounded-md py-2 transition-all duration-150 cursor-pointer ${
              role === 'admin' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <span>Admin</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <p className="flex-1 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Google Button Dummy */}
          <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
              or continue with email
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent hover:border-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  Password
                </label>
                <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent hover:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={isPublicDevice}
                    onChange={(e) => setIsPublicDevice(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="flex items-center gap-1">
                    <Laptop2 className="h-3 w-3" /> Public PC
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 text-center text-sm text-slate-600 border-t border-slate-100 mt-4">
            <span>New user? </span>
            <button className="font-semibold text-blue-600 hover:underline">
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}