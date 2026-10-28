'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Clock, Award } from 'lucide-react';

function ExamContent() {
  const params = useParams();
  const examId = params.id;
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!examId) return;
    const fetchExamData = async () => {
      setLoading(true);
      const { data: examData } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examData) {
        setExam(examData);
        setTimeLeft(examData.duration_minutes * 60);
      }

      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId);

      if (qData) {
        setQuestions(qData);
      }
      setLoading(false);
    };

    fetchExamData();
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleOptionSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmitExam = async () => {
    if (submitted) return;
    setSubmitted(true);

    let score = 0;
    const totalQuestions = questions.length;

    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        score += 1;
      }
    });

    const examResult = {
      score,
      totalQuestions,
      percentage: totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0,
    };

    setResult(examResult);

    await supabase.from('results').insert([
      {
        exam_id: examId,
        score: score,
        total_questions: totalQuestions,
      },
    ]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center py-20 text-lg font-semibold text-slate-600">Loading Exam...</div>;
  }

  if (!exam) {
    return <div className="text-center py-20 text-rose-600 font-bold">Exam not found!</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-col md:flex-row justify-between items-center sticky top-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{exam.title}</h1>
          <p className="text-sm text-slate-500">Category: {exam.category}</p>
        </div>
        {!submitted && (
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl font-bold border border-rose-200">
            <Clock className="h-5 w-5 animate-pulse" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-8 text-center">
          <Award className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Exam Submitted Successfully!</h2>
          <p className="text-slate-600 mb-6">Here is your performance summary:</p>
          
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border">
              <p className="text-xs text-slate-500 font-semibold">Total Questions</p>
              <p className="text-2xl font-bold text-slate-800">{result.totalQuestions}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-600 font-semibold">Correct Answers</p>
              <p className="text-2xl font-bold text-emerald-700">{result.score}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <p className="text-xs text-indigo-600 font-semibold">Score (%)</p>
              <p className="text-2xl font-bold text-indigo-700">{result.percentage}%</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/admin/manage-exams')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, index) => {
            // সেফটি চেকসহ অপশন পার্স করার লজিক
            let optionsList = [];
            try {
              if (Array.isArray(q.options)) {
                optionsList = q.options;
              } else if (typeof q.options === 'string') {
                const parsed = JSON.parse(q.options);
                optionsList = Array.isArray(parsed) ? parsed : [];
              } else {
                optionsList = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
              }
            } catch (err) {
              optionsList = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
            }

            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {index + 1}. {q.question_text}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {optionsList.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        answers[q.id] === opt
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-medium shadow-sm'
                          : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleOptionSelect(q.id, opt)}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={handleSubmitExam}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-colors text-lg"
          >
            Submit Exam Now
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudentExamPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading Exam Page...</div>}>
      <ExamContent />
    </Suspense>
  );
}