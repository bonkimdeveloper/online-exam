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
  const [messageType, setMessageType] = useState('success');

  const [formData, setFormData] = useState({
    full_name: '',
    batch: '',
    course: '',
    avatar_url: '',
  });

  // ---------- FETCH PROFILE ----------
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('🔍 FETCH -> user:', user?.id, '| authError:', authError);

    if (authError || !user) {
      router.push('/student-login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, batch, course, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    console.log('🔍 FETCH -> data:', data, '| error:', error);

    if (error) {
      setMessage('❌ Could not load profile: ' + error.message);
      setMessageType('error');
    } else if (data) {
      setFormData({
        full_name: data.full_name || '',
        batch: data.batch || '',
        course: data.course || '',
        avatar_url: data.avatar_url || '',
      });
    }
    setLoading(false);
  };

  // ---------- UPDATE PROFILE ----------
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('💾 SAVE -> user:', user?.id, '| authError:', authError);

    if (authError || !user) {
      setMessage('❌ User not authenticated! Please login again.');
      setMessageType('error');
      setUpdating(false);
      return;
    }

    const payload = {
      id: user.id,
      full_name: formData.full_name.trim(),
      batch: formData.batch.trim(),
      course: formData.course.trim(),
      avatar_url: formData.avatar_url.trim(),
      updated_at: new Date().toISOString(),
    };

    console.log('💾 SAVE -> payload:', payload);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    console.log('💾 SAVE -> returned data:', data, '| error:', error);

    if (error) {
      setMessage('❌ Error updating profile: ' + error.message);
      setMessageType('error');
    } else if (!data) {
      setMessage(
        '⚠️ Save returned no data. Check RLS policies on "profiles" table (SELECT + INSERT + UPDATE).'
      );
      setMessageType('error');
    } else {
      setMessage('✅ Profile saved successfully!');
      setMessageType('success');
      setFormData({
        full_name: data.full_name || '',
        batch: data.batch || '',
        course: data.course || '',
        avatar_url: data.avatar_url || '',
      });
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
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold">My Profile</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Update your personal information and profile picture.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden border-4 border-indigo-50 flex items-center justify-center">
                {formData.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture Link (URL)
                </label>
                <input
                  type="url"
                  placeholder="Paste your image link here..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.avatar_url}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar_url: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name
              </label>
              <input
                type="text"
                placeholder="e.g. Web Development, Graphic Design"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
              />
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                placeholder="e.g. Batch-15"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl text-sm font-medium ${
                  messageType === 'error'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {message}
              </div>
            )}

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