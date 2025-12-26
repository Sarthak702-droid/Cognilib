
import React, { useState, useEffect } from 'react';
import { generateStudyPlan, generateStudyVideo } from '../../services/geminiService';
import Loader from '../UI/Loader';
import { RoadmapPhase } from '../../types';

export const StudyPlanner: React.FC = () => {
  // Mode State
  const [activeMode, setActiveMode] = useState<'PLAN' | 'VISUAL'>('PLAN');

  // Study Plan State
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [time, setTime] = useState('1 hour');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[] | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{title: string, desc: string} | null>(null);

  // Visual Veo State
  const [visualPrompt, setVisualPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  useEffect(() => {
    if (activeMode === 'VISUAL') {
        checkKey();
    }
  }, [activeMode]);

  const checkKey = async () => {
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
          try {
            const has = await win.aistudio.hasSelectedApiKey();
            setApiKeySelected(has);
          } catch(e) {
            console.warn("Key check failed", e);
          }
      } else {
          setApiKeySelected(true); 
      }
  }

  const handleSelectKey = async () => {
      const win = window as any;
      if (win.aistudio && win.aistudio.openSelectKey) {
          try {
            await win.aistudio.openSelectKey();
            setApiKeySelected(true);
          } catch(e) {
            console.error("Key selection failed", e);
          }
      } else {
          alert("Key selection dialogue not available in this environment.");
      }
  }

  const handleVisualGenerate = async () => {
    if (!visualPrompt) return;
    setGeneratingVideo(true);
    setVideoUrl(null);
    try {
        const url = await generateStudyVideo(visualPrompt, aspectRatio);
        if (url) {
            setVideoUrl(url);
        } else {
            alert("Failed to generate video. Please try again.");
        }
    } catch (e: any) {
        console.error(e);
        alert(e.message || "An error occurred during generation.");
    } finally {
        setGeneratingVideo(false);
    }
  }

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !goal) return;
    
    setLoading(true);
    setRoadmap(null);
    const result = await generateStudyPlan(subject, goal, time);
    if (result && result.length > 0) {
        setRoadmap(result);
    } else {
        alert("Could not generate plan. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">AI Study Architect</h2>
            <p className="text-gray-600">Create structured roadmaps or animate complex concepts with Veo.</p>
        </div>
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
            <button 
                onClick={() => setActiveMode('PLAN')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMode === 'PLAN' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Roadmap Mind Map
            </button>
            <button 
                onClick={() => setActiveMode('VISUAL')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeMode === 'VISUAL' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <span>Veo Visuals</span>
                <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1 rounded uppercase">New</span>
            </button>
        </div>
      </div>

      {activeMode === 'PLAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Configuration Panel */}
            <div className="md:col-span-3">
                <form onSubmit={handleGeneratePlan} className="glass-panel p-6 rounded-2xl shadow-lg space-y-4 sticky top-24">
                    <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Plan Configuration</h3>
                    
                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject / Exam</label>
                    <input 
                        type="text" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Organic Chemistry"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Goal</label>
                    <select 
                        value={goal} 
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="">Select Goal...</option>
                        <option value="Concept Clarity">Concept Clarity</option>
                        <option value="Quick Revision">Quick Revision</option>
                        <option value="Exam Practice">Exam Practice</option>
                        <option value="Deep Dive">Deep Dive Research</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time per Day</label>
                    <select 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="30 mins">30 mins</option>
                        <option value="1 hour">1 hour</option>
                        <option value="2 hours">2 hours</option>
                        <option value="4+ hours">4+ hours</option>
                    </select>
                    </div>

                    <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all ${
                        loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black hover:shadow-lg hover:scale-[1.02]'
                    }`}
                    >
                    {loading ? 'Designing...' : 'Generate Map'}
                    </button>
                </form>
            </div>

            {/* Mind Map Canvas */}
            <div className="md:col-span-9">
                {roadmap ? (
                    <div className="w-full overflow-x-auto p-10 bg-gray-50 rounded-3xl border border-gray-200 min-h-[600px] flex justify-center custom-scrollbar">
                        {/* Tree Structure */}
                        <div className="flex flex-col items-center min-w-max">
                            
                            {/* Root Node: Subject */}
                            <div className="z-10 bg-gray-900 text-white px-10 py-5 rounded-full shadow-2xl mb-12 border-4 border-indigo-200 relative animate-fade-in">
                                <h3 className="font-bold text-2xl font-serif">{subject || 'Master Plan'}</h3>
                                <p className="text-xs text-gray-400 text-center uppercase tracking-widest mt-1">{goal}</p>
                                {/* Connector Down */}
                                <div className="absolute bottom-[-48px] left-1/2 w-1 h-12 bg-gray-300 -translate-x-1/2"></div>
                            </div>

                            {/* Level 2: Phases */}
                            <div className="flex items-start gap-8 relative">
                                {/* Horizontal Connector Bar (Connects first phase center to last phase center) */}
                                {roadmap.length > 1 && (
                                    <div className="absolute top-[-2px] left-[110px] right-[110px] h-1 bg-gray-300 rounded-full"></div>
                                )}

                                {roadmap.map((phase, idx) => (
                                    <div key={idx} className="flex flex-col items-center relative animate-fade-in" style={{ width: '220px', animationDelay: `${idx * 0.1}s` }}>
                                        {/* Connector Up to Bar */}
                                        <div className="absolute top-[-24px] w-1 h-6 bg-gray-300"></div>

                                        {/* Phase Node */}
                                        <div className="w-full bg-white p-5 rounded-xl shadow-lg border-t-4 border-indigo-500 mb-8 relative group hover:-translate-y-1 transition-transform z-10">
                                            <div className="absolute top-[-12px] right-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-200 shadow-sm">
                                                {phase.duration}
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-center text-lg">{phase.phase}</h4>
                                            {/* Connector Down to Topics */}
                                            {phase.topics.length > 0 && <div className="absolute bottom-[-32px] left-1/2 w-1 h-8 bg-indigo-100 -translate-x-1/2"></div>}
                                        </div>

                                        {/* Topics (Leaf Nodes) */}
                                        <div className="flex flex-col gap-4 w-full relative">
                                            {/* Vertical Spine Line */}
                                            <div className="absolute left-1/2 top-[-20px] bottom-6 w-0.5 bg-indigo-100 -translate-x-1/2"></div>
                                            
                                            {phase.topics.map((topic, tIdx) => (
                                                <button
                                                    key={tIdx}
                                                    onClick={() => setSelectedTopic(topic)}
                                                    className="relative z-10 bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-400 hover:bg-indigo-50 text-left transition-all text-sm group flex items-center gap-3"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-indigo-300 group-hover:bg-indigo-600 transition-colors shrink-0"></div>
                                                    <div className="font-medium text-gray-700 group-hover:text-indigo-900 leading-tight">{topic.title}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Topic Detail Modal */}
                        {selectedTopic && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedTopic(null)}>
                                <div 
                                    className="bg-white max-w-sm w-full p-8 rounded-3xl shadow-2xl relative border-t-8 border-indigo-600 transform transition-all scale-100" 
                                    onClick={e => e.stopPropagation()}
                                >
                                    <button 
                                        onClick={() => setSelectedTopic(null)} 
                                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                                    >
                                        ✕
                                    </button>
                                    
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 block">Topic Detail</span>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">{selectedTopic.title}</h3>
                                    
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">{selectedTopic.desc}</p>
                                    </div>
                                    
                                    <div className="flex justify-end">
                                        <button onClick={() => setSelectedTopic(null)} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors shadow-lg">
                                            Close Card
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 bg-gray-50/50 min-h-[500px]">
                       {loading ? (
                           <div className="text-center">
                               <Loader />
                               <h3 className="mt-6 text-xl font-bold text-gray-900">Architecting Roadmap...</h3>
                               <p className="text-indigo-600 animate-pulse">Building nodes and connecting concepts</p>
                           </div>
                       ) : (
                           <>
                               <div className="text-7xl mb-6 opacity-20 grayscale">🧠</div>
                               <h3 className="text-xl font-bold text-gray-500 mb-2">No Mind Map Generated</h3>
                               <p className="text-sm max-w-xs text-center">Configure your subject and goals on the left to visualize your learning path.</p>
                           </>
                       )}
                    </div>
                )}
            </div>
        </div>
      ) : (
        /* VEO VISUAL MODE */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-6">
                <div className="glass-panel p-8 rounded-2xl shadow-lg border-t-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎥</span> Animate Concept
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Describe a complex topic, scenario, or historical event. Veo will generate a video simulation to help you understand it.
                    </p>

                    {!apiKeySelected && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                            <p className="text-sm text-amber-800 mb-3 font-bold">Paid Feature Required</p>
                            <p className="text-xs text-amber-700 mb-3">To use Veo models, you must select a paid API key from your Google Cloud project.</p>
                            <button 
                                onClick={handleSelectKey}
                                className="w-full py-2 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 transition-colors"
                            >
                                Select Paid API Key
                            </button>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block text-center mt-2 text-[10px] text-amber-600 hover:underline">View Billing Documentation</a>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Prompt */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Concept Description</label>
                            <textarea 
                                value={visualPrompt}
                                onChange={(e) => setVisualPrompt(e.target.value)}
                                placeholder="E.g., 'Visualize the flow of electrons in a circuit', 'Show the rotation of planets in the solar system'..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 text-sm h-32 resize-none"
                                disabled={generatingVideo}
                            />
                        </div>

                        {/* Config */}
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Format</label>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => setAspectRatio('16:9')}
                                    className={`flex-1 py-2 rounded-lg border text-xs font-bold ${aspectRatio === '16:9' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300'}`}
                                >
                                    Landscape (16:9)
                                </button>
                                <button 
                                    onClick={() => setAspectRatio('9:16')}
                                    className={`flex-1 py-2 rounded-lg border text-xs font-bold ${aspectRatio === '9:16' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300'}`}
                                >
                                    Portrait (9:16)
                                </button>
                             </div>
                        </div>

                        <button 
                            onClick={handleVisualGenerate}
                            disabled={generatingVideo || !visualPrompt || !apiKeySelected}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                                generatingVideo || !visualPrompt || !apiKeySelected
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:scale-[1.02]'
                            }`}
                        >
                            {generatingVideo ? 'Generating Video (This takes ~1 min)...' : 'Generate Visual Explanation'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="md:col-span-7">
                <div className={`h-full min-h-[500px] glass-panel rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden transition-all ${generatingVideo ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'}`}>
                    
                    {videoUrl ? (
                        <div className="w-full h-full flex flex-col">
                            <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl relative group">
                                <video 
                                    src={videoUrl} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-900">Generated Visual</h4>
                                    <p className="text-xs text-gray-500">Model: veo-3.1-fast-generate-preview</p>
                                </div>
                                <a 
                                    href={videoUrl} 
                                    download="concept-animation.mp4" 
                                    className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                                >
                                    Download MP4
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 max-w-sm">
                            {generatingVideo ? (
                                <div className="space-y-6">
                                    <Loader />
                                    <div>
                                        <h4 className="text-lg font-bold text-indigo-900">Synthesizing with Veo...</h4>
                                        <p className="text-sm text-gray-600">Creating a complex video simulation from your text description.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-6xl mb-4 opacity-30">🎬</div>
                                    <h4 className="text-xl font-bold text-gray-400 mb-2">No Visual Generated</h4>
                                    <p className="text-gray-400">Describe a concept to see the result here.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
