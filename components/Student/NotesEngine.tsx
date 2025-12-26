
import React, { useState } from 'react';
import { Book } from '../../types';
import { generateBookNotes, generatePdfNotes } from '../../services/geminiService';
import Loader from '../UI/Loader';
import ReactMarkdown from 'react-markdown';

interface NotesEngineProps {
  books: Book[];
  preselectedBook?: Book | null;
}

export const NotesEngine: React.FC<NotesEngineProps> = ({ books, preselectedBook }) => {
  const [sourceMode, setSourceMode] = useState<'LIBRARY' | 'UPLOAD'>('LIBRARY');
  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBook?.id || '');
  const [topic, setTopic] = useState('');
  
  // PDF State
  const [pdfData, setPdfData] = useState<string>('');
  const [pdfName, setPdfName] = useState('');

  const [type, setType] = useState<'SUMMARY' | 'REVISION' | 'FORMULA' | 'DIAGRAM'>('SUMMARY');
  const [style, setStyle] = useState<'BEGINNER' | 'EXAM' | 'QUICK'>('EXAM');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a valid PDF file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size too large (Max 10MB).');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // strip prefix "data:application/pdf;base64,"
        const data = base64.split(',')[1];
        setPdfData(data);
        setPdfName(file.name);
      };
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setNotes(''); // Clear previous results
    
    let result = '';

    if (sourceMode === 'LIBRARY') {
        const book = books.find(b => b.id === selectedBookId);
        if (!book || !topic) {
            setLoading(false);
            return;
        }
        result = await generateBookNotes(book, topic, type, style);
    } else {
        if (!pdfData) {
            setLoading(false);
            return;
        }
        result = await generatePdfNotes(pdfData, type, style);
    }

    setNotes(result);
    setLoading(false);
  };

  const canGenerate = () => {
      if (sourceMode === 'LIBRARY') return selectedBookId && topic;
      return pdfData && pdfName;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">AI Notes & Visualizer</h2>
        <p className="text-gray-600">Turn lengthy chapters or PDF documents into smart notes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl shadow-md">
            
            {/* Source Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                <button 
                   onClick={() => setSourceMode('LIBRARY')}
                   className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sourceMode === 'LIBRARY' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                >
                   Library Book
                </button>
                <button 
                   onClick={() => setSourceMode('UPLOAD')}
                   className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sourceMode === 'UPLOAD' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
                >
                   Upload PDF
                </button>
            </div>

            {sourceMode === 'LIBRARY' ? (
                <>
                    <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Book</label>
                    <select 
                        value={selectedBookId}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="">-- Choose a Book --</option>
                        {books.map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                    </select>
                    </div>

                    <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specific Topic</label>
                    <input 
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Thermodynamics Laws"
                        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    </div>
                </>
            ) : (
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Document</label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                        <input 
                            type="file" 
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-3xl mb-2">📄</div>
                        {pdfName ? (
                            <p className="text-sm font-bold text-indigo-600 break-all">{pdfName}</p>
                        ) : (
                            <div>
                                <p className="text-sm font-medium text-gray-600">Click to upload PDF</p>
                                <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Note Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setType('SUMMARY')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all border ${type === 'SUMMARY' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                >
                  Summary
                </button>
                <button 
                  onClick={() => setType('REVISION')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all border ${type === 'REVISION' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                >
                  Revision
                </button>
                <button 
                  onClick={() => setType('FORMULA')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all border ${type === 'FORMULA' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                >
                  Formulas
                </button>
                <button 
                  onClick={() => setType('DIAGRAM')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 ${type === 'DIAGRAM' ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-100 hover:border-purple-300'}`}
                >
                  <span>✨ Diagram</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Style / Difficulty</label>
              <div className="space-y-2">
                <button 
                  onClick={() => setStyle('BEGINNER')}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${style === 'BEGINNER' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                   <div className="text-xl">👶</div>
                   <div>
                      <div className="font-bold text-sm text-gray-900">Beginner</div>
                      <div className="text-[10px] text-gray-500">Simple analogies, no jargon</div>
                   </div>
                </button>
                
                <button 
                  onClick={() => setStyle('EXAM')}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${style === 'EXAM' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                   <div className="text-xl">🎓</div>
                   <div>
                      <div className="font-bold text-sm text-gray-900">Exam-Focused</div>
                      <div className="text-[10px] text-gray-500">High-yield, academic keywords</div>
                   </div>
                </button>

                <button 
                  onClick={() => setStyle('QUICK')}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${style === 'QUICK' ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                   <div className="text-xl">⚡</div>
                   <div>
                      <div className="font-bold text-sm text-gray-900">Quick Revision</div>
                      <div className="text-[10px] text-gray-500">Bullet points, TL;DR only</div>
                   </div>
                </button>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !canGenerate()}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all ${
                loading || !canGenerate() ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {loading ? 'Processing...' : (type === 'DIAGRAM' ? 'Draw Diagram' : 'Create Notes')}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="md:col-span-8">
          <div className="glass-panel min-h-[600px] p-8 rounded-2xl shadow-lg relative flex flex-col">
            {notes ? (
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <div>
                     <h3 className="text-xl font-serif font-bold text-gray-800">{type === 'DIAGRAM' ? 'Visual Map' : `${type} Notes`}</h3>
                     <p className="text-xs text-gray-500 uppercase mt-1">
                       {sourceMode === 'LIBRARY' ? topic : pdfName} • <span className={`font-bold ${style === 'BEGINNER' ? 'text-green-600' : style === 'EXAM' ? 'text-indigo-600' : 'text-amber-600'}`}>{style} Mode</span>
                     </p>
                  </div>
                  <button className="text-sm px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100">
                    Download PDF
                  </button>
                </div>
                
                {type === 'DIAGRAM' ? (
                  <div className="w-full min-h-[500px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-6 overflow-hidden">
                    {notes && notes.includes('<svg') ? (
                        <div 
                          className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[600px] [&>svg]:drop-shadow-sm"
                          dangerouslySetInnerHTML={{ __html: notes }} 
                        />
                    ) : (
                        <div className="text-gray-500 italic">
                            {loading ? "Sketching concept..." : "Diagram could not be rendered."}
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-indigo max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-li:marker:text-indigo-500">
                    <ReactMarkdown>{notes}</ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center max-w-sm">
                  <span className="text-6xl block mb-6 opacity-20">
                    {type === 'DIAGRAM' ? '🎨' : '📄'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-500 mb-2">Ready to Synthesize</h3>
                  <p className="text-sm">
                      {sourceMode === 'LIBRARY' 
                        ? "Select a book and topic on the left to generate customized notes." 
                        : "Upload a PDF document to extract summary, revision points, or diagrams."}
                  </p>
                </div>
              </div>
            )}
            
            {loading && (
               <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                  <div className="text-center">
                    <div className="mb-6"><Loader /></div>
                    <p className="text-indigo-800 font-bold animate-pulse text-lg">
                      {type === 'DIAGRAM' ? 'Constructing visual map...' : 'Synthesizing knowledge...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        {sourceMode === 'UPLOAD' ? 'Analyzing document structure...' : 'Consulting the library database'}
                    </p>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
