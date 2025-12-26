
import React, { useState } from 'react';
import { searchLibraryInventory } from '../services/geminiService';
import Antigravity from './Animations/Antigravity';

interface LandingPageProps {
  onGetStarted: () => void;
  onGoToLibrary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onGoToLibrary }) => {
  const [adminQuery, setAdminQuery] = useState('');
  const [adminResults, setAdminResults] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAdminSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminQuery.trim()) return;
    setAdminLoading(true);
    setHasSearched(true);
    const results = await searchLibraryInventory(adminQuery);
    setAdminResults(results);
    setAdminLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Animation */}
      <div className="absolute inset-0 top-0 h-[80vh] w-full z-0 overflow-hidden pointer-events-none">
        <div className="w-full h-full opacity-60">
            {/* Enable pointer events specifically for the canvas if interaction is needed */}
            <div className="w-full h-full pointer-events-auto">
                <Antigravity
                    count={300}
                    magnetRadius={8}
                    ringRadius={8}
                    waveSpeed={0.4}
                    waveAmplitude={1}
                    particleSize={1.5}
                    lerpSpeed={0.05}
                    color={'#6366f1'} // indigo-500
                    autoAnimate={true}
                    particleVariance={1}
                />
            </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20 pb-20 relative z-10 pointer-events-none">
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 pointer-events-auto">
          
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="cursor-target px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold tracking-wide uppercase border border-indigo-200 inline-block mb-4 hover:scale-105 transition-transform">
              Beta V1.0 Live
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight font-serif cursor-target">
              Read Less. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-indigo-600 animate-text-shimmer">
                Learn More.
              </span>
            </h1>
          </div>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in cursor-target" style={{ animationDelay: '0.3s' }}>
            An AI-powered digital library that guides you on what to read, what to skip, and how to master concepts in half the time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <button 
              onClick={onGetStarted}
              className="cursor-target px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 w-full sm:w-auto"
            >
              Get Started / Sign Up
            </button>
            <button 
              onClick={onGetStarted}
              className="cursor-target px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-md hover:shadow-lg border border-gray-100 transition-all w-full sm:w-auto flex items-center justify-center gap-2 group"
            >
              <span>Login</span>
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.6s' }}>
             <button onClick={onGoToLibrary} className="hover:text-indigo-600 underline decoration-indigo-300">Try Institution Demo (No Login)</button>
          </div>

          {/* Feature Grid Mini */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="glass-panel p-6 rounded-2xl cursor-target hover:bg-white transition-colors duration-300">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-bold text-gray-900 mb-1">AI Guided</h3>
              <p className="text-sm text-gray-600">We tell you exactly which chapters matter for your specific exam.</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl cursor-target hover:bg-white transition-colors duration-300">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-1">Decision First</h3>
              <p className="text-sm text-gray-600">ROI scores for every book. Know the value before you open it.</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl cursor-target hover:bg-white transition-colors duration-300">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-1">Role Based</h3>
              <p className="text-sm text-gray-600">Interfaces tailored for Students, Researchers, and Professionals.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Institution / Library Section (New) */}
      <div className="relative py-24 bg-white bg-opacity-80 backdrop-blur-lg border-t border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-bold tracking-widest uppercase text-sm cursor-target">For Universities & Public Libraries</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mt-2 mb-6 cursor-target">The "Digital Twin" of Your Library</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto cursor-target">
              Transform passive bookshelves into an active, intelligent learning resource. 
              Students don't just search for books; they solve their academic problems using your inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-8">
              <div className="flex gap-4 items-start cursor-target">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔍</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Contextual Discovery</h3>
                  <p className="text-gray-600 mt-1">Students input "I'm weak in Thermodynamics", and our AI finds the *exact* physical book on your shelf that explains it best for their level.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start cursor-target">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📅</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Smart Pre-Booking</h3>
                  <p className="text-gray-600 mt-1">Reduce shelf chaos. Students reserve books digitally and pick them up only when confirmed available.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start cursor-target">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📊</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Inventory Intelligence</h3>
                  <p className="text-gray-600 mt-1">Know which books are actually delivering learning outcomes, not just which ones are being borrowed.</p>
                </div>
              </div>
              
              <button onClick={onGoToLibrary} className="cursor-target mt-4 px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-lg">
                Try Library Demo
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transform rotate-3 rounded-3xl opacity-20 blur-xl"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                <div className="space-y-4">
                  {/* Mock Chat UI */}
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white p-3 rounded-t-xl rounded-bl-xl text-sm max-w-[80%]">
                      I have a physics exam tomorrow and I don't understand Rotational Motion.
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-t-xl rounded-br-xl text-sm max-w-[90%] shadow-sm">
                      <p className="font-bold text-indigo-600 mb-1">🤖 AI Librarian:</p>
                      Don't panic. Based on our library inventory:
                      <br/><br/>
                      1. <strong>Concepts of Physics (Vol 1)</strong> - Shelf B4. Read Chapter 7 only (Pages 180-195). It simplifies the concept best.
                      <br/><br/>
                      <span className="text-green-600 font-bold">✓ 3 copies available.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Librarian Quick Search (New) */}
          <div className="glass-panel p-8 rounded-3xl border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 cursor-target">Librarian's Quick Search</h3>
            <p className="text-gray-600 mb-6 cursor-target">Admin tools for instant inventory checks using natural language.</p>
            
            <form onSubmit={handleAdminSearch} className="flex flex-col md:flex-row gap-4 mb-8">
              <input 
                type="text" 
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
                placeholder="e.g. 'Books about history suitable for beginners', 'Physics books with high availability'..."
                className="cursor-target flex-1 px-5 py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button 
                type="submit" 
                disabled={adminLoading}
                className="cursor-target px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-70 whitespace-nowrap"
              >
                {adminLoading ? 'Searching...' : 'AI Inventory Search'}
              </button>
            </form>

            {hasSearched && (
              <div className="space-y-4">
                 {adminResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {adminResults.map((book) => (
                        <div key={book.id} className="cursor-target bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-xl flex-shrink-0">📘</div>
                          <div>
                            <h4 className="font-bold text-gray-900">{book.title}</h4>
                            <p className="text-xs text-gray-500 mb-1">{book.author} • {book.available} copies</p>
                            <p className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">{book.matchReason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                 ) : (
                    !adminLoading && (
                      <div className="text-center py-6 text-gray-500">
                        No matches found in the current mock inventory. Try "physics" or "history".
                      </div>
                    )
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-900 cursor-target">CogniLib</h2>
          <p className="text-gray-500 mt-2 cursor-target">The future of active learning.</p>
          <div className="flex justify-center gap-6 mt-6">
            <span className="text-gray-400 cursor-pointer hover:text-gray-600 cursor-target">Privacy</span>
            <span className="text-gray-400 cursor-pointer hover:text-gray-600 cursor-target">Terms</span>
            <span className="text-gray-400 cursor-pointer hover:text-gray-600 cursor-target">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
