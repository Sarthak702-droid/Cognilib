
import React, { useState } from 'react';
import { User, PeerReviewResult, GrantProposal, MethodStep, JournalRecommendation, StatAdvice, ResearchTrend, PaperSEO, CareerProjection, LiteratureSummary, SearchResult, DetailedComparison } from '../../types';
import { 
    getResearchConsensus, 
    generateLiteratureMatrix, 
    generateHypothesis, 
    analyzePaperDraft, 
    generateGrantProposal,
    extractResearchData,
    generateMethodology,
    recommendJournals,
    suggestStatistics,
    analyzeResearchTrends,
    optimizeAbstractKeywords,
    projectResearchImpact,
    compareSpecificPapers,
    generateLiteratureSummary,
    searchResearchTrends,
    generateDetailedComparison
} from '../../services/geminiService';
import Loader from '../UI/Loader';
import ReactMarkdown from 'react-markdown';
import { LibraryAssistant } from '../Library/LibraryAssistant';

interface ResearcherDashboardProps {
  user: User;
}

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'SEARCH' | 'CONSENSUS' | 'MATRIX' | 'COMPARE' | 'HYPOTHESIS' | 'REVIEW' | 'GRANT' | 'EXTRACT' | 'METHODS' | 'JOURNALS' | 'STATS' | 'ANALYTICS' | 'SUMMARIES'>('LIBRARY');
  const [loading, setLoading] = useState(false);
  
  // Search State
  const [searchTopic, setSearchTopic] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  // Consensus State
  const [query, setQuery] = useState('');
  const [consensusData, setConsensusData] = useState<any>(null);

  // Matrix State
  const [matrixMode, setMatrixMode] = useState<'TOPIC' | 'SPECIFIC'>('TOPIC');
  const [matrixTopic, setMatrixTopic] = useState('');
  const [specificPapers, setSpecificPapers] = useState('');
  const [matrixData, setMatrixData] = useState<any>(null);

  // Compare State
  const [compPaper1, setCompPaper1] = useState('');
  const [compPaper2, setCompPaper2] = useState('');
  const [compResult, setCompResult] = useState<DetailedComparison | null>(null);

  // Summary State
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryResults, setSummaryResults] = useState<LiteratureSummary[]>([]);

  // Hypothesis State
  const [fieldA, setFieldA] = useState('');
  const [fieldB, setFieldB] = useState('');
  const [hypothesis, setHypothesis] = useState<any>(null);

  // Peer Review State
  const [draftText, setDraftText] = useState('');
  const [reviewResult, setReviewResult] = useState<PeerReviewResult | null>(null);

  // Grant State
  const [grantTopic, setGrantTopic] = useState('');
  const [grantAmount, setGrantAmount] = useState('$50,000');
  const [grantResult, setGrantResult] = useState<GrantProposal | null>(null);

  // Extraction State
  const [extractText, setExtractText] = useState('');
  const [extractFields, setExtractFields] = useState('');
  const [extractResult, setExtractResult] = useState<any[]>([]);

  // Methodology State
  const [methodGoal, setMethodGoal] = useState('');
  const [methodResult, setMethodResult] = useState<MethodStep[]>([]);

  // Journal State
  const [abstract, setAbstract] = useState('');
  const [journalResult, setJournalResult] = useState<JournalRecommendation[]>([]);

  // Stats State
  const [variables, setVariables] = useState('');
  const [statResult, setStatResult] = useState<StatAdvice | null>(null);

  // Analytics State
  const [analyticsMode, setAnalyticsMode] = useState<'TRENDS' | 'SEO' | 'IMPACT'>('TRENDS');
  const [trendTopic, setTrendTopic] = useState('');
  const [trendResult, setTrendResult] = useState<ResearchTrend[]>([]);
  const [seoAbstract, setSeoAbstract] = useState('');
  const [seoResult, setSeoResult] = useState<PaperSEO | null>(null);
  const [impactStats, setImpactStats] = useState({ papers: 10, citations: 50 });
  const [impactResult, setImpactResult] = useState<CareerProjection | null>(null);

  // Handlers
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTopic) return;
    setLoading(true);
    setSearchResult(null);
    const result = await searchResearchTrends(searchTopic);
    setSearchResult(result);
    setLoading(false);
  };

  const handleConsensusSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setConsensusData(null);
    const result = await getResearchConsensus(query);
    setConsensusData(result);
    setLoading(false);
  };

  const handleMatrixGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matrixMode === 'TOPIC' && !matrixTopic) return;
    if (matrixMode === 'SPECIFIC' && !specificPapers) return;

    setLoading(true);
    setMatrixData(null);
    
    let result;
    if (matrixMode === 'TOPIC') {
       result = await generateLiteratureMatrix(matrixTopic);
    } else {
       const paperList = specificPapers.split('\n').filter(p => p.trim() !== '');
       result = await compareSpecificPapers(paperList);
    }
    
    setMatrixData(result);
    setLoading(false);
  };

  const handleDetailedCompare = async () => {
    if (!compPaper1 || !compPaper2) return;
    setLoading(true);
    setCompResult(null);
    const result = await generateDetailedComparison(compPaper1, compPaper2);
    setCompResult(result);
    setLoading(false);
  };

  const handleSummaryGenerate = async () => {
      if (!summaryInput) return;
      const papers = summaryInput.split('\n').filter(p => p.trim() !== '');
      if (papers.length === 0) return;

      setLoading(true);
      setSummaryResults([]);
      const results = await generateLiteratureSummary(papers);
      setSummaryResults(results);
      setLoading(false);
  };

  const handleHypothesisGenerate = async () => {
      if (!fieldA || !fieldB) return;
      setLoading(true);
      const result = await generateHypothesis(fieldA, fieldB);
      setHypothesis(result);
      setLoading(false);
  }

  const handlePeerReview = async () => {
      if (!draftText) return;
      setLoading(true);
      setReviewResult(null);
      const result = await analyzePaperDraft(draftText);
      setReviewResult(result);
      setLoading(false);
  }

  const handleGrantGen = async () => {
      if (!grantTopic) return;
      setLoading(true);
      setGrantResult(null);
      const result = await generateGrantProposal(grantTopic, grantAmount);
      setGrantResult(result);
      setLoading(false);
  }

  const handleExtraction = async () => {
      if (!extractText || !extractFields) return;
      setLoading(true);
      setExtractResult([]);
      const result = await extractResearchData(extractText, extractFields);
      setExtractResult(result);
      setLoading(false);
  }

  const handleMethodGen = async () => {
      if (!methodGoal) return;
      setLoading(true);
      setMethodResult([]);
      const result = await generateMethodology(methodGoal);
      setMethodResult(result);
      setLoading(false);
  }

  const handleJournalMatch = async () => {
      if (!abstract) return;
      setLoading(true);
      setJournalResult([]);
      const result = await recommendJournals(abstract);
      setJournalResult(result);
      setLoading(false);
  }

  const handleStatAdvice = async () => {
      if (!variables) return;
      setLoading(true);
      setStatResult(null);
      const result = await suggestStatistics(variables);
      setStatResult(result);
      setLoading(false);
  }

  const handleTrendAnalysis = async () => {
      if (!trendTopic) return;
      setLoading(true);
      setTrendResult([]);
      const result = await analyzeResearchTrends(trendTopic);
      setTrendResult(result);
      setLoading(false);
  }

  const handleSeoOptimization = async () => {
      if (!seoAbstract) return;
      setLoading(true);
      setSeoResult(null);
      const result = await optimizeAbstractKeywords(seoAbstract);
      setSeoResult(result);
      setLoading(false);
  }

  const handleImpactSim = async () => {
      setLoading(true);
      setImpactResult(null);
      const result = await projectResearchImpact(impactStats);
      setImpactResult(result);
      setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
         <div>
            <h2 className="text-3xl font-bold text-slate-800 font-serif">Research Lab</h2>
            <p className="text-slate-500">Advanced AI suite for academic synthesis and review.</p>
         </div>
         
         {/* Navigation Tabs */}
         <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-1 max-w-full overflow-x-auto">
            {[
              { id: 'LIBRARY', label: 'Books' },
              { id: 'SEARCH', label: 'Search' },
              { id: 'CONSENSUS', label: 'Consensus' },
              { id: 'MATRIX', label: 'Matrix' },
              { id: 'COMPARE', label: 'Side-by-Side' },
              { id: 'SUMMARIES', label: 'Summaries' },
              { id: 'HYPOTHESIS', label: 'Hypothesis' },
              { id: 'REVIEW', label: 'Reviewer' },
              { id: 'GRANT', label: 'Grants' },
              { id: 'EXTRACT', label: 'Extract' },
              { id: 'METHODS', label: 'Methods' },
              { id: 'JOURNALS', label: 'Journals' },
              { id: 'STATS', label: 'Statistics' },
              { id: 'ANALYTICS', label: 'Analytics' }
            ].map(tab => (
                 <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`px-3 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-teal-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                 {tab.label}
               </button>
            ))}
         </div>
      </div>

      {activeTab === 'LIBRARY' && (
          <LibraryAssistant user={user} />
      )}

      {/* SEARCH DISCOVERY */}
      {activeTab === 'SEARCH' && (
        <div className="space-y-8 animate-fade-in">
           <div className="glass-panel p-8 rounded-2xl shadow-lg border-t-4 border-indigo-500">
              <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Research Discovery Engine</h3>
                    <p className="text-sm text-slate-600">Find SOTA papers and trends with live data.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
                      <span className="text-lg">🌍</span>
                      <span className="text-xs font-bold text-slate-600">Grounded with Google Search</span>
                  </div>
              </div>
              
              <form onSubmit={handleSearch} className="flex gap-4">
                 <input 
                   type="text" 
                   value={searchTopic} 
                   onChange={(e) => setSearchTopic(e.target.value)}
                   placeholder="e.g. Recent papers on Transformers in Vision"
                   className="flex-1 px-5 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
                 />
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="px-8 py-4 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 shadow-lg disabled:opacity-70 transition-all"
                 >
                    {loading ? 'Researching...' : 'Find Papers'}
                 </button>
              </form>
           </div>

           {searchResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Synthesis */}
                 <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-md border border-slate-200">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 border-b border-gray-100 pb-2">AI Synthesis & Key Papers</h4>
                    <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed">
                        <ReactMarkdown>{searchResult.synthesis}</ReactMarkdown>
                    </div>
                 </div>

                 {/* Sources */}
                 <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-slate-900">Grounding Sources</h4>
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Live</span>
                    </div>
                    {searchResult.sources.length > 0 ? (
                        <div className="space-y-3">
                            {searchResult.sources.map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-sm font-bold text-indigo-700 group-hover:text-indigo-900 mb-1 line-clamp-2 leading-tight">{source.title}</p>
                                    <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                                        <span>🔗</span> {new URL(source.uri).hostname}
                                    </p>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-400 text-sm italic p-4 bg-slate-50 rounded-lg border border-slate-100">
                            No direct web sources returned by grounding.
                        </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      )}

      {/* CONSENSUS ENGINE */}
      {activeTab === 'CONSENSUS' && (
        <div className="space-y-8 animate-fade-in">
           <div className="glass-panel p-8 rounded-2xl shadow-lg border-t-4 border-teal-500">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Scientific Consensus Search</h3>
              <p className="text-sm text-slate-600 mb-6">Ask a Yes/No research question. AI will analyze simulated papers to find the scientific consensus.</p>
              
              <form onSubmit={handleConsensusSearch} className="flex gap-4">
                 <input 
                   type="text" 
                   value={query} 
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="e.g. Does creatine improve cognitive function in sleep deprived individuals?"
                   className="flex-1 px-5 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none text-lg"
                 />
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="px-8 py-4 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 shadow-lg disabled:opacity-70 transition-all"
                 >
                    {loading ? 'Analyzing...' : 'Find Consensus'}
                 </button>
              </form>
           </div>

           {consensusData && (
              <div className="space-y-8">
                 {/* Meter */}
                 <div className="bg-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row items-center gap-10">
                    <div className="relative w-40 h-40 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                            <circle 
                                cx="80" cy="80" r="70" fill="transparent" stroke={consensusData.consensusScore > 75 ? '#10b981' : consensusData.consensusScore < 25 ? '#ef4444' : '#f59e0b'} 
                                strokeWidth="12" 
                                strokeDasharray={440} 
                                strokeDashoffset={440 - (440 * consensusData.consensusScore) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-800">{consensusData.consensusScore}%</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consensus</span>
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <div className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase mb-2 ${consensusData.consensusLabel === 'YES' ? 'bg-green-100 text-green-800' : consensusData.consensusLabel === 'NO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                            {consensusData.consensusLabel}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Summary of Findings</h4>
                        <p className="text-slate-600 leading-relaxed">{consensusData.summary}</p>
                    </div>
                 </div>

                 {/* Papers */}
                 <div className="grid grid-cols-1 gap-4">
                    <h4 className="font-bold text-slate-900 text-lg">Key Papers Analyzed</h4>
                    {consensusData.papers.map((paper: any, idx: number) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-teal-700 text-lg">{paper.title}</h5>
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono">{paper.citationCount} Citations</span>
                            </div>
                            <p className="text-xs text-slate-500 uppercase font-bold mb-3">{paper.journal} • {paper.year} • {paper.authors}</p>
                            <div className="bg-slate-50 p-3 rounded-lg border-l-4 border-teal-400">
                                <p className="text-slate-700 text-sm italic">"{paper.finding}"</p>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      )}

      {/* SYNTOPICAL MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-6 animate-fade-in">
            <div className="glass-panel p-6 rounded-2xl shadow-sm">
                <div className="flex gap-4 mb-4 border-b border-slate-200 pb-2">
                    <button 
                       onClick={() => setMatrixMode('TOPIC')}
                       className={`pb-2 text-sm font-bold transition-all ${matrixMode === 'TOPIC' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500'}`}
                    >
                       Topic Exploration
                    </button>
                    <button 
                       onClick={() => setMatrixMode('SPECIFIC')}
                       className={`pb-2 text-sm font-bold transition-all ${matrixMode === 'SPECIFIC' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500'}`}
                    >
                       Specific Papers
                    </button>
                </div>

                <form onSubmit={handleMatrixGenerate} className="flex flex-col gap-4">
                    {matrixMode === 'TOPIC' ? (
                        <input 
                            type="text" 
                            value={matrixTopic}
                            onChange={(e) => setMatrixTopic(e.target.value)}
                            placeholder="Enter topic for Literature Review (e.g. CRISPR off-target effects)"
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    ) : (
                        <textarea 
                            value={specificPapers}
                            onChange={(e) => setSpecificPapers(e.target.value)}
                            placeholder="Enter Paper Titles or DOIs (one per line)..."
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none h-32 resize-none"
                        />
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 disabled:opacity-70 self-start"
                    >
                        {loading ? 'Generating...' : matrixMode === 'TOPIC' ? 'Build Matrix' : 'Compare Papers'}
                    </button>
                </form>
            </div>

            {matrixData && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    {matrixData.columns.map((col: string, idx: number) => (
                                        <th key={idx} className="px-6 py-4 whitespace-nowrap">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {matrixData.rows.map((row: any, rIdx: number) => (
                                    <tr key={rIdx} className="hover:bg-slate-50">
                                        {matrixData.columns.map((col: string, cIdx: number) => (
                                            <td key={cIdx} className="px-6 py-4 align-top text-slate-700 min-w-[200px]">
                                                {row[col] || row[Object.keys(row).find(k => k.toLowerCase() === col.toLowerCase()) || ''] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON */}
      {activeTab === 'COMPARE' && (
        <div className="space-y-8 animate-fade-in">
           <div className="glass-panel p-8 rounded-2xl shadow-lg border-t-4 border-teal-500">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Side-by-Side Paper Comparison</h3>
              <p className="text-sm text-slate-600 mb-6">Enter two papers or concepts. AI will identify critical differences in methodology and findings.</p>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paper 1</label>
                    <input 
                      type="text" 
                      value={compPaper1} 
                      onChange={(e) => setCompPaper1(e.target.value)}
                      placeholder="e.g. Title or DOI of first paper"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                 </div>
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paper 2</label>
                    <input 
                      type="text" 
                      value={compPaper2} 
                      onChange={(e) => setCompPaper2(e.target.value)}
                      placeholder="e.g. Title or DOI of second paper"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                 </div>
              </div>
              <button 
                onClick={handleDetailedCompare}
                disabled={loading || !compPaper1 || !compPaper2}
                className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-black shadow-lg disabled:opacity-70 transition-all"
              >
                 {loading ? 'Comparing...' : 'Run Side-by-Side Analysis'}
              </button>
           </div>

           {compResult && (
              <div className="space-y-8">
                 {/* Paper Columns */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {compResult.papers.map((p, idx) => (
                       <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                          <h4 className="font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-100 min-h-[60px]">{p.title}</h4>
                          <div className="space-y-4">
                             <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Methodology</p>
                                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">{p.methodology}</p>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Key Findings</p>
                                <p className="text-sm text-slate-700 leading-relaxed bg-green-50 p-3 rounded-lg">{p.findings}</p>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Limitations</p>
                                <p className="text-sm text-slate-700 leading-relaxed bg-red-50 p-3 rounded-lg">{p.limitations}</p>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Differences Analysis */}
                 <div className="bg-gradient-to-br from-slate-50 to-teal-50 p-8 rounded-3xl border border-teal-100 shadow-inner">
                    <h3 className="text-xl font-bold text-teal-900 mb-6 flex items-center gap-2">
                       <span className="text-2xl">⚖️</span> AI Difference Analysis
                    </h3>
                    
                    <div className="space-y-6">
                       <div className="bg-white/60 p-4 rounded-xl border border-white/50">
                          <h5 className="font-bold text-teal-800 text-sm uppercase mb-2">Methodological Divergence</h5>
                          <p className="text-slate-700 leading-relaxed">{compResult.analysis.methodologyDiff}</p>
                       </div>
                       
                       <div className="bg-white/60 p-4 rounded-xl border border-white/50">
                          <h5 className="font-bold text-teal-800 text-sm uppercase mb-2">Findings Contrast</h5>
                          <p className="text-slate-700 leading-relaxed">{compResult.analysis.findingsDiff}</p>
                       </div>

                       <div className="bg-white/60 p-4 rounded-xl border border-white/50">
                          <h5 className="font-bold text-teal-800 text-sm uppercase mb-2">Synthesis & Takeaway</h5>
                          <p className="text-slate-800 font-medium leading-relaxed italic">"{compResult.analysis.synthesis}"</p>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
      )}

      {/* LITERATURE SUMMARIES */}
      {activeTab === 'SUMMARIES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl shadow-sm h-fit">
                  <h3 className="font-bold text-slate-900 mb-4">Paper Summarizer</h3>
                  <p className="text-xs text-slate-500 mb-4">Enter a list of titles or DOIs to get high-level executive summaries.</p>
                  <textarea 
                     value={summaryInput}
                     onChange={(e) => setSummaryInput(e.target.value)}
                     placeholder="1. Attention is All You Need&#10;2. Deep Residual Learning for Image Recognition&#10;..."
                     className="w-full h-48 p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4 resize-none text-sm"
                  />
                  <button 
                     onClick={handleSummaryGenerate}
                     disabled={loading || !summaryInput}
                     className="w-full py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-70"
                  >
                     {loading ? 'Processing...' : 'Generate Summaries'}
                  </button>
              </div>

              <div className="space-y-6">
                  {summaryResults.length > 0 ? (
                      summaryResults.map((item, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                              <div className="flex justify-between items-start mb-3">
                                  <h4 className="text-xl font-bold text-slate-900 leading-tight">{item.title}</h4>
                                  <span className={`text-xs font-bold px-2 py-1 rounded ${item.impactScore > 80 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                      Impact: {item.impactScore}
                                  </span>
                              </div>
                              <p className="text-sm text-slate-700 mb-4 italic leading-relaxed">{item.summary}</p>
                              
                              <div className="mb-4">
                                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Key Findings</p>
                                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                                      {item.keyFindings.map((kf, i) => <li key={i}>{kf}</li>)}
                                  </ul>
                              </div>

                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Methodology</p>
                                  <p className="text-xs text-slate-600">{item.methodology}</p>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl min-h-[400px]">
                          <div className="text-4xl mb-4 opacity-50">📑</div>
                          <p>Paste paper titles to see AI summaries.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* HYPOTHESIS GENERATOR */}
      {activeTab === 'HYPOTHESIS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="glass-panel p-8 rounded-2xl shadow-lg h-fit">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Cross-Disciplinary Innovation</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Field A</label>
                          <input 
                             type="text" 
                             value={fieldA} 
                             onChange={e => setFieldA(e.target.value)} 
                             placeholder="e.g. Mycology (Fungi)"
                             className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                          />
                      </div>
                      <div className="flex justify-center text-slate-400 text-xl">+</div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Field B</label>
                          <input 
                             type="text" 
                             value={fieldB} 
                             onChange={e => setFieldB(e.target.value)} 
                             placeholder="e.g. Urban Architecture"
                             className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                          />
                      </div>
                      <button 
                         onClick={handleHypothesisGenerate}
                         disabled={loading || !fieldA || !fieldB}
                         className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg mt-4"
                      >
                          {loading ? <Loader /> : 'Generate Novel Hypothesis'}
                      </button>
                  </div>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden min-h-[400px] flex items-center justify-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>
                  
                  {hypothesis ? (
                      <div className="relative z-10 text-left w-full">
                          <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg inline-block mb-6 border border-white/20">
                              <span className="text-teal-300 font-bold text-xs uppercase tracking-widest">Innovation Detected</span>
                          </div>
                          <h2 className="text-3xl font-serif font-bold mb-4 leading-tight">{hypothesis.title}</h2>
                          
                          <div className="space-y-6">
                              <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Hypothesis</p>
                                  <p className="text-lg text-slate-200 font-medium">{hypothesis.hypothesis}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                      <p className="text-xs font-bold text-teal-400 uppercase mb-1">Novelty</p>
                                      <p className="text-sm text-slate-300">{hypothesis.novelty}</p>
                                  </div>
                                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                      <p className="text-xs font-bold text-purple-400 uppercase mb-1">Methodology</p>
                                      <p className="text-sm text-slate-300">{hypothesis.methodology}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center text-slate-500">
                          <div className="text-6xl mb-4 opacity-20">💡</div>
                          <p>Combine two fields to generate a research proposal.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* PEER REVIEWER */}
      {activeTab === 'REVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col h-full">
                  <h3 className="font-bold text-slate-900 mb-2">Draft Submission</h3>
                  <p className="text-xs text-slate-500 mb-4">Paste your abstract or section. "Reviewer #2" will critique it.</p>
                  <textarea 
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="Paste abstract or draft here..."
                    className="flex-1 w-full p-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm font-mono min-h-[300px] resize-none"
                  />
                  <button 
                    onClick={handlePeerReview}
                    disabled={loading || !draftText}
                    className="mt-4 w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow hover:bg-black disabled:opacity-50"
                  >
                    {loading ? 'Reviewing...' : 'Submit for Peer Review'}
                  </button>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[600px]">
                 {reviewResult ? (
                     <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-slate-900">Review Report</h3>
                                <p className="text-xs text-slate-500 uppercase">Reviewer #2</p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                                reviewResult.decision === 'ACCEPT' ? 'bg-green-100 text-green-800' :
                                reviewResult.decision === 'REJECT' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {reviewResult.decision}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-800">{reviewResult.clarityScore}</div>
                                <div className="text-[10px] uppercase text-slate-500">Clarity</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-800">{reviewResult.methodologyScore}</div>
                                <div className="text-[10px] uppercase text-slate-500">Method</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-800">{reviewResult.noveltyScore}</div>
                                <div className="text-[10px] uppercase text-slate-500">Novelty</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-green-700 mb-2">Strengths</h4>
                            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                                {reviewResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-red-700 mb-2">Weaknesses</h4>
                            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                                {reviewResult.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl">
                            <h4 className="font-bold text-indigo-800 mb-2 text-sm uppercase">Improvement Plan</h4>
                            <ul className="space-y-2">
                                {reviewResult.suggestions.map((s, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-indigo-900">
                                        <span>👉</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                     </div>
                 ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                         <div className="text-4xl mb-4">📝</div>
                         <p>Waiting for submission...</p>
                     </div>
                 )}
              </div>
          </div>
      )}

      {/* GRANT WRITER */}
      {activeTab === 'GRANT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
             <div className="glass-panel p-6 rounded-2xl shadow-sm h-fit">
                <h3 className="font-bold text-slate-900 mb-6">Grant Architect</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Research Topic</label>
                        <input 
                           type="text" 
                           value={grantTopic}
                           onChange={(e) => setGrantTopic(e.target.value)}
                           className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                           placeholder="e.g. CRISPR for Malaria"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Funding Request</label>
                        <select 
                          value={grantAmount}
                          onChange={(e) => setGrantAmount(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                            <option>$10,000 (Seed)</option>
                            <option>$50,000 (Standard)</option>
                            <option>$250,000 (Major)</option>
                            <option>$1,000,000 (Multi-Year)</option>
                        </select>
                    </div>
                    <button 
                       onClick={handleGrantGen}
                       disabled={loading || !grantTopic}
                       className="w-full py-3 bg-gradient-to-r from-teal-700 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                       {loading ? <Loader /> : 'Generate Proposal Structure'}
                    </button>
                </div>
             </div>

             <div className="md:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 min-h-[500px] p-8">
                 {grantResult ? (
                     <div className="prose prose-slate max-w-none">
                         <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">{grantResult.title}</h2>
                         <div className="flex gap-4 mb-8">
                             <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold uppercase">Funding: {grantAmount}</span>
                             <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold uppercase">Status: Draft</span>
                         </div>

                         <div className="mb-6">
                             <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-2 mb-3">Executive Summary</h4>
                             <p className="text-slate-700 leading-relaxed">{grantResult.executiveSummary}</p>
                         </div>

                         <div className="mb-6">
                             <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-2 mb-3">Specific Aims</h4>
                             <ul className="list-decimal pl-5 space-y-2">
                                 {grantResult.specificAims.map((aim, i) => (
                                     <li key={i} className="text-slate-700">{aim}</li>
                                 ))}
                             </ul>
                         </div>

                         <div className="grid grid-cols-2 gap-8 mb-6">
                             <div>
                                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-2 mb-3">Impact Statement</h4>
                                <p className="text-sm text-slate-600">{grantResult.impactStatement}</p>
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-2 mb-3">Budget Justification</h4>
                                <p className="text-sm text-slate-600">{grantResult.budgetJustification}</p>
                             </div>
                         </div>
                         
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                             <h4 className="font-bold text-slate-900 uppercase text-xs mb-2">Timeline</h4>
                             <p className="text-sm font-mono text-slate-600">{grantResult.timeline}</p>
                         </div>
                     </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400">
                         <div className="text-5xl mb-4 opacity-30">💰</div>
                         <p>Ready to structure your funding proposal.</p>
                     </div>
                 )}
             </div>
          </div>
      )}

      {/* DATA EXTRACTOR */}
      {activeTab === 'EXTRACT' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Data Extraction</h3>
                  <div className="space-y-4">
                      <textarea 
                         value={extractText}
                         onChange={(e) => setExtractText(e.target.value)}
                         placeholder="Paste unstructured text (e.g. results section of a paper)..."
                         className="w-full p-4 rounded-xl border border-slate-300 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                      <input 
                         type="text" 
                         value={extractFields}
                         onChange={(e) => setExtractFields(e.target.value)}
                         placeholder="Fields to extract (e.g. Sample Size, P-Value, Location)"
                         className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                      <button 
                         onClick={handleExtraction}
                         disabled={loading || !extractText}
                         className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900"
                      >
                         {loading ? 'Extracting...' : 'Convert to Structured Data'}
                      </button>
                  </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  {extractResult.length > 0 ? (
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                  <tr>
                                      {Object.keys(extractResult[0]).map((key, i) => (
                                          <th key={i} className="px-6 py-4 capitalize">{key}</th>
                                      ))}
                                  </tr>
                              </thead>
                              <tbody>
                                  {extractResult.map((row, i) => (
                                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                          {Object.values(row).map((val: any, j) => (
                                              <td key={j} className="px-6 py-4 text-slate-600">{val}</td>
                                          ))}
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                              <button className="text-teal-600 font-bold text-sm hover:underline">Download CSV</button>
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[300px]"><div className="text-4xl mb-4 opacity-50">📊</div><p>Structured data will appear here.</p></div>
                  )}
              </div>
          </div>
      )}

      {/* METHODOLOGY DESIGNER */}
      {activeTab === 'METHODS' && (
          <div className="animate-fade-in space-y-6">
              <div className="glass-panel p-6 rounded-2xl shadow-sm">
                  <div className="flex gap-4">
                      <input 
                         type="text" 
                         value={methodGoal} 
                         onChange={e => setMethodGoal(e.target.value)} 
                         placeholder="Research Goal (e.g. Test effect of caffeine on short-term memory)"
                         className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button 
                         onClick={handleMethodGen}
                         disabled={loading || !methodGoal}
                         className="px-6 py-3 bg-teal-700 text-white font-bold rounded-lg hover:bg-teal-800 disabled:opacity-70"
                      >
                         {loading ? 'Designing...' : 'Generate Protocol'}
                      </button>
                  </div>
              </div>

              {methodResult.length > 0 && (
                  <div className="relative border-l-4 border-teal-500 ml-4 pl-8 space-y-8 py-2">
                      {methodResult.map((step, idx) => (
                          <div key={idx} className="relative">
                              <div className="absolute -left-[42px] top-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{idx + 1}</div>
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><h4 className="font-bold text-lg text-slate-900 mb-4">{step.phase}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><p className="text-xs font-bold text-slate-500 uppercase mb-2">Procedure</p><ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">{step.details.map((d, i) => <li key={i}>{d}</li>)}</ul></div><div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs font-bold text-slate-500 uppercase mb-2">Equipment</p><div className="flex flex-wrap gap-2">{step.equipment.map((eq, i) => (<span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 shadow-sm">{eq}</span>))}</div></div></div></div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* JOURNAL MATCHMAKER */}
      {activeTab === 'JOURNALS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl shadow-sm h-full"><h3 className="font-bold text-slate-900 mb-4">Abstract Analysis</h3><textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} placeholder="Paste your abstract here..." className="w-full h-64 p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4 resize-none text-sm"/><button onClick={handleJournalMatch} disabled={loading || !abstract} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-70">{loading ? 'Matching...' : 'Find Journals'}</button></div><div className="space-y-4">{journalResult.length > 0 ? (journalResult.map((journal, idx) => (<div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-900 text-lg">{journal.name}</h4><div className="flex items-center gap-2"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">IF: {journal.impactFactor}</span><span className={`text-xs font-bold px-2 py-1 rounded ${journal.matchScore > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{journal.matchScore}% Match</span></div></div><p className="text-sm text-slate-600 mb-3">{journal.reason}</p><div className="flex items-center gap-2 text-xs text-slate-500"><span>⏱️ Review: {journal.reviewTime}</span></div></div>))) : (<div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl"><span className="text-4xl mb-2">📰</span><p>Journal recommendations will appear here.</p></div>)}</div></div>
      )}

      {/* STATISTICS CONSULTANT */}
      {activeTab === 'STATS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in"><div className="glass-panel p-6 rounded-2xl shadow-sm"><h3 className="font-bold text-slate-900 mb-4">Statistical Advisor</h3><div className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Describe Data & Goal</label><textarea value={variables} onChange={(e) => setVariables(e.target.value)} placeholder="e.g. I have 3 groups of plants (A, B, C) and I measured their height (continuous) after 4 weeks. I want to see if there is a difference." className="w-full h-40 p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"/></div><button onClick={handleStatAdvice} disabled={loading || !variables} className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-black disabled:opacity-70">{loading ? 'Consulting...' : 'Suggest Test'}</button></div></div><div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">{statResult ? (<div className="p-0"><div className="bg-teal-600 p-6 text-white"><p className="text-xs font-bold uppercase opacity-80 mb-1">Recommended Test</p><h2 className="text-3xl font-bold">{statResult.recommendedTest}</h2></div><div className="p-6 space-y-6"><div><h4 className="font-bold text-slate-900 mb-2">Reasoning</h4><p className="text-sm text-slate-600">{statResult.reason}</p></div><div><h4 className="font-bold text-slate-900 mb-2">Assumptions to Check</h4><ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">{statResult.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul></div><div className="bg-slate-900 rounded-xl overflow-hidden"><div className="bg-slate-800 px-4 py-2 text-xs font-bold text-slate-400 flex justify-between"><span>PYTHON / SCIPY</span><button className="hover:text-white">Copy</button></div><pre className="p-4 text-green-400 font-mono text-xs overflow-x-auto">{statResult.codeSnippet}</pre></div></div></div>) : (<div className="h-full flex flex-col items-center justify-center text-slate-400"><span className="text-4xl mb-2">📈</span><p>Statistical advice will appear here.</p></div>)}</div></div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'ANALYTICS' && (
          <div className="space-y-8 animate-fade-in">
              <div className="flex gap-4 border-b border-gray-200 pb-4">
                  <button onClick={() => setAnalyticsMode('TRENDS')} className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${analyticsMode === 'TRENDS' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>📈 Trend Watcher</button>
                  <button onClick={() => setAnalyticsMode('SEO')} className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${analyticsMode === 'SEO' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>🔍 Paper SEO</button>
                  <button onClick={() => setAnalyticsMode('IMPACT')} className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${analyticsMode === 'IMPACT' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>🚀 Career Impact</button>
              </div>

              {analyticsMode === 'TRENDS' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-panel p-6 rounded-2xl shadow-sm h-fit">
                          <h3 className="font-bold text-slate-900 mb-4">Topic Trend Analysis</h3>
                          <input type="text" value={trendTopic} onChange={(e) => setTrendTopic(e.target.value)} placeholder="e.g. Deep Learning in Healthcare" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 mb-4"/>
                          <button onClick={handleTrendAnalysis} disabled={loading || !trendTopic} className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-black disabled:opacity-70">{loading ? 'Analyzing...' : 'Analyze Growth'}</button>
                      </div>
                      <div className="space-y-4">
                          {trendResult.map((trend, idx) => (
                              <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden group">
                                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl ${trend.growthLabel === 'Exploding' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{trend.growthLabel}</div>
                                  <div className="flex justify-between items-center mb-4"><h4 className="text-xl font-bold text-slate-900">{trend.topic}</h4><span className="text-xs font-bold text-slate-500">{trend.growthPercent}% Growth</span></div>
                                  <div className="h-32 flex items-end gap-2 border-b border-l border-slate-200 p-2">
                                      {trend.yearlyData.map((d, i) => (
                                          <div key={i} className="flex-1 bg-indigo-500 rounded-t opacity-80 hover:opacity-100 transition-opacity relative group" style={{ height: `${(d.volume / Math.max(...trend.yearlyData.map(y => y.volume))) * 100}%` }}>
                                              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100">{d.volume}</div>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="flex justify-between mt-2 text-xs text-slate-400"><span>2019</span><span>2024</span></div>
                              </div>
                          ))}
                          {trendResult.length === 0 && !loading && <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl min-h-[300px]"><p>No trend data generated yet.</p></div>}
                      </div>
                  </div>
              )}

              {analyticsMode === 'SEO' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-panel p-6 rounded-2xl shadow-sm h-fit"><h3 className="font-bold text-slate-900 mb-4">Paper SEO Optimizer</h3><textarea value={seoAbstract} onChange={(e) => setSeoAbstract(e.target.value)} placeholder="Paste your abstract here..." className="w-full h-48 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 mb-4 resize-none"/><button onClick={handleSeoOptimization} disabled={loading || !seoAbstract} className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-black disabled:opacity-70">{loading ? 'Optimizing...' : 'Check Discoverability'}</button></div>
                      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">{seoResult ? (<div className="space-y-6"><div className="flex items-center gap-4"><div className="relative w-20 h-20"><svg className="w-full h-full transform -rotate-90"><circle cx="40" cy="40" r="36" fill="transparent" stroke="#e2e8f0" strokeWidth="8" /><circle cx="40" cy="40" r="36" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray={226} strokeDashoffset={226 - (226 * seoResult.discoverabilityScore) / 100} strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800">{seoResult.discoverabilityScore}</div></div><div><h4 className="font-bold text-slate-900">SEO Score</h4><p className="text-xs text-slate-500">Based on keyword density & clarity</p></div></div><div><h5 className="font-bold text-red-600 mb-2 text-sm">Missing Keywords</h5><div className="flex flex-wrap gap-2">{seoResult.missingKeywords.map((k, i) => <span key={i} className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs border border-red-100">{k}</span>)}</div></div><div><h5 className="font-bold text-indigo-600 mb-2 text-sm">Title Suggestions</h5><ul className="space-y-2">{seoResult.titleSuggestions.map((t, i) => <li key={i} className="text-sm text-slate-700 italic">"{t}"</li>)}</ul></div><div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-slate-600 leading-relaxed">{seoResult.abstractFeedback}</p></div></div>) : (<div className="h-full flex items-center justify-center text-slate-400"><p>SEO analysis results.</p></div>)}</div>
                  </div>
              )}

              {analyticsMode === 'IMPACT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-panel p-6 rounded-2xl shadow-sm h-fit"><h3 className="font-bold text-slate-900 mb-4">Career Simulator</h3><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Papers</label><input type="number" value={impactStats.papers} onChange={(e) => setImpactStats({...impactStats, papers: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-lg border border-slate-300"/></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Citations</label><input type="number" value={impactStats.citations} onChange={(e) => setImpactStats({...impactStats, citations: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-lg border border-slate-300"/></div></div><button onClick={handleImpactSim} disabled={loading} className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-black disabled:opacity-70">{loading ? 'Projecting...' : 'Simulate 5-Year Impact'}</button></div>
                      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">{impactResult ? (<div className="space-y-8 text-center"><div className="grid grid-cols-2 gap-8"><div className="p-4 bg-slate-50 rounded-2xl"><p className="text-xs text-slate-500 uppercase mb-1">Current h-index</p><p className="text-4xl font-bold text-slate-800">{impactResult.currentHIndex}</p></div><div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100"><p className="text-xs text-indigo-500 uppercase mb-1">Projected (5Y)</p><p className="text-4xl font-bold text-indigo-700">{impactResult.projectedHIndex5Y}</p></div></div><div><h4 className="font-bold text-slate-900 mb-2">Citation Velocity</h4><p className="text-2xl text-green-600 font-bold">{impactResult.citationVelocity}</p></div><div className="bg-slate-50 p-6 rounded-xl text-left"><h5 className="font-bold text-slate-900 text-sm uppercase mb-2">Strategic Advice</h5><p className="text-slate-700 text-sm leading-relaxed">{impactResult.strategy}</p></div></div>) : (<div className="h-full flex items-center justify-center text-slate-400"><p>Career projection results.</p></div>)}</div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
