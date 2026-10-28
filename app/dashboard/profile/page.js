'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    batch: '',
    course: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/student-login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setFormData({
        full_name: data.full_name || '',
        batch: data.batch || '',
        course: data.course || '',
        avatar_url: data.avatar_url || ''
      });
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setMessage('❌ Error: User not authenticated!');
      setUpdating(false);
      return;
    }

    // .update() এর পরিবর্তে .upsert() ব্যবহার করা হলো যাতে ডেটা না থাকলে অটো তৈরি হয় ও সেভ থাকে
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        full_name: formData.full_name,
        batch: formData.batch,
        course: formData.course,
        avatar_url: formData.avatar_url,
        updated_at: new Date()
      });

    if (error) {
      setMessage('❌ Error updating profile: ' + error.message);
    } else {
      setMessage('✅ Profile updated successfully!');
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-indigo-600 font-bold animate-pulse">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold">My Profile</h2>
            <p className="text-indigo-100 text-sm mt-1">Update your personal information and profile picture.</p>
          </div>

          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden border-4 border-indigo-50 flex items-center justify-center">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture Link (URL)</label>
                <input
                  type="url"
                  placeholder="Paste your image link here..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                placeholder="e.g. Web Development, Graphic Design"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
              />
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <input
                type="text"
                placeholder="e.g. Batch-15"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.batch}
                onChange={(e) => setFormData({...formData, batch: e.target.value})}
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {updating ? 'Saving Changes...' : 'Save Profile'}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}