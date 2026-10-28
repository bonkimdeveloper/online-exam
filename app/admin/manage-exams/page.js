'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, BookOpen, Tag, PlusCircle } from 'lucide-react';

export default function ManageExamsAndQuestions() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [examDate, setExamDate] = useState('');
  const [duration, setDuration] = useState('');

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [manualData, setManualData] = useState({
    question_text: '', opt1: '', opt2: '', opt3: '', opt4: '', correct_answer: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('id, title').order('created_at', { ascending: false });
    if (data) setExams(data);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const newExam = {
      title,
      category,
      exam_date: examDate,
      duration_minutes: parseInt(duration), 
    };

    const { error } = await supabase.from('exams').insert([newExam]);

    if (error) {
      setMessage({ type: 'error', text: '❌ এক্সাম তৈরি করতে সমস্যা হয়েছে!' });
      console.error("Exam Create Error:", error);
    } else {
      setMessage({ type: 'success', text: '✅ এক্সাম সফলভাবে তৈরি হয়েছে! এবার নিচের অপশন থেকে প্রশ্ন অ্যাড করুন।' });
      setTitle(''); setCategory(''); setExamDate(''); setDuration('');
      fetchExams();
    }
    setLoading(false);
  };

  const handleManualSubmit = async () => {
    if (!selectedExam) return setMessage({ type: 'error', text: '❌ আগে নিচের ড্রপডাউন থেকে একটি এক্সাম সিলেক্ট করুন!' });
    if (!manualData.question_text || !manualData.correct_answer) return setMessage({ type: 'error', text: '❌ প্রশ্ন এবং সঠিক উত্তর দেওয়া বাধ্যতামূলক!' });

    setLoading(true);
    // আপনার ডাটাবেসের কলাম স্ট্রাকচার অনুযায়ী ম্যাপ করা হলো
    const newQuestion = {
      exam_id: selectedExam,
      question_text: manualData.question_text,
      option_a: manualData.opt1,
      option_b: manualData.opt2,
      option_c: manualData.opt3,
      option_d: manualData.opt4,
      options: JSON.stringify([manualData.opt1, manualData.opt2, manualData.opt3, manualData.opt4]),
      correct_answer: manualData.correct_answer
    };

    const { error } = await supabase.from('questions').insert([newQuestion]);
    
    if (!error) {
      setMessage({ type: 'success', text: '✅ প্রশ্ন সফলভাবে যুক্ত হয়েছে!' });
      setManualData({ question_text: '', opt1: '', opt2: '', opt3: '', opt4: '', correct_answer: '' });
    } else {
      console.error(error);
      setMessage({ type: 'error', text: '❌ প্রশ্ন যুক্ত করতে সমস্যা হয়েছে।' });
    }
    setLoading(false);
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedExam) return setMessage({ type: 'error', text: '❌ আগে নিচের ড্রপডাউন থেকে একটি এক্সাম সিলেক্ট করুন!' });

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^\uFEFF/, '').toLowerCase(),
      complete: async (results) => {
        try {
          const questions = results.data.map((row) => {
            const qText = row.question_text || row.question || Object.values(row)[0];
            const opt1 = row.option1 || row.opt1 || '';
            const opt2 = row.option2 || row.opt2 || '';
            const opt3 = row.option3 || row.opt3 || '';
            const opt4 = row.option4 || row.opt4 || '';
            const correct = row.correct_answer || row.answer || row.correct || '';

            return {
              exam_id: selectedExam,
              question_text: qText,
              option_a: opt1,
              option_b: opt2,
              option_c: opt3,
              option_d: opt4,
              options: JSON.stringify([opt1, opt2, opt3, opt4]),
              correct_answer: correct,
            };
          });

          if (!questions.length || !questions[0].question_text) {
            throw new Error('Invalid CSV format');
          }

          const { error } = await supabase.from('questions').insert(questions);
          if (error) throw error;
          
          setMessage({ type: 'success', text: `✅ সফলভাবে ${questions.length} টি প্রশ্ন যুক্ত হয়েছে!` });
          e.target.value = '';
        } catch (error) {
          console.error("CSV Upload Error:", error);
          setMessage({ type: 'error', text: '❌ আপলোডে এরর! CSV ফাইলের কলামগুলো ঠিক আছে কিনা চেক করুন।' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-4 font-sans">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Manage Exams & Question Bank</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
        <h2 className="text-xl font-bold text-indigo-700 mb-4 border-b pb-2">Step 1: Create New Exam</h2>
        <form onSubmit={handleCreateExam} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Title</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Web Development Final Quiz" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., HTML, CSS" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type="datetime-local" required value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (Minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input type="number" min="1" required value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 30" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors disabled:opacity-70">
            <PlusCircle className="h-5 w-5" /> Create Exam
          </button>
        </form>
      </div>

      <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-teal-700 mb-4 border-b pb-2">Step 2: Add Questions to Exam</h2>
        
        <div className="mb-8">
          <label className="block text-sm font-bold text-teal-800 mb-2">Select Target Exam</label>
          <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="w-full p-3 rounded-lg border border-teal-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm">
            <option value="">-- Select Exam from Dropdown --</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-teal-700 mb-4">A. Manual Entry</h3>
            <textarea placeholder="Type question here..." value={manualData.question_text} onChange={(e) => setManualData({...manualData, question_text: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg mb-4 h-24 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"></textarea>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Option 1" value={manualData.opt1} onChange={(e) => setManualData({...manualData, opt1: e.target.value})} className="p-2 border rounded-lg focus:outline-none focus:border-teal-500" />
              <input type="text" placeholder="Option 2" value={manualData.opt2} onChange={(e) => setManualData({...manualData, opt2: e.target.value})} className="p-2 border rounded-lg focus:outline-none focus:border-teal-500" />
              <input type="text" placeholder="Option 3" value={manualData.opt3} onChange={(e) => setManualData({...manualData, opt3: e.target.value})} className="p-2 border rounded-lg focus:outline-none focus:border-teal-500" />
              <input type="text" placeholder="Option 4" value={manualData.opt4} onChange={(e) => setManualData({...manualData, opt4: e.target.value})} className="p-2 border rounded-lg focus:outline-none focus:border-teal-500" />
            </div>
            <select value={manualData.correct_answer} onChange={(e) => setManualData({...manualData, correct_answer: e.target.value})} className="w-full p-3 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 focus:outline-none font-medium mb-4">
              <option value="">Select Correct Answer</option>
              {manualData.opt1 && <option value={manualData.opt1}>{manualData.opt1}</option>}
              {manualData.opt2 && <option value={manualData.opt2}>{manualData.opt2}</option>}
              {manualData.opt3 && <option value={manualData.opt3}>{manualData.opt3}</option>}
              {manualData.opt4 && <option value={manualData.opt4}>{manualData.opt4}</option>}
            </select>
            <button onClick={handleManualSubmit} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">Save Question</button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-teal-700 mb-4">B. Bulk Upload (.csv)</h3>
            <label className="border-2 border-dashed border-teal-300 rounded-xl flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-teal-50 transition-colors">
              <span className="text-teal-600 font-medium text-center px-4">Click or Drop CSV file here<br/><span className="text-xs font-normal text-slate-500 mt-2 block">(First select an exam from dropdown)</span></span>
              <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} disabled={loading} />
            </label>
            <p className="text-[11px] text-slate-400 mt-4 text-center leading-relaxed">
              CSV কলামের নাম হুবহু এগুলো হতে হবে: <br/><b>question_text, option1, option2, option3, option4, correct_answer</b>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}