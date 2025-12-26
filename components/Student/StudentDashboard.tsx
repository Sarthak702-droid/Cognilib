
import React, { useState } from 'react';
import { MOCK_BOOKS } from '../../constants';
import { Book, User } from '../../types';
import { SmartBookPage } from './SmartBookPage';
import { StudyPlanner } from './StudyPlanner';
import { NotesEngine } from './NotesEngine';
import { QuestionGenerator } from './QuestionGenerator';
import { TheNeuralArena } from './TheNeuralArena';
import { LibraryAssistant } from '../Library/LibraryAssistant';
import { StudentAnalysis } from './StudentAnalysis';
import { FlashcardForge } from './FlashcardForge';

interface StudentDashboardProps {
  user: User;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'library' | 'planner' | 'notes' | 'quiz' | 'flashcards' | 'arena' | 'analysis'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleBackToLibrary = () => {
    setSelectedBook(null);
  };

  const handleGenerateNotesFromBook = (book: Book) => {
    setSelectedBook(null); // Close book detail
    setActiveTab('notes');
  };

  // If a book is selected, show the Smart Page
  if (selectedBook) {
    return (
      <div className="pt-6">
        <SmartBookPage 
          book={selectedBook} 
          onBack={handleBackToLibrary} 
          onGenerateNotes={handleGenerateNotesFromBook} 
        />
      </div>
    );
  }

  return (
    <div className="pt-6 animate-fade-in">
      {/* Dashboard Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white bg-opacity-60 p-4 rounded-xl shadow-sm border border-white">
          <p className="text-xs text-gray-500 uppercase font-bold">Welcome</p>
          <p className="text-2xl font-bold text-indigo-600 truncate">{user.name}</p>
          <p className="text-xs text-gray-500">{user.educationLevel} • {user.targetExam || 'General'}</p>
        </div>
        <div className="bg-white bg-opacity-60 p-4 rounded-xl shadow-sm border border-white">
          <p className="text-xs text-gray-500 uppercase font-bold">Daily Streak</p>
          <p className="text-2xl font-bold text-indigo-600">🔥 12 Days</p>
        </div>
        <div className="bg-white bg-opacity-60 p-4 rounded-xl shadow-sm border border-white md:col-span-2">
          <p className="text-xs text-gray-500 uppercase font-bold">Next Action</p>
          <p className="text-lg font-medium text-gray-800">Practice {user.targetExam || 'Core'} Questions (30 min)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 bg-white bg-opacity-50 p-1 rounded-xl w-fit mx-auto backdrop-blur-sm shadow-sm overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveTab('library')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'library' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Library
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          <span>Analysis</span>
          <span className="bg-indigo-100 text-indigo-600 text-[9px] px-1.5 rounded font-bold">AI</span>
        </button>
        <button 
          onClick={() => setActiveTab('planner')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'planner' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Planner
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'notes' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Visual Notes
        </button>
        <button 
          onClick={() => setActiveTab('quiz')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'quiz' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Quiz
        </button>
        <button 
          onClick={() => setActiveTab('flashcards')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'flashcards' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          🗂️ Flashcards
        </button>
        <button 
          onClick={() => setActiveTab('arena')}
          className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all overflow-hidden group ${activeTab === 'arena' ? 'bg-gray-900 text-white shadow-lg ring-2 ring-indigo-500 ring-offset-2' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <span className="relative z-10 flex items-center gap-2">
            🧬 Arena <span className="text-[9px] bg-red-500 text-white px-1.5 rounded-full">NEW</span>
          </span>
          {activeTab === 'arena' && <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 opacity-50"></div>}
        </button>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'library' && (
          <LibraryAssistant user={user} />
        )}

        {activeTab === 'analysis' && <StudentAnalysis user={user} />}
        {activeTab === 'planner' && <StudyPlanner />}
        {activeTab === 'notes' && <NotesEngine books={MOCK_BOOKS} />}
        {activeTab === 'quiz' && <QuestionGenerator user={user} />}
        {activeTab === 'flashcards' && <FlashcardForge />}
        {activeTab === 'arena' && <TheNeuralArena user={user} />}
      </div>
    </div>
  );
};
