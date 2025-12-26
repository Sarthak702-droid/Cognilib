
import React, { useState } from 'react';
import { generateFlashcards, generateDeepBookDeepDive } from '../../services/geminiService';
import Loader from '../UI/Loader';
import ReactMarkdown from 'react-markdown';

interface Flashcard {
  front: string;
  back: string;
}

export const FlashcardForge: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [deepInsight, setDeepInsight] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Navigation & Mode State
  const [view, setView] = useState<'SETUP' | 'STUDY' | 'REPORT'>('SETUP');
  const [generateMode, setGenerateMode] = useState<'DECK' | 'REPORT'>('DECK');

  // Deep Dive / Report State
  const [showDeepDiveModal, setShowDeepDiveModal] = useState(false); // For sidebar in STUDY mode
  const [deepDiveContent, setDeepDiveContent] = useState(''); // Shared content for Modal & Report View
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    
    // Step 1: Identify the book and context (used for both modes)
    const result = await generateFlashcards(topic);
    
    if (result && result.deepInsight) {
      setDeepInsight(result.deepInsight);

      if (generateMode === 'REPORT') {
         // Step 2: Directly generate the full report
         const content = await generateDeepBookDeepDive(topic, result.deepInsight.bookTitle);
         setDeepDiveContent(content);
         setView('REPORT');
      } else {
         // Step 2: Setup Flashcards
         setCards(result.cards || []);
         setView('STUDY');
         setCurrentIndex(0);
         setIsFlipped(false);
      }
    } else {
        alert("Failed to analyze topic. Please try again.");
    }
    setLoading(false);
  };

  // Handler for the sidebar "Deep Dive" button inside Flashcard view
  const handleDeepDiveModalOpen = async () => {
    setShowDeepDiveModal(true);
    if (!deepDiveContent && deepInsight) {
        setLoadingDeepDive(true);
        const content = await generateDeepBookDeepDive(topic, deepInsight.bookTitle);
        setDeepDiveContent(content);
        setLoadingDeepDive(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  // --- RENDER: SETUP VIEW ---
  if (view === 'SETUP') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Knowledge Forge</h2>
          <p className="text-gray-600">
            Generate active recall decks or deep structured summaries instantly.
          </p>
        </div>

        <div className="glass-panel p-10 rounded-3xl max-w-xl mx-auto shadow-xl">
           <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Topic of Study</label>
                 <input 
                   type="text" 
                   value={topic}
                   onChange={(e) => setTopic(e.target.value)}
                   placeholder="e.g. Quantum Entanglement, French Revolution, Contract Law"
                   className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white text-lg shadow-inner"
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-3">Generation Mode</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGenerateMode('DECK')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        generateMode === 'DECK' 
                        ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                        : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                       <div className="text-2xl mb-1">🗂️</div>
                       <div className="font-bold text-gray-900">Flashcards</div>
                       <div className="text-xs text-gray-500">Active Recall Deck</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGenerateMode('REPORT')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        generateMode === 'REPORT' 
                        ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                        : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                       <div className="text-2xl mb-1">📑</div>
                       <div className="font-bold text-gray-900">Deep Summary</div>
                       <div className="text-xs text-gray-500">Formulas & Concepts</div>
                    </button>
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !topic}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader /> : (
                    <>
                        <span>{generateMode === 'DECK' ? 'Forge Deck' : 'Generate Report'}</span>
                        <span className="text-xl">⚡</span>
                    </>
                )}
              </button>
           </form>

           <div className="mt-8">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Popular Topics</p>
              <div className="flex flex-wrap justify-center gap-2">
                 {['Physics Formulas', 'Organic Chemistry', 'World War II Dates', 'JS Array Methods'].map(t => (
                    <button 
                       key={t}
                       onClick={() => setTopic(t)}
                       className="px-3 py-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-xs font-medium transition-colors"
                    >
                       {t}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER: REPORT VIEW ---
  if (view === 'REPORT') {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-20">
         <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-20 z-10">
            <button 
              onClick={() => setView('SETUP')}
              className="text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
               <span>←</span> Back
            </button>
            <div className="text-center">
               <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Deep Dive Report</span>
               <h3 className="font-serif font-bold text-xl text-gray-900">{topic}</h3>
            </div>
            <button 
              onClick={() => window.print()}
              className="text-indigo-600 font-bold text-sm hover:underline"
            >
               🖨️ Print
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
               <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px]">
                  <div className="bg-indigo-900 p-8 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
                     <h2 className="text-3xl font-serif font-bold relative z-10 mb-2">{deepInsight?.bookTitle}</h2>
                     <p className="text-indigo-200 relative z-10 italic">by {deepInsight?.author}</p>
                     
                     <div className="mt-6 inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-sm">
                        <span className="font-bold text-indigo-200 uppercase text-xs mr-2">Core Insight:</span>
                        {deepInsight?.summary}
                     </div>
                  </div>

                  <div className="p-10 prose prose-indigo max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">
                     <ReactMarkdown>{deepDiveContent}</ReactMarkdown>
                  </div>
               </div>
            </div>

            {/* Sidebar Metadata */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-amber-500">
                  <h4 className="font-bold text-gray-900 mb-2">Why this book?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                     Our AI identified "{deepInsight?.bookTitle}" as the most authoritative source in our library for <strong>{topic}</strong>. This summary extracts the specific methodology and axioms from this text.
                  </p>
               </div>

               <div className="bg-gradient-to-br from-gray-50 to-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <span className="text-xl">📊</span> Study Tools
                  </h4>
                  <div className="space-y-2">
                     <button className="w-full text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 flex justify-between items-center group">
                        <span>Extract Formulas Only</span>
                        <span className="text-gray-400 group-hover:text-indigo-500">→</span>
                     </button>
                     <button className="w-full text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 flex justify-between items-center group">
                        <span>Generate Quiz from Report</span>
                        <span className="text-gray-400 group-hover:text-indigo-500">→</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // --- RENDER: FLASHCARD STUDY VIEW ---
  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
       {/* Header */}
       <div className="flex justify-between items-center mb-8 px-4">
          <button 
            onClick={() => setView('SETUP')}
            className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1"
          >
             ← New Topic
          </button>
          <div className="text-center">
             <h3 className="font-bold text-gray-900">{topic}</h3>
             <p className="text-xs text-gray-500">Card {currentIndex + 1} of {cards.length}</p>
          </div>
          <div className="w-20"></div> {/* Spacer */}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         
         {/* LEFT: FLASHCARD STACK */}
         <div className="lg:col-span-2 flex flex-col items-center">
            <div 
              className="relative w-full max-w-lg aspect-[3/2] cursor-pointer group perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                  className={`w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}
                  style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                  {/* FRONT */}
                  <div 
                      className="absolute inset-0 backface-hidden bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                      style={{ backfaceVisibility: 'hidden' }}
                  >
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Question</span>
                      <p className="text-2xl md:text-3xl font-serif font-medium text-gray-900 leading-snug">
                          {currentCard.front}
                      </p>
                      <p className="absolute bottom-6 text-xs text-gray-400">Click to flip</p>
                  </div>

                  {/* BACK */}
                  <div 
                      className="absolute inset-0 backface-hidden bg-gray-900 rounded-3xl flex flex-col items-center justify-center p-8 text-center rotate-y-180"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Answer</span>
                      <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                          {currentCard.back}
                      </p>
                  </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-10">
                <button 
                  onClick={prevCard}
                  className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50 shadow-md transition-transform hover:scale-110 active:scale-95"
                >
                  ←
                </button>
                
                <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                  ></div>
                </div>

                <button 
                  onClick={nextCard}
                  className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl hover:bg-black shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  →
                </button>
            </div>
            <p className="mt-8 text-gray-400 text-sm">Spacebar to flip • Arrows to navigate</p>
         </div>

         {/* RIGHT: DEEP INSIDER BOX (SIDEBAR) */}
         <div className="lg:col-span-1">
            <div 
              onClick={handleDeepDiveModalOpen}
              className="group cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200 rounded-full blur-2xl opacity-50 -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
               
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-amber-200">Premium Insight</span>
                      <span className="text-amber-500 animate-pulse">●</span>
                   </div>
                   
                   <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Deep Insider</h3>
                   <p className="text-sm text-gray-600 mb-6">
                      Get a comprehensive summary, key formulas, and graph descriptions from the authoritative book on <span className="font-bold text-gray-900">{topic}</span>.
                   </p>

                   <div className="bg-white/60 p-4 rounded-xl border border-amber-100 mb-6">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Source Book</p>
                      <p className="font-bold text-gray-900 leading-tight">"{deepInsight?.bookTitle || 'Loading...'}"</p>
                      <p className="text-xs text-gray-500 mt-1">by {deepInsight?.author || '...'}</p>
                   </div>

                   <button className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl shadow-md group-hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                      <span>Unlock Full Summary</span>
                      <span>🔓</span>
                   </button>
               </div>
            </div>
         </div>
       </div>

       {/* DEEP DIVE MODAL (Only used in STUDY mode for overlay) */}
       {showDeepDiveModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
               {/* Modal Header */}
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">Deep Insider Report</h3>
                    <p className="text-xs text-gray-500">Source: {deepInsight?.bookTitle}</p>
                  </div>
                  <button 
                    onClick={() => setShowDeepDiveModal(false)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
               </div>

               {/* Modal Content */}
               <div className="flex-1 overflow-y-auto p-8">
                  {loadingDeepDive ? (
                     <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Loader />
                        <p className="text-gray-500 font-medium animate-pulse text-sm">Synthesizing formulas and concepts...</p>
                     </div>
                  ) : (
                     <div className="prose prose-indigo max-w-none prose-sm md:prose-base">
                        <ReactMarkdown>{deepDiveContent}</ReactMarkdown>
                     </div>
                  )}
               </div>

               {/* Modal Footer */}
               <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button 
                    onClick={() => setShowDeepDiveModal(false)}
                    className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors"
                  >
                    Close Report
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
