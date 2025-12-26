import React from 'react';
import { Book } from '../../types';

interface SmartBookPageProps {
  book: Book;
  onBack: () => void;
  onGenerateNotes: (book: Book) => void;
}

export const SmartBookPage: React.FC<SmartBookPageProps> = ({ book, onBack, onGenerateNotes }) => {
  return (
    <div className="animate-fade-in pb-20">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
      >
        ← Back to Library
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Book Cover & Quick Stats */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="glass-panel p-6 rounded-2xl shadow-lg text-center">
              <img 
                src={book.coverUrl} 
                alt={book.title} 
                className="w-48 mx-auto rounded-md shadow-md mb-6 transform hover:scale-105 transition-transform duration-300"
              />
              <h1 className="text-2xl font-bold text-gray-900 mb-1 font-serif">{book.title}</h1>
              <p className="text-gray-600 mb-4">{book.author}</p>
              
              <div className="flex justify-center space-x-2 mb-6">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{book.category}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{book.level}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Read Time</p>
                  <p className="font-semibold text-gray-900">{book.readTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">ROI Score</p>
                  <div className="flex items-center justify-center">
                    <span className={`font-bold text-lg ${book.aiInsights.roiScore > 85 ? 'text-green-600' : 'text-amber-600'}`}>
                      {book.aiInsights.roiScore}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">/100</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onGenerateNotes(book)}
                className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                ✨ AI Generate Notes
              </button>
            </div>
          </div>
        </div>

        {/* Right: Decision Intelligence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verdict Card */}
          <div className="glass-panel p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500">
            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span> AI Verdict
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">Best For</p>
                <p className="text-gray-900">{book.aiInsights.bestFor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">Skip If</p>
                <p className="text-gray-900">{book.aiInsights.whoShouldSkip}</p>
              </div>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="bg-white bg-opacity-80 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What you will learn</h3>
            <ul className="space-y-3">
              {book.aiInsights.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Description (De-prioritized) */}
          <div className="bg-white bg-opacity-60 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">About the Book</h3>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
