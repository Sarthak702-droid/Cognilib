
import React, { useState, useEffect } from 'react';
import { User, LibraryBook } from '../../types';
import { MOCK_LIBRARY_INVENTORY } from '../../constants';
import { generateBookMetadata } from '../../services/geminiService';
import Loader from '../UI/Loader';

interface LibraryAdminDashboardProps {
  user: User;
}

export const LibraryAdminDashboard: React.FC<LibraryAdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVENTORY' | 'ADD_BOOK'>('DASHBOARD');
  const [inventory, setInventory] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(false);

  // Add Book Form State
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCategory, setBookCategory] = useState('Engineering');
  const [bookType, setBookType] = useState<'PHYSICAL' | 'EBOOK' | 'AUDIO'>('PHYSICAL');
  const [bookQuantity, setBookQuantity] = useState(1); // Represents TOTAL quantity (copies or licenses)
  const [shelfLocation, setShelfLocation] = useState('');
  const [fileUrl, setFileUrl] = useState(''); // Mock
  const [aiLoading, setAiLoading] = useState(false);
  
  // Extended Metadata State
  const [bookDescription, setBookDescription] = useState('');
  const [bookPages, setBookPages] = useState('');
  const [bookReadTime, setBookReadTime] = useState('');

  useEffect(() => {
    // Transform mock inventory to LibraryBook type for state
    const initialInv: LibraryBook[] = MOCK_LIBRARY_INVENTORY.map((item: any, idx) => ({
      ...item,
      type: 'PHYSICAL', // Default mock data is physical
      addedDate: Date.now() - (idx * 86400000)
    }));
    setInventory(initialInv);
  }, []);

  const handleAiAutoFill = async () => {
    if (!bookTitle) return;
    setAiLoading(true);
    const meta = await generateBookMetadata(bookTitle);
    if (meta) {
      if (meta.author) setBookAuthor(meta.author);
      if (meta.category) setBookCategory(meta.category);
      if (meta.description) setBookDescription(meta.description);
      if (meta.pages) setBookPages(meta.pages.toString());
      if (meta.readTime) setBookReadTime(meta.readTime);
    }
    setAiLoading(false);
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || !bookAuthor) return;

    const newBook: LibraryBook = {
      id: Math.random().toString(36).substr(2, 9),
      title: bookTitle,
      author: bookAuthor,
      category: bookCategory,
      type: bookType,
      available: bookQuantity, // Initially, all added copies are available
      totalQuantity: bookQuantity,
      rating: 0,
      reviews: 0,
      addedDate: Date.now(),
      shelfLocation: bookType === 'PHYSICAL' ? shelfLocation : undefined,
      fileSize: bookType !== 'PHYSICAL' ? '15 MB' : undefined,
      description: bookDescription,
      pages: parseInt(bookPages) || 0,
      readTime: bookReadTime
    };

    setInventory([newBook, ...inventory]);
    alert("Book added successfully to Library Inventory!");
    
    // Reset Form
    setBookTitle('');
    setBookAuthor('');
    setBookQuantity(1);
    setBookDescription('');
    setBookPages('');
    setBookReadTime('');
    setActiveTab('INVENTORY');
  };

  const getStats = () => {
    const totalAssets = inventory.length;
    const totalCopies = inventory.reduce((acc, curr) => acc + curr.totalQuantity, 0);
    const totalAvailable = inventory.reduce((acc, curr) => acc + curr.available, 0);
    const activeLoans = totalCopies - totalAvailable;
    
    const digitalCount = inventory.filter(b => b.type !== 'PHYSICAL').length;
    const physicalCount = totalAssets - digitalCount;
    
    return { totalAssets, totalCopies, totalAvailable, activeLoans, digitalCount, physicalCount };
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pt-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 font-serif">Library Command Center</h2>
            <p className="text-slate-500">Manage assets, track inventory, and digitize collections.</p>
        </div>
        
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex gap-1">
            <button 
                onClick={() => setActiveTab('DASHBOARD')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'DASHBOARD' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('INVENTORY')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'INVENTORY' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Inventory List
            </button>
            <button 
                onClick={() => setActiveTab('ADD_BOOK')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ADD_BOOK' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <span>+ Add Book</span>
            </button>
        </div>
      </div>

      {activeTab === 'DASHBOARD' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Assets</p>
              <p className="text-4xl font-bold text-slate-800">{stats.totalAssets}</p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase">Active Loans</p>
              <p className="text-4xl font-bold text-indigo-600">{stats.activeLoans}</p>
              <p className="text-xs text-slate-500 mt-1">
                 {Math.round((stats.activeLoans / stats.totalCopies) * 100) || 0}% Utilization
              </p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Holdings</p>
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-4xl font-bold text-emerald-600">{stats.totalCopies}</p>
                    <p className="text-xs text-slate-500">Copies & Licenses</p>
                 </div>
              </div>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase">Format Split</p>
              <div className="flex gap-4 mt-2">
                 <div>
                    <p className="text-xl font-bold text-amber-700">{stats.physicalCount}</p>
                    <p className="text-xs text-slate-500">Physical</p>
                 </div>
                 <div className="w-px h-8 bg-slate-200"></div>
                 <div>
                    <p className="text-xl font-bold text-blue-600">{stats.digitalCount}</p>
                    <p className="text-[10px] text-slate-500">Digital</p>
                 </div>
              </div>
           </div>

           <div className="md:col-span-4 bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-100">
              <h3 className="text-xl font-bold text-amber-900 mb-2">Smart Insights</h3>
              <p className="text-amber-800 mb-4 text-sm">AI Analysis of your inventory suggests high demand for <strong>Data Science</strong> materials next semester.</p>
              <div className="flex gap-2">
                 <button onClick={() => setActiveTab('ADD_BOOK')} className="bg-white text-amber-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md">Add New Assets</button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'INVENTORY' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Current Holdings</h3>
              <input type="text" placeholder="Search title or author..." className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                    <tr>
                       <th className="px-6 py-4">Title / Author</th>
                       <th className="px-6 py-4">Category</th>
                       <th className="px-6 py-4">Type</th>
                       <th className="px-6 py-4">Availability</th>
                       <th className="px-6 py-4">Location</th>
                       <th className="px-6 py-4">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {inventory.map((book) => {
                       const utilization = Math.round(((book.totalQuantity - book.available) / book.totalQuantity) * 100) || 0;
                       return (
                       <tr key={book.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                             <div className="font-bold text-slate-900">{book.title}</div>
                             <div className="text-xs text-slate-500">{book.author}</div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">{book.category}</span>
                          </td>
                          <td className="px-6 py-4">
                             {book.type === 'PHYSICAL' ? (
                                <span className="flex items-center gap-1 text-amber-700 font-bold text-xs"><span className="text-lg">📖</span> Physical</span>
                             ) : (
                                <span className="flex items-center gap-1 text-blue-600 font-bold text-xs"><span className="text-lg">📱</span> Digital</span>
                             )}
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${book.available > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="font-bold text-slate-700">{book.available} / {book.totalQuantity}</span>
                             </div>
                             <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                   className={`h-full ${utilization > 80 ? 'bg-red-400' : 'bg-green-400'}`} 
                                   style={{ width: `${utilization}%` }}
                                ></div>
                             </div>
                             <div className="text-[10px] text-slate-400 mt-1">{utilization}% Utilized</div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                             {book.shelfLocation || 'Cloud'}
                          </td>
                          <td className="px-6 py-4">
                             <button className="text-indigo-600 hover:text-indigo-800 font-medium">Edit</button>
                          </td>
                       </tr>
                    )})}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'ADD_BOOK' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
           {/* FORM */}
           <div className="lg:col-span-2">
              <form onSubmit={handleAddBook} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                 <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Add New Asset
                 </h3>

                 <div className="space-y-6">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Book Title</label>
                       <div className="flex gap-2">
                          <input 
                             type="text" 
                             value={bookTitle}
                             onChange={(e) => setBookTitle(e.target.value)}
                             placeholder="e.g. Introduction to Algorithms"
                             className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                             required
                          />
                          <button 
                             type="button" 
                             onClick={handleAiAutoFill}
                             disabled={aiLoading || !bookTitle}
                             className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                             {aiLoading ? <Loader /> : '✨ AI Auto-Fill'}
                          </button>
                       </div>
                       <p className="text-[10px] text-slate-400 mt-1">Type the title and let AI find the author, category, and metadata.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Author</label>
                          <input 
                             type="text" 
                             value={bookAuthor}
                             onChange={(e) => setBookAuthor(e.target.value)}
                             placeholder="e.g. Thomas H. Cormen"
                             className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                             required
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                          <select 
                             value={bookCategory}
                             onChange={(e) => setBookCategory(e.target.value)}
                             className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                          >
                             <option>Engineering</option>
                             <option>Medical</option>
                             <option>Arts</option>
                             <option>History</option>
                             <option>Science</option>
                             <option>Business</option>
                          </select>
                       </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Book Description</label>
                        <textarea 
                            value={bookDescription}
                            onChange={(e) => setBookDescription(e.target.value)}
                            placeholder="Brief summary of the book..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 h-24 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pages</label>
                            <input 
                                type="number" 
                                value={bookPages}
                                onChange={(e) => setBookPages(e.target.value)}
                                placeholder="e.g. 450"
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estimated Read Time</label>
                            <input 
                                type="text" 
                                value={bookReadTime}
                                onChange={(e) => setBookReadTime(e.target.value)}
                                placeholder="e.g. 12h 30m"
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase">Format & Logistics</h4>
                        
                        <div className="mb-4">
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Asset Type</label>
                           <div className="flex gap-2">
                              {['PHYSICAL', 'EBOOK', 'AUDIO'].map(type => (
                                 <button
                                    type="button"
                                    key={type}
                                    onClick={() => setBookType(type as any)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                       bookType === type 
                                       ? 'bg-amber-600 text-white border-amber-600 shadow-md' 
                                       : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                    }`}
                                 >
                                    {type}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                 {bookType === 'PHYSICAL' ? 'Total Copies Owned' : 'Total Licenses Purchased'}
                              </label>
                              <input 
                                 type="number" 
                                 min="1"
                                 value={bookQuantity}
                                 onChange={(e) => setBookQuantity(parseInt(e.target.value))}
                                 className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                           </div>
                           
                           {bookType === 'PHYSICAL' ? (
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Shelf Location</label>
                                 <input 
                                    type="text" 
                                    value={shelfLocation}
                                    onChange={(e) => setShelfLocation(e.target.value)}
                                    placeholder="e.g. A1-45-B"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                 />
                              </div>
                           ) : (
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">File Upload (Mock)</label>
                                 <div className="flex items-center gap-2">
                                    <button type="button" className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50">Choose File</button>
                                    <span className="text-xs text-slate-400">No file chosen</span>
                                 </div>
                              </div>
                           )}
                        </div>
                    </div>

                    <button 
                       type="submit"
                       className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all"
                    >
                       Add Book to Inventory
                    </button>
                 </div>
              </form>
           </div>

           {/* PREVIEW CARD */}
           <div className="lg:col-span-1">
              <h3 className="font-bold text-slate-400 mb-4 text-sm uppercase tracking-wider">Student View Preview</h3>
              <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-amber-500 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-8 -mt-8"></div>
                 
                 <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-32 h-44 bg-slate-200 rounded-lg shadow-inner mb-4 flex items-center justify-center text-slate-400">
                       {bookTitle ? 'Cover' : 'No Cover'}
                    </div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 leading-tight mb-1">
                       {bookTitle || 'Book Title'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">{bookAuthor || 'Author Name'}</p>
                    
                    {bookPages && (
                        <p className="text-xs text-slate-400 mb-4">{bookPages} Pages • {bookReadTime || 'N/A'}</p>
                    )}

                    <div className="flex gap-2 mb-4">
                       <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{bookCategory}</span>
                       <span className={`px-2 py-1 rounded text-xs font-bold ${bookType === 'PHYSICAL' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {bookType}
                       </span>
                    </div>

                    {bookDescription && (
                        <p className="text-xs text-slate-500 italic mb-4 line-clamp-3">{bookDescription}</p>
                    )}

                    <button disabled className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-sm opacity-50 cursor-not-allowed">
                       {bookType === 'PHYSICAL' ? 'Reserve' : 'Download'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
