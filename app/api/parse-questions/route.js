import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // দ্রুত ও কম খরচের জন্য
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant. Extract multiple-choice questions from the given text. Return ONLY a valid JSON array of objects. Each object must have exactly these keys: "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer". Do not include any markdown formatting like \`\`\`json or extra text.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    // AI এর দেওয়া টেক্সটকে JSON এ রূপান্তর
    const questions = JSON.parse(data.choices[0].message.content.trim());
    return NextResponse.json(questions);

  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: 'AI দিয়ে প্রশ্ন তৈরি করতে সমস্যা হয়েছে!' }, { status: 500 });
  }
}