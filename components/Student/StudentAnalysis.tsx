
import React, { useState, useEffect, useRef } from 'react';
import { TestResult, User } from '../../types';
import { getAiCoaching } from '../../services/geminiService';
import Loader from '../UI/Loader';

interface StudentAnalysisProps {
  user: User;
}

export const StudentAnalysis: React.FC<StudentAnalysisProps> = ({ user }) => {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'ai', text: string}[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history from local storage
    const storedHistory = localStorage.getItem('exam_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Error parsing history", e);
      }
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userMsg = aiQuery;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiQuery('');
    setLoadingAi(true);

    const aiResponse = await getAiCoaching(history, userMsg);
    
    setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    setLoadingAi(false);
  };

  const calculateOverallStats = () => {
    if (history.length === 0) return { totalTests: 0, avgScore: 0, bestSubject: 'N/A' };
    
    const totalTests = history.length;
    const avgScore = Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / totalTests);
    
    // Find most frequent strongest section
    const subjects: {[key: string]: number} = {};
    history.forEach(h => {
        subjects[h.strongestSection] = (subjects[h.strongestSection] || 0) + 1;
    });
    const bestSubject = Object.entries(subjects).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { totalTests, avgScore, bestSubject };
  };

  const stats = calculateOverallStats();

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 font-serif">Deep Dive Analysis</h2>
        <p className="text-gray-600">Performance tracking & Dedicated AI Coaching for {user.name}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: STATS & HISTORY */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500">
                 <p className="text-xs font-bold text-gray-500 uppercase">Tests Attempted</p>
                 <p className="text-3xl font-bold text-gray-900">{stats.totalTests}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
                 <p className="text-xs font-bold text-gray-500 uppercase">Avg. Accuracy</p>
                 <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
                 <p className="text-xs font-bold text-gray-500 uppercase">Strongest Subject</p>
                 <p className="text-2xl font-bold text-gray-900 truncate">{stats.bestSubject}</p>
              </div>
           </div>

           {/* Performance Graph (Simple Visual) */}
           <div className="glass-panel p-6 rounded-2xl shadow-md">
             <h3 className="font-bold text-gray-900 mb-4">Performance Trend</h3>
             {history.length > 0 ? (
               <div className="h-40 flex items-end gap-2">
                 {history.slice(-10).map((test, idx) => (
                   <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        className={`w-full rounded-t-md transition-all ${test.accuracy >= 70 ? 'bg-green-400' : test.accuracy >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ height: `${Math.max(test.accuracy, 5)}%` }}
                      ></div>
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                         {test.examTitle}: {test.accuracy}%
                         <br/>
                         {new Date(test.date).toLocaleDateString()}
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="h-40 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                 No test data available. Take a quiz to see trends.
               </div>
             )}
             <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Oldest</span>
                <span>Latest</span>
             </div>
           </div>

           {/* Detailed History Table */}
           <div className="glass-panel p-6 rounded-2xl shadow-md overflow-hidden">
             <h3 className="font-bold text-gray-900 mb-4">Exam History</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Exam</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Weak Area</th>
                        <th className="px-4 py-3 rounded-r-lg">Accuracy</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {history.length > 0 ? (
                        [...history].reverse().map(test => (
                          <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                             <td className="px-4 py-3 font-medium text-gray-900">{test.examTitle}</td>
                             <td className="px-4 py-3 text-gray-500">{new Date(test.date).toLocaleDateString()}</td>
                             <td className="px-4 py-3 font-bold">{test.score} / {test.totalScore}</td>
                             <td className="px-4 py-3 text-red-500">{test.weakestSection || '-'}</td>
                             <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${test.accuracy >= 75 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                   {test.accuracy}%
                                </span>
                             </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No history found.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: DD AI ASSISTANT */}
        <div className="lg:col-span-1">
           <div className="sticky top-24 h-[600px] flex flex-col glass-panel rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
              <div className="bg-indigo-600 p-4 text-white shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
                    <div>
                       <h3 className="font-bold text-sm">DD AI Assistant</h3>
                       <p className="text-indigo-200 text-xs">Dedicated Performance Coach</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
                 <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-sm text-gray-800 shadow-sm max-w-[90%]">
                       Hi {user.name}! I have access to your full exam history. Ask me anything like "How can I improve in Physics?" or "Analyze my last test".
                    </div>
                 </div>
                 
                 {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`p-3 rounded-2xl text-sm max-w-[90%] shadow-sm ${
                          msg.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                       }`}>
                          {msg.text}
                       </div>
                    </div>
                 ))}
                 
                 {loadingAi && (
                    <div className="flex justify-start">
                       <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                          <div className="flex gap-1">
                             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                             <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                          </div>
                       </div>
                    </div>
                 )}
                 <div ref={chatBottomRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                 <form onSubmit={handleAiAsk} className="flex gap-2">
                    <input 
                      type="text" 
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask about your performance..."
                      className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      disabled={loadingAi || !aiQuery.trim()}
                      className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                       ➤
                    </button>
                 </form>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
