
import React, { useState, useEffect } from 'react';
import { recommendLibraryBooks, analyzeReadingHabits } from '../../services/geminiService';
import Loader from '../UI/Loader';
import CircularGallery from '../Animations/CircularGallery';
import { MOCK_LIBRARY_INVENTORY } from '../../constants';
import { User, UserRole } from '../../types';

interface LibraryAssistantProps {
  user?: User | null;
}

export const LibraryAssistant: React.FC<LibraryAssistantProps> = ({ user }) => {
  const [viewMode, setViewMode] = useState<'DISCOVERY' | 'SHELF'>('DISCOVERY');
  
  // Wizard State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [course, setCourse] = useState('');
  const [reason, setReason] = useState('');
  const [format, setFormat] = useState<'Physical' | 'E-Book'>('Physical');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [reservedBooks, setReservedBooks] = useState<string[]>([]);
  const [galleryItems, setGalleryItems] = useState<{image: string, text: string}[]>([]);

  // AI Shelf State
  const [analyzing, setAnalyzing] = useState(false);
  const [readingAnalysis, setReadingAnalysis] = useState<any>(null);
  
  // Mock Read History for demonstration
  const mockReadHistory = [
     'Concepts of Physics (Vol 1 & 2)', 
     'Clean Code', 
     'Sapiens: A Brief History of Humankind'
  ];

  // Auto-detect stream from user profile
  useEffect(() => {
    if (user && user.targetExam && step === 1 && user.role === UserRole.STUDENT) {
      if (['JEE Mains', 'JEE Advanced', 'NEET UG'].includes(user.targetExam)) {
        setCourse('JEE / NEET');
        setStep(2);
      } else if (['UPSC CSE', 'SSC CGL', 'IBPS PO'].includes(user.targetExam)) {
        setCourse('UPSC / Govt Exams');
        setStep(2);
      } else if (['GATE'].includes(user.targetExam)) {
        setCourse('Engineering');
        setStep(2);
      }
    }
  }, [user, step]);

  useEffect(() => {
    if (viewMode === 'SHELF' && !readingAnalysis) {
       fetchReadingInsights();
    }
  }, [viewMode]);

  const fetchReadingInsights = async () => {
    setAnalyzing(true);
    const result = await analyzeReadingHabits(user || {}, mockReadHistory, reservedBooks);
    setReadingAnalysis(result);
    setAnalyzing(false);
  }

  // Configurations based on User Role
  const isProfessional = user?.role === UserRole.PROFESSIONAL;
  const isResearcher = user?.role === UserRole.RESEARCHER;

  const courses = isProfessional 
    ? ['Technology Management', 'Corporate Strategy', 'Finance & Markets', 'Human Psychology', 'Product Design', 'Legal & Compliance']
    : isResearcher
    ? ['Research Methodology', 'Statistical Analysis', 'Academic Writing', 'Ethics & Compliance', 'Grant Funding', 'Data Science']
    : ['Engineering', 'Medical', 'UPSC / Govt Exams', 'JEE / NEET', 'Commerce / CA', 'Arts / Humanities'];

  const reasons = isProfessional
    ? [
        { id: 'problem', label: 'Solving a specific problem', icon: '🔧' },
        { id: 'upskill', label: 'Upskilling / Certification', icon: '📈' },
        { id: 'innovation', label: 'Researching Innovation', icon: '💡' },
        { id: 'leadership', label: 'Leadership & Soft Skills', icon: '🤝' }
      ]
    : isResearcher
    ? [
        { id: 'lit_review', label: 'Literature Review', icon: '📑' },
        { id: 'method', label: 'Methodology Reference', icon: '⚗️' },
        { id: 'writing', label: 'Writing & Publishing', icon: '✍️' },
        { id: 'grant', label: 'Grant Proposal', icon: '💰' }
      ]
    : [
        { id: 'exam', label: 'Exam Preparation', icon: '📝' },
        { id: 'concept', label: 'Concept Clarity', icon: '🧠' },
        { id: 'research', label: 'Research / Deep Dive', icon: '🔬' },
        { id: 'casual', label: 'General / Casual Reading', icon: '☕' }
      ];

  const formats = [
    { id: 'ebook', label: 'E-Book', icon: '📱', desc: 'Instant access, read anywhere' },
    { id: 'physical', label: 'Physical Book', icon: '📖', desc: 'Locate on shelf, distraction free' }
  ];

  const handleFormatSelect = async (selectedFormat: 'Physical' | 'E-Book') => {
    setFormat(selectedFormat);
    setLoading(true);
    setStep(4);
    
    // Get recommendations from Gemini
    const results = await recommendLibraryBooks(course, reason);
    setRecommendations(results);
    
    // Generate gallery items for the "50 books" visualization
    let expandedInventory = [...MOCK_LIBRARY_INVENTORY];
    while (expandedInventory.length < 50) {
        expandedInventory = [...expandedInventory, ...MOCK_LIBRARY_INVENTORY];
    }

    const galleryFiller = expandedInventory.slice(0, 50).map((book, idx) => ({
      image: `https://picsum.photos/seed/${book.id + idx}/600/800`,
      text: book.title.length > 20 ? book.title.substring(0, 18) + '...' : book.title
    }));
    
    setGalleryItems(galleryFiller);
    setLoading(false);
  };

  const handleReserve = (bookId: string) => {
    if (!reservedBooks.includes(bookId)) {
       setReservedBooks([...reservedBooks, bookId]);
    }
  };

  const cancelReservation = (bookId: string) => {
    setReservedBooks(prev => prev.filter(id => id !== bookId));
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400 text-sm">
        {'★'.repeat(Math.floor(rating))}
        {'☆'.repeat(5 - Math.floor(rating))}
        <span className="text-gray-400 ml-1 text-xs">({rating})</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="flex justify-center mb-8">
         <div className="bg-gray-100 p-1 rounded-xl flex gap-1 shadow-inner">
            <button 
               onClick={() => setViewMode('DISCOVERY')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'DISCOVERY' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
               {isProfessional ? 'Inventory Search' : isResearcher ? 'Source Locator' : 'Smart Discovery'}
            </button>
            <button 
               onClick={() => setViewMode('SHELF')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'SHELF' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
               <span>{isProfessional ? 'My Office Shelf' : 'My AI Shelf'}</span>
               {reservedBooks.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
            </button>
         </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-2 font-serif">
           {viewMode === 'DISCOVERY' 
             ? (isProfessional ? 'Professional Knowledge Base' : isResearcher ? 'Research Material Access' : 'Smart Library & Pre-Booking') 
             : 'Your Personal Library Hub'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {viewMode === 'DISCOVERY' 
            ? (user 
                ? `Welcome, ${user.name}. ${isProfessional ? 'Find authoritative texts to solve your business challenges.' : isResearcher ? 'Access methodology handbooks and core literature.' : `We've prioritized books for ${user.targetExam || 'your stream'}.`}` 
                : 'Access our real-world inventory. Choose your profession, need, and format to find the perfect match.')
            : 'Track your reading DNA, manage physical reservations, and see what AI picked for you.'
          }
        </p>
      </div>

      {viewMode === 'SHELF' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
           {/* LEFT COLUMN: RESERVATIONS */}
           <div className="md:col-span-8 space-y-8">
              
              {/* Active Reservations */}
              <div className="glass-panel p-6 rounded-3xl shadow-lg">
                 <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📅</span> Active Reservations
                 </h3>
                 {reservedBooks.length > 0 ? (
                    <div className="space-y-4">
                       {reservedBooks.map(id => {
                          const book = MOCK_LIBRARY_INVENTORY.find(b => b.id === id);
                          if (!book) return null;
                          return (
                             <div key={id} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                                <img src={(book as any).coverUrl || `https://picsum.photos/seed/${id}/100/150`} alt="cover" className="w-12 h-16 object-cover rounded shadow" />
                                <div className="flex-1">
                                   <h4 className="font-bold text-gray-900">{book.title}</h4>
                                   <p className="text-xs text-gray-500">Pickup by: {new Date(Date.now() + 86400000).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                   <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded mb-1">Ready for Pickup</div>
                                   <button onClick={() => cancelReservation(id)} className="text-xs text-red-400 hover:text-red-600 underline">Cancel</button>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <p className="text-gray-400 mb-2">No active book reservations.</p>
                       <button onClick={() => setViewMode('DISCOVERY')} className="text-indigo-600 font-bold text-sm hover:underline">Browse Library</button>
                    </div>
                 )}
              </div>

              {/* Reading History */}
              <div className="glass-panel p-6 rounded-3xl shadow-lg opacity-75">
                 <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📚</span> Past Reads (Mock History)
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {mockReadHistory.map((title, i) => (
                       <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm border border-gray-200">
                          {title}
                       </span>
                    ))}
                 </div>
              </div>
           </div>

           {/* RIGHT COLUMN: AI INSIGHTS */}
           <div className="md:col-span-4">
              <div className="bg-gradient-to-b from-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden h-full">
                 {/* Background Effects */}
                 <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-30"></div>
                 
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                       <span className="text-2xl">🧬</span> Reading DNA
                    </h3>

                    {analyzing ? (
                       <div className="flex flex-col items-center justify-center py-10 space-y-4">
                          <Loader />
                          <p className="text-indigo-200 text-sm animate-pulse">Analyzing reading patterns...</p>
                       </div>
                    ) : readingAnalysis ? (
                       <div className="space-y-6">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                <p className="text-[10px] text-indigo-200 uppercase">Interest</p>
                                <p className="font-bold text-sm">{readingAnalysis.dna?.primaryInterest || 'N/A'}</p>
                             </div>
                             <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                <p className="text-[10px] text-indigo-200 uppercase">Habit Score</p>
                                <p className="font-bold text-xl text-green-400">{readingAnalysis.habitScore || 0}</p>
                             </div>
                          </div>

                          <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                             <p className="text-[10px] text-indigo-200 uppercase mb-1">AI Insight</p>
                             <p className="text-sm font-medium leading-relaxed italic">"{readingAnalysis.insight}"</p>
                          </div>

                          {readingAnalysis.nextRecommendation && (
                             <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-400/30">
                                <p className="text-[10px] text-indigo-200 uppercase mb-2">Recommended Next</p>
                                <div className="flex gap-3 items-start">
                                   <div className="w-10 h-14 bg-indigo-800 rounded shadow-md shrink-0"></div>
                                   <div>
                                      <p className="font-bold text-sm leading-tight mb-1">{readingAnalysis.nextRecommendation.title}</p>
                                      <p className="text-[10px] text-indigo-100 opacity-80">{readingAnalysis.nextRecommendation.reason}</p>
                                   </div>
                                </div>
                             </div>
                          )}
                       </div>
                    ) : (
                       <div className="text-center text-indigo-200">
                          Could not generate profile.
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      ) : (
        /* DISCOVERY WIZARD (Role Adapted) */
        <>
            {step === 1 && (
                <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-bold text-center mb-6">Step 1: {isProfessional ? 'Choose your Industry' : isResearcher ? 'Select Research Field' : 'Choose your Profession / Stream'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((c) => (
                    <button
                        key={c}
                        onClick={() => { setCourse(c); setStep(2); }}
                        className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                    >
                        <span className="text-lg font-bold group-hover:text-indigo-600 transition-colors">{c}</span>
                    </button>
                    ))}
                </div>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-3xl mx-auto animate-fade-in">
                {(!user || !user.targetExam || isProfessional || isResearcher) && <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-indigo-600 mb-4">← Back</button>}
                
                <h3 className="text-xl font-bold text-center mb-6">
                    Step 2: What is your goal in <span className="text-indigo-600">{course}</span>?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reasons.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => { setReason(r.label); setStep(3); }}
                        className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left flex items-center gap-4 group"
                    >
                        <span className="text-3xl">{r.icon}</span>
                        <span className="text-lg font-bold group-hover:text-indigo-600 transition-colors">{r.label}</span>
                    </button>
                    ))}
                </div>
                </div>
            )}

            {step === 3 && (
                <div className="max-w-3xl mx-auto animate-fade-in">
                <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-indigo-600 mb-4">← Back</button>
                <h3 className="text-xl font-bold text-center mb-6">Step 3: Preferred Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formats.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => handleFormatSelect(f.label as 'Physical' | 'E-Book')}
                        className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left flex items-center gap-4 group"
                    >
                        <span className="text-4xl">{f.icon}</span>
                        <div>
                        <span className="block text-xl font-bold group-hover:text-indigo-600 transition-colors">{f.label}</span>
                        <span className="text-sm text-gray-500">{f.desc}</span>
                        </div>
                    </button>
                    ))}
                </div>
                {loading && (
                    <div className="mt-12 flex justify-center">
                    <Loader />
                    </div>
                )}
                </div>
            )}

            {step === 4 && (
                <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-indigo-600">← Start Over</button>
                    <div className="text-sm text-gray-500">
                        Matches for <span className="font-bold text-indigo-600">{course}</span> • <span className="font-bold text-indigo-600">{reason}</span> • <span className="font-bold text-indigo-600">{format}</span>
                    </div>
                </div>

                {/* 3D Gallery for Browsing */}
                <div className="mb-12 h-[500px] w-full bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800 group">
                    <div className="absolute top-4 left-6 z-10 text-white/80 text-sm font-bold uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                        Interactive Collection (50+ Books)
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 z-10 text-center text-white/50 text-xs pointer-events-none">
                        Drag to rotate • Scroll to zoom
                    </div>
                    {galleryItems.length > 0 && (
                        <CircularGallery 
                        items={galleryItems} 
                        bend={2} 
                        textColor="#ffffff" 
                        borderRadius={0.05}
                        scrollSpeed={3}
                        />
                    )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Top AI Recommendations</h3>
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader /></div>
                    ) : (
                        recommendations.map((book, idx) => (
                        <div 
                            key={idx} 
                            className="glass-panel p-6 rounded-2xl shadow-md border-l-4 border-amber-500 flex flex-col md:flex-row gap-6 hover:bg-white transition-colors"
                        >
                            <div className="w-full md:w-32 h-44 bg-gray-200 rounded-lg shadow-inner flex flex-col items-center justify-center flex-shrink-0 text-gray-400 overflow-hidden relative">
                            <img src={`https://picsum.photos/seed/${book.id}/200/300`} alt="Cover" className="w-full h-full object-cover" />
                            {format === 'E-Book' && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-1">PDF</div>
                            )}
                            </div>

                            <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                <h3 className="text-2xl font-bold text-gray-900 font-serif">{book.title}</h3>
                                <p className="text-gray-600 font-medium">{book.author}</p>
                                </div>
                                <div className="text-right">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${book.available > 0 || format === 'E-Book' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {format === 'E-Book' ? 'Instant Access' : (book.available > 0 ? `${book.available} In Stock` : 'Out of Stock')}
                                </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                {book.rating && renderStars(book.rating)}
                                {book.reviews && <span className="text-xs text-gray-500 underline cursor-pointer">{book.reviews} Student Reviews</span>}
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-xl mb-4 border border-indigo-100">
                                <p className="text-sm font-bold text-indigo-800 mb-1">AI Librarian Note:</p>
                                <p className="text-gray-700 text-sm leading-relaxed">{book.matchReason}</p>
                            </div>

                            <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500 font-mono">
                                {format === 'Physical' 
                                    ? `LOCATION: SHELF ${Math.floor(Math.random() * 10) + 1}-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`
                                    : 'FILE SIZE: 12.5 MB • EPUB/PDF'
                                }
                                </span>
                                
                                {format === 'Physical' ? (
                                    reservedBooks.includes(book.id) ? (
                                    <button disabled className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold shadow-sm cursor-default">
                                        ✓ Reserved (24h)
                                    </button>
                                    ) : (
                                    <button 
                                        onClick={() => handleReserve(book.id)}
                                        disabled={book.available === 0}
                                        className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold shadow-md transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {book.available === 0 ? 'Notify Me' : 'Pre-Book'}
                                    </button>
                                    )
                                ) : (
                                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all hover:-translate-y-1">
                                        ⬇ Download
                                    </button>
                                )}
                            </div>
                            </div>
                        </div>
                        ))
                    )}
                </div>
                </div>
            )}
        </>
      )}
    </div>
  );
};
