
import React, { useState } from 'react';
import { User, ProfessionalSolution, ExecutiveBrief, MarketTrend, DecisionMatrix, SkillGapPlan } from '../../types';
import { 
    solveProfessionalProblem, 
    generateExecutiveBrief, 
    analyzeMarketTrends, 
    generateDecisionMatrix, 
    generateSkillGapPlan 
} from '../../services/geminiService';
import { LibraryAssistant } from '../Library/LibraryAssistant';
import { MOCK_LIBRARY_INVENTORY } from '../../constants';
import Loader from '../UI/Loader';

interface ProfessionalDashboardProps {
  user: User;
}

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'CONSULTANT' | 'BRIEF' | 'TRENDS' | 'DECISION' | 'SKILLS'>('LIBRARY');
  const [loading, setLoading] = useState(false);

  // Consultant State
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState<ProfessionalSolution | null>(null);

  // Brief State
  const [briefTopic, setBriefTopic] = useState('');
  const [briefContext, setBriefContext] = useState('');
  const [briefResult, setBriefResult] = useState<ExecutiveBrief | null>(null);

  // Trends State
  const [trendIndustry, setTrendIndustry] = useState(user.profession || '');
  const [trendResults, setTrendResults] = useState<MarketTrend[]>([]);

  // Decision State
  const [decisionContext, setDecisionContext] = useState('');
  const [decisionOptions, setDecisionOptions] = useState('');
  const [decisionResult, setDecisionResult] = useState<DecisionMatrix | null>(null);

  // Skills State
  const [targetRole, setTargetRole] = useState('');
  const [skillPlan, setSkillPlan] = useState<SkillGapPlan | null>(null);

  // --- Handlers ---

  const handleSolve = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setSolution(null);
    const result = await solveProfessionalProblem(problem);
    setSolution(result);
    setLoading(false);
  };

  const handleBrief = async () => {
    if (!briefTopic.trim()) return;
    setLoading(true);
    setBriefResult(null);
    const result = await generateExecutiveBrief(briefTopic, briefContext);
    setBriefResult(result);
    setLoading(false);
  };

  const handleTrends = async () => {
    if (!trendIndustry.trim()) return;
    setLoading(true);
    setTrendResults([]);
    const result = await analyzeMarketTrends(trendIndustry);
    setTrendResults(result);
    setLoading(false);
  };

  const handleDecision = async () => {
    if (!decisionContext.trim() || !decisionOptions.trim()) return;
    setLoading(true);
    setDecisionResult(null);
    const optionsArray = decisionOptions.split(',').map(s => s.trim()).filter(s => s);
    const result = await generateDecisionMatrix(decisionContext, optionsArray);
    setDecisionResult(result);
    setLoading(false);
  };

  const handleSkillPlan = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setSkillPlan(null);
    const profile = { currentRole: user.profession, targetRole: targetRole, education: user.educationLevel };
    const result = await generateSkillGapPlan(profile);
    setSkillPlan(result);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pt-6 pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 font-serif">Executive Hub</h2>
            <p className="text-slate-500">Leverage intelligence to drive business decisions.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-1">
            {[
                { id: 'LIBRARY', label: 'Inventory', icon: '📚' },
                { id: 'CONSULTANT', label: 'Problem Solver', icon: '🧠' },
                { id: 'BRIEF', label: 'Briefing Room', icon: '📑' },
                { id: 'TRENDS', label: 'Market Watch', icon: '📈' },
                { id: 'DECISION', label: 'Strategy Board', icon: '♟️' },
                { id: 'SKILLS', label: 'Career Architect', icon: '🚀' },
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* --- TAB CONTENT --- */}

      {activeTab === 'LIBRARY' && (
          <LibraryAssistant user={user} />
      )}

      {activeTab === 'CONSULTANT' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
              {/* Input Section */}
              <div className="md:col-span-4 space-y-6">
                  <div className="glass-panel p-8 rounded-3xl shadow-xl border-t-4 border-amber-500">
                      <div className="mb-6">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">The Problem Solver</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                              Describe a real-world professional challenge. 
                              Our AI will scan the library inventory to find books with the exact frameworks to solve it.
                          </p>
                      </div>

                      <textarea 
                          value={problem}
                          onChange={(e) => setProblem(e.target.value)}
                          placeholder="e.g. My engineering team is struggling with technical debt and missed deadlines. Morale is low."
                          className="w-full h-48 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm resize-none mb-6"
                      />

                      <button 
                          onClick={handleSolve}
                          disabled={loading || !problem}
                          className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                          {loading ? <Loader /> : (
                              <>
                                  <span>Consult Library</span>
                                  <span className="text-xl">📚</span>
                              </>
                          )}
                      </button>
                  </div>
              </div>

              {/* Result Section */}
              <div className="md:col-span-8">
                  {solution ? (
                      <div className="space-y-8 animate-fade-in">
                          {/* Analysis Card */}
                          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
                              <h4 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">AI Diagnosis</h4>
                              <p className="text-slate-700 leading-relaxed text-lg font-serif">
                                  {solution.analysis}
                              </p>
                          </div>

                          {/* Action Plan */}
                          <div className="bg-gradient-to-br from-slate-50 to-amber-50 p-8 rounded-3xl border border-amber-100">
                              <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                  <span className="text-2xl">🛠️</span> Strategic Roadmap
                              </h4>
                              <div className="space-y-6">
                                  {solution.strategySteps.map((step, idx) => (
                                      <div key={idx} className="flex gap-4">
                                          <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                                              {idx + 1}
                                          </div>
                                          <div>
                                              <p className="text-slate-800 font-medium leading-relaxed">{step}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* Recommended Books Grid */}
                          <div>
                              <h4 className="text-lg font-bold text-slate-900 mb-4 ml-2">Referenced Inventory</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {solution.relevantBookIds.map(id => {
                                      const book = MOCK_LIBRARY_INVENTORY.find(b => b.id === id);
                                      if (!book) return null;
                                      return (
                                          <div key={id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                              <div className="w-16 h-24 bg-slate-200 rounded-md shadow-inner flex items-center justify-center text-2xl flex-shrink-0">
                                                  📖
                                              </div>
                                              <div>
                                                  <h5 className="font-bold text-slate-900 line-clamp-1">{book.title}</h5>
                                                  <p className="text-xs text-slate-500 mb-2">{book.author}</p>
                                                  <div className="flex items-center gap-2">
                                                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded">
                                                          {book.available} Available
                                                      </span>
                                                      <span className="text-[10px] text-slate-400">Shelf {id.toUpperCase()}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>

                          {/* Citations */}
                          <div className="bg-slate-900 text-slate-400 p-6 rounded-2xl text-xs font-mono">
                              <p className="uppercase font-bold mb-2 text-slate-500">Citations</p>
                              <ul className="space-y-1">
                                  {solution.citations.map((cite, i) => (
                                      <li key={i}>• {cite}</li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  ) : (
                      <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                          {loading ? (
                              <div className="text-center">
                                  <p className="text-slate-600 font-bold mb-2">Scanning 85,000+ Volumes...</p>
                                  <p className="text-xs">Finding the perfect methodology for your problem.</p>
                              </div>
                          ) : (
                              <>
                                  <div className="text-6xl mb-6 opacity-20 grayscale">🏛️</div>
                                  <h3 className="text-xl font-bold text-slate-500 mb-2">Library Consultant Standing By</h3>
                                  <p className="max-w-xs text-center text-sm">Enter your professional dilemma on the left to unlock wisdom from our inventory.</p>
                              </>
                          )}
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'BRIEF' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl shadow-sm h-fit">
                  <h3 className="font-bold text-slate-900 mb-4">Executive Brief Generator</h3>
                  <div className="space-y-4">
                      <input 
                         type="text" 
                         value={briefTopic} 
                         onChange={(e) => setBriefTopic(e.target.value)}
                         placeholder="Topic (e.g. Q3 Sales Strategy)"
                         className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                      <textarea 
                         value={briefContext}
                         onChange={(e) => setBriefContext(e.target.value)}
                         placeholder="Context / Raw Data..."
                         className="w-full h-32 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                      />
                      <button 
                         onClick={handleBrief}
                         disabled={loading || !briefTopic}
                         className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-black disabled:opacity-50"
                      >
                         {loading ? 'Generating...' : 'Generate BLUF Brief'}
                      </button>
                  </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 min-h-[400px]">
                  {briefResult ? (
                      <div className="space-y-6">
                          <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-indigo-500">
                              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Bottom Line Up Front (BLUF)</p>
                              <p className="text-slate-900 font-medium leading-relaxed">{briefResult.bluf}</p>
                          </div>
                          
                          <div>
                              <h4 className="font-bold text-slate-900 mb-2">Key Insights</h4>
                              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                                  {briefResult.keyPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                              </ul>
                          </div>

                          <div>
                              <h4 className="font-bold text-slate-900 mb-2">Action Items</h4>
                              <ul className="space-y-2">
                                  {briefResult.actionItems.map((item, i) => (
                                      <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-800 bg-green-50 p-2 rounded">
                                          <span className="text-green-600">✓</span> {item}
                                      </li>
                                  ))}
                              </ul>
                          </div>

                          <div className="flex justify-end">
                              <div className="text-right">
                                  <p className="text-xs font-bold text-slate-400 uppercase">Projected ROI</p>
                                  <p className="text-2xl font-bold text-green-600">{briefResult.roiEstimate}</p>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400"><div className="text-4xl mb-4">📑</div><p>Executive briefs appear here.</p></div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'TRENDS' && (
          <div className="animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl shadow-sm mb-8 flex gap-4">
                  <input 
                     type="text" 
                     value={trendIndustry} 
                     onChange={(e) => setTrendIndustry(e.target.value)}
                     placeholder="Industry (e.g. Fintech, Biotechnology)"
                     className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                     onClick={handleTrends}
                     disabled={loading || !trendIndustry}
                     className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                     {loading ? 'Analyzing...' : 'Scan Market'}
                  </button>
              </div>

              {trendResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trendResults.map((trend, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden group">
                              <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl ${
                                  trend.status === 'HYPE' ? 'bg-purple-100 text-purple-800' : 
                                  trend.status === 'ADOPT' ? 'bg-blue-100 text-blue-800' : 
                                  trend.status === 'MATURE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                  {trend.status}
                              </div>
                              <h4 className="font-bold text-lg text-slate-900 mb-2 pr-12">{trend.trendName}</h4>
                              <p className="text-sm text-slate-600 leading-relaxed mb-4">{trend.description}</p>
                              {trend.sourceUrl && (
                                  <a href={trend.sourceUrl} className="text-xs text-indigo-500 font-bold hover:underline">View Source →</a>
                              )}
                          </div>
                      ))}
                  </div>
              ) : (
                  !loading && <div className="text-center text-slate-400 py-20"><p>Enter an industry to see market intelligence.</p></div>
              )}
          </div>
      )}

      {activeTab === 'DECISION' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl shadow-sm h-fit">
                  <h3 className="font-bold text-slate-900 mb-4">Strategic Matrix</h3>
                  <div className="space-y-4">
                      <textarea 
                         value={decisionContext}
                         onChange={(e) => setDecisionContext(e.target.value)}
                         placeholder="Decision Context (e.g. Choosing a Cloud Provider for AI workload)"
                         className="w-full h-24 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm resize-none"
                      />
                      <input 
                         type="text" 
                         value={decisionOptions}
                         onChange={(e) => setDecisionOptions(e.target.value)}
                         placeholder="Options (comma separated e.g. AWS, Azure, GCP)"
                         className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
                      />
                      <button 
                         onClick={handleDecision}
                         disabled={loading || !decisionContext || !decisionOptions}
                         className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-black disabled:opacity-50"
                      >
                         {loading ? 'Evaluating...' : 'Build Matrix'}
                      </button>
                  </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">
                  {decisionResult ? (
                      <div className="p-0">
                          <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                      <tr>
                                          <th className="px-6 py-4">Criteria</th>
                                          {decisionResult.options.map((opt, i) => (
                                              <th key={i} className="px-6 py-4">{opt}</th>
                                          ))}
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {decisionResult.criteria.map((crit, cIdx) => (
                                          <tr key={cIdx}>
                                              <td className="px-6 py-4 font-medium text-slate-900">{crit}</td>
                                              {decisionResult.scores.map((s, sIdx) => (
                                                  <td key={sIdx} className="px-6 py-4">
                                                      <span className={`px-2 py-1 rounded font-bold ${s.scores[cIdx] >= 8 ? 'bg-green-100 text-green-800' : s.scores[cIdx] <= 4 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                          {s.scores[cIdx]}
                                                      </span>
                                                  </td>
                                              ))}
                                          </tr>
                                      ))}
                                      <tr className="bg-slate-50 font-bold">
                                          <td className="px-6 py-4">TOTAL SCORE</td>
                                          {decisionResult.scores.map((s, idx) => (
                                              <td key={idx} className="px-6 py-4 text-indigo-700 text-lg">{s.total}</td>
                                          ))}
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                          <div className="p-6 bg-indigo-50 border-t border-indigo-100">
                              <h4 className="font-bold text-indigo-900 mb-2">AI Recommendation</h4>
                              <p className="text-indigo-800 text-sm leading-relaxed">{decisionResult.recommendation}</p>
                          </div>
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400"><div className="text-4xl mb-4">♟️</div><p>Decision matrix will appear here.</p></div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'SKILLS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl shadow-sm h-fit">
                  <h3 className="font-bold text-slate-900 mb-4">Career Architect</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Role</label>
                          <input type="text" disabled value={user.profession} className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"/>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Role</label>
                          <input 
                             type="text" 
                             value={targetRole}
                             onChange={(e) => setTargetRole(e.target.value)}
                             placeholder="e.g. CTO, Product Director"
                             className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                      </div>
                      <button 
                         onClick={handleSkillPlan}
                         disabled={loading || !targetRole}
                         className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50"
                      >
                         {loading ? 'Planning...' : 'Generate Upskilling Plan'}
                      </button>
                  </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                  {skillPlan ? (
                      <>
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                              <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-bold text-lg text-slate-900">Skill Gap Analysis</h4>
                                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">{skillPlan.timelineWeeks} Week Plan</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  {skillPlan.missingSkills.map((skill, i) => (
                                      <span key={i} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-sm font-medium">{skill}</span>
                                  ))}
                              </div>
                          </div>

                          <div className="space-y-4">
                              <h4 className="font-bold text-slate-900 ml-1">Recommended Reading Path</h4>
                              {skillPlan.booksToRead.map((book, idx) => (
                                  <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex gap-4 hover:shadow-md transition-shadow">
                                      <div className="w-12 h-16 bg-slate-200 rounded flex items-center justify-center text-xl shadow-inner flex-shrink-0">📘</div>
                                      <div>
                                          <h5 className="font-bold text-slate-900">{book.title}</h5>
                                          <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Focus: {book.focusChapter}</p>
                                          <p className="text-sm text-slate-600 leading-snug">{book.reason}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[400px]">
                          <div className="text-4xl mb-4 opacity-50">🚀</div>
                          <p>Define your target role to generate a learning path.</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
