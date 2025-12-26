
import React, { useState, useEffect, useCallback } from 'react';
import { generateExamPaper } from '../../services/geminiService';
import Loader from '../UI/Loader';
import { User, TestResult } from '../../types';

type Question = {
  id: number;
  section: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
};

type ExamData = {
  examTitle: string;
  durationMinutes: number;
  sections: string[];
  questions: Question[];
};

interface QuestionGeneratorProps {
  user?: User;
}

export const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({ user }) => {
  const [examType, setExamType] = useState(user?.targetExam || '');
  const [level, setLevel] = useState('Standard');
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [quizState, setQuizState] = useState<'SETUP' | 'INSTRUCTIONS' | 'ACTIVE' | 'TERMINATED' | 'RESULT'>('SETUP');
  
  // Exam Execution State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({}); // qId -> optionIndex
  const [timeLeft, setTimeLeft] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const [malpracticeCount, setMalpracticeCount] = useState(0);

  const QUESTION_COUNT = 30; // Increased count

  // Tab Switching Detection
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && quizState === 'ACTIVE') {
      setMalpracticeCount(prev => prev + 1);
    }
  }, [quizState]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleVisibilityChange]);

  useEffect(() => {
    if (malpracticeCount > 0 && quizState === 'ACTIVE') {
      if (malpracticeCount >= 3) {
        // Disqualify Logic
        const result: TestResult = {
            id: Math.random().toString(36).substr(2, 9),
            examTitle: examData?.examTitle || examType,
            date: Date.now(),
            score: 0,
            totalScore: (examData?.questions.length || 0) * 4,
            accuracy: 0,
            correctCount: 0,
            incorrectCount: 0,
            unattemptedCount: examData?.questions.length || 0,
            weakestSection: 'DISQUALIFIED (Malpractice)',
            strongestSection: 'N/A'
        };
        try {
            const history = JSON.parse(localStorage.getItem('exam_history') || '[]');
            history.push(result);
            localStorage.setItem('exam_history', JSON.stringify(history));
        } catch(e) { console.error(e); }
        
        setQuizState('TERMINATED');
      } else {
        alert(`⚠️ WARNING ${malpracticeCount}/2: Tab switching detected! \n\nExam integrity protocols are active. Switching tabs or minimizing the window is prohibited.\n\nIf you switch tabs again, your exam may be automatically terminated.`);
      }
    }
  }, [malpracticeCount, quizState, examData, examType]);

  // Timer
  useEffect(() => {
    let timer: any;
    if (quizState === 'ACTIVE' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  // Filter exams based on user level
  const getAvailableExams = () => {
    if (!user) return ['JEE Mains', 'NEET UG', 'UPSC CSE', 'GATE'];
    
    const schoolExams = ['JEE Mains', 'JEE Advanced', 'NEET UG', 'CLAT', 'Boards'];
    const collegeExams = ['UPSC CSE', 'GATE', 'CAT', 'SSC CGL', 'IBPS PO', 'GRE'];

    if (user.educationLevel?.includes('Class')) return schoolExams;
    return collegeExams;
  };

  const handleStartGenerate = async () => {
    if (!examType) return;
    setLoading(true);
    // Request 30 questions
    const data = await generateExamPaper(examType, level, QUESTION_COUNT);
    if (data) {
      setExamData(data);
      setLoading(false);
      setQuizState('INSTRUCTIONS');
    } else {
      setLoading(false);
      alert("Failed to generate exam paper. Try again.");
    }
  };

  const startExam = () => {
    if (examData) {
      // 1 minute per question for estimation
      setTimeLeft(QUESTION_COUNT * 60); 
      setActiveSection(examData.sections[0]);
      setMalpracticeCount(0); // Reset count
      setQuizState('ACTIVE');
      enterFullScreen();
    }
  };

  const enterFullScreen = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) docEl.requestFullscreen().catch(err => console.log(err));
  };

  const calculateScore = () => {
    if (!examData) return { score: 0, total: 0 };
    let score = 0;
    examData.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionIndex) score += 4; // Standard +4
      else if (answers[q.id] !== undefined) score -= 1; // Standard -1
    });
    return { score, total: examData.questions.length * 4 };
  };

  const handleSubmitExam = () => {
    if (!examData) return;

    // 1. Calculate stats
    const { score, total } = calculateScore();
    const correctCount = examData.questions.filter(q => answers[q.id] === q.correctOptionIndex).length;
    const incorrectCount = examData.questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctOptionIndex).length;
    const unattemptedCount = examData.questions.length - Object.keys(answers).length;
    const accuracy = Object.keys(answers).length > 0 ? (correctCount / Object.keys(answers).length) * 100 : 0;

    // 2. Identify Weak/Strong Sections
    const sectionStats: {[key: string]: {correct: number, total: number}} = {};
    examData.questions.forEach(q => {
        if (!sectionStats[q.section]) sectionStats[q.section] = { correct: 0, total: 0 };
        sectionStats[q.section].total++;
        if (answers[q.id] === q.correctOptionIndex) {
            sectionStats[q.section].correct++;
        }
    });

    let weakestSection = '';
    let weakestAcc = 101;
    let strongestSection = '';
    let strongestAcc = -1;

    Object.entries(sectionStats).forEach(([sec, stats]) => {
        const acc = (stats.correct / stats.total) * 100;
        if (acc < weakestAcc) { weakestAcc = acc; weakestSection = sec; }
        if (acc > strongestAcc) { strongestAcc = acc; strongestSection = sec; }
    });

    // 3. Create Result Object
    const result: TestResult = {
        id: Math.random().toString(36).substr(2, 9),
        examTitle: examData.examTitle || examType,
        date: Date.now(),
        score,
        totalScore: total,
        accuracy: Math.round(accuracy),
        correctCount,
        incorrectCount,
        unattemptedCount,
        weakestSection,
        strongestSection
    };

    // 4. Save to LocalStorage
    try {
        const history = JSON.parse(localStorage.getItem('exam_history') || '[]');
        history.push(result);
        localStorage.setItem('exam_history', JSON.stringify(history));
    } catch(e) {
        console.error("Failed to save result", e);
    }

    setQuizState('RESULT');
    if (document.fullscreenElement) document.exitFullscreen().catch(err => console.log(err));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredQuestions = () => {
    if (!examData) return [];
    if (!activeSection) return examData.questions;
    return examData.questions.filter(q => q.section === activeSection);
  };

  // --- RENDERERS ---

  if (quizState === 'SETUP') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-20">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-2 font-serif">AI Exam Simulator</h2>
          <p className="text-gray-600">
             {user ? `Personalized for ${user.educationLevel}` : 'Select your exam'}. 
             AI will generate a strict {QUESTION_COUNT}-question paper.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {getAvailableExams().map(exam => (
             <button
               key={exam}
               onClick={() => setExamType(exam)}
               className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${examType === exam ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
             >
               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${examType === exam ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                 {exam[0]}
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">{exam}</h3>
                 <p className="text-xs text-gray-500">Full Simulation ({QUESTION_COUNT} Qs)</p>
               </div>
             </button>
          ))}
        </div>

        {examType && (
          <div className="mt-8 max-w-2xl mx-auto animate-fade-in">
             <div className="glass-panel p-6 rounded-2xl">
               <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
               <div className="flex gap-4 mb-6">
                 {['Standard', 'Hard', 'Olympiad/Ranker'].map(l => (
                   <button 
                     key={l} 
                     onClick={() => setLevel(l)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${level === l ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                   >
                     {l}
                   </button>
                 ))}
               </div>
               
               <button 
                 onClick={handleStartGenerate} 
                 disabled={loading}
                 className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
               >
                 {loading ? <><Loader /> Setting Paper...</> : 'Proceed to Exam Hall'}
               </button>
             </div>
          </div>
        )}
      </div>
    );
  }

  if (quizState === 'INSTRUCTIONS') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full glass-panel p-8 rounded-2xl shadow-2xl border-t-8 border-yellow-400">
           <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Instructions</h2>
           
           <div className="space-y-4 mb-8 text-gray-700 text-sm leading-relaxed">
             <div className="flex gap-3">
               <span className="text-2xl">🚫</span>
               <p><strong>Strict Anti-Cheating:</strong> Switching tabs or minimizing the window will result in a warning. 3 attempts will auto-terminate and disqualify the exam.</p>
             </div>
             <div className="flex gap-3">
               <span className="text-2xl">⏳</span>
               <p><strong>Timer:</strong> The clock starts immediately ({Math.floor(QUESTION_COUNT)} Mins). The exam auto-submits when time reaches zero.</p>
             </div>
             <div className="flex gap-3">
               <span className="text-2xl">🖥️</span>
               <p><strong>Fullscreen:</strong> The exam is best experienced in fullscreen mode. We will attempt to enable it.</p>
             </div>
           </div>

           <div className="bg-gray-100 p-4 rounded-lg flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                <svg className="w-full h-full text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
             </div>
             <div>
               <p className="font-bold text-gray-900">Candidate: {user?.name || 'Student'}</p>
               <p className="text-xs text-gray-500">{examType} • {level}</p>
             </div>
           </div>

           <div className="flex gap-4">
             <button onClick={() => setQuizState('SETUP')} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
             <button onClick={startExam} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700">I Agree & Start</button>
           </div>
        </div>
      </div>
    );
  }

  if (quizState === 'ACTIVE' && examData) {
    const currentQuestions = getFilteredQuestions();
    // Safety check for empty sections
    const activeQ = currentQuestions[currentQuestionIndex] || examData.questions[0];

    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col h-screen">
        {/* CBT Header */}
        <div className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shadow-md shrink-0">
          <div className="font-bold text-lg tracking-wide">{examData.examTitle}</div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">Time Remaining</span>
                <span className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
             </div>
             <button onClick={handleSubmitExam} className="px-4 py-1 bg-red-600 text-sm font-bold rounded hover:bg-red-700">Submit Exam</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Question Area */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
             {/* Section Tabs */}
             <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
               {examData.sections.map(sec => (
                 <button
                   key={sec}
                   onClick={() => { setActiveSection(sec); setCurrentQuestionIndex(0); }}
                   className={`px-4 py-2 rounded-t-lg font-bold text-sm whitespace-nowrap ${activeSection === sec ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                 >
                   {sec}
                 </button>
               ))}
             </div>

             {activeQ ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex-1">
                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-bold text-gray-500">Question {currentQuestionIndex + 1}</span>
                    <span className="text-sm font-bold text-green-600">+4.0 / -1.0</span>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">{activeQ.questionText}</h3>
                  
                  <div className="space-y-4 max-w-3xl">
                    {activeQ.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAnswers({...answers, [activeQ.id]: idx})}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                          answers[activeQ.id] === idx 
                          ? 'border-indigo-600 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                          answers[activeQ.id] === idx ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-gray-800 font-medium group-hover:text-gray-900">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
             ) : (
               <div className="flex-1 flex items-center justify-center text-gray-400">Select a section to view questions.</div>
             )}

             <div className="mt-6 flex justify-between items-center">
                <button 
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setAnswers(prev => { const n = {...prev}; delete n[activeQ.id]; return n; })} 
                     className="px-6 py-3 text-red-600 font-bold hover:bg-red-50 rounded-lg"
                   >
                     Clear Response
                   </button>
                   <button 
                     onClick={() => setCurrentQuestionIndex(Math.min(currentQuestions.length - 1, currentQuestionIndex + 1))}
                     className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md"
                   >
                     Save & Next
                   </button>
                </div>
             </div>
          </div>

          {/* Right Sidebar: Question Palette */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                     <svg className="w-full h-full text-gray-400 p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  <div className="leading-tight">
                    <p className="font-bold text-sm">{user?.name || 'Student'}</p>
                    <p className="text-xs text-gray-500">Candidate</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                 <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Answered</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 border border-gray-300 rounded-sm"></span> Not Visited</div>
               </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
               <p className="text-xs font-bold text-gray-500 uppercase mb-3">Questions Palette</p>
               <div className="grid grid-cols-5 gap-2">
                 {currentQuestions.map((q, idx) => {
                   const isAnswered = answers[q.id] !== undefined;
                   const isCurrent = idx === currentQuestionIndex;
                   return (
                     <button
                       key={q.id}
                       onClick={() => setCurrentQuestionIndex(idx)}
                       className={`h-10 rounded-md font-bold text-sm transition-all border ${
                         isCurrent 
                         ? 'ring-2 ring-indigo-500 ring-offset-1 border-indigo-500' 
                         : isAnswered 
                           ? 'bg-green-500 text-white border-green-600' 
                           : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                       }`}
                     >
                       {idx + 1}
                     </button>
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'TERMINATED') {
    return (
      <div className="fixed inset-0 z-50 bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md border-t-8 border-red-600">
           <div className="text-6xl mb-4">🚨</div>
           <h2 className="text-3xl font-bold text-red-700 mb-2">Exam Disqualified</h2>
           <p className="text-gray-600 mb-8">Multiple instances of tab switching detected. Your session has been disqualified according to anti-malpractice protocols.</p>
           <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (quizState === 'RESULT') {
    const { score, total } = calculateScore();
    const percent = Math.round((score/total)*100);

    return (
      <div className="max-w-4xl mx-auto py-10 animate-fade-in">
         <div className="glass-panel p-8 rounded-3xl shadow-xl text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{examData?.examTitle} Result</h2>
            <div className="text-6xl font-black text-indigo-600 mb-2">{score} <span className="text-2xl text-gray-400 font-normal">/ {total}</span></div>
            <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold text-sm mb-8">
               {percent}% Accuracy
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
               <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-xs font-bold text-green-700 uppercase">Correct</p>
                  <p className="text-2xl font-bold text-green-900">{Object.keys(answers).filter(id => answers[parseInt(id)] === examData?.questions.find(q => q.id === parseInt(id))?.correctOptionIndex).length}</p>
               </div>
               <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-xs font-bold text-red-700 uppercase">Incorrect</p>
                  <p className="text-2xl font-bold text-red-900">{Object.keys(answers).filter(id => answers[parseInt(id)] !== examData?.questions.find(q => q.id === parseInt(id))?.correctOptionIndex).length}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase">Unattempted</p>
                  <p className="text-2xl font-bold text-gray-900">{examData ? examData.questions.length - Object.keys(answers).length : 0}</p>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="font-bold text-xl text-gray-900 ml-2">Detailed Analysis</h3>
            {examData?.questions.map((q, idx) => {
               const userAnswer = answers[q.id];
               const isCorrect = userAnswer === q.correctOptionIndex;
               const isSkipped = userAnswer === undefined;

               return (
                 <div key={q.id} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${isCorrect ? 'border-green-500' : isSkipped ? 'border-gray-300' : 'border-red-500'}`}>
                    <div className="flex justify-between mb-2">
                       <span className="text-xs font-bold uppercase text-gray-400">{q.section}</span>
                       <span className={`text-xs font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                          {isCorrect ? '+4 Marks' : isSkipped ? '0 Marks' : '-1 Mark'}
                       </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-4">{idx + 1}. {q.questionText}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                       {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-2 rounded text-sm flex items-center gap-2 ${
                             oIdx === q.correctOptionIndex 
                             ? 'bg-green-100 text-green-900 font-bold' 
                             : oIdx === userAnswer 
                               ? 'bg-red-100 text-red-900 line-through' 
                               : 'bg-gray-50 text-gray-600'
                          }`}>
                             <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/50 text-xs border border-black/10">{String.fromCharCode(65 + oIdx)}</span>
                             {opt}
                          </div>
                       ))}
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-900">
                       <span className="font-bold">Explanation:</span> {q.explanation}
                    </div>
                 </div>
               );
            })}
         </div>
         
         <div className="mt-8 text-center pb-20">
            <button onClick={() => setQuizState('SETUP')} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full shadow-lg">Take Another Test</button>
         </div>
      </div>
    );
  }

  return null;
};
