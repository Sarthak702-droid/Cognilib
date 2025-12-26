
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';

interface LoginSignupProps {
  onComplete: (user: User) => void;
  onCancel: () => void;
}

export const LoginSignup: React.FC<LoginSignupProps> = ({ onComplete, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.STUDENT,
    educationLevel: 'Class 12',
    targetExam: '',
    profession: 'Technology'
  });

  // Dynamic Exam Options based on Education Level
  const getExamOptions = (level: string) => {
    if (['Class 10', 'Class 11', 'Class 12'].includes(level)) {
      return ['JEE Mains', 'JEE Advanced', 'NEET UG', 'CLAT', 'Board Exams'];
    }
    if (['Undergraduate', 'Graduate'].includes(level)) {
      return ['UPSC CSE', 'GATE', 'CAT', 'SSC CGL', 'IBPS PO', 'GRE/GMAT'];
    }
    return ['General Knowledge'];
  };

  const professionalDomains = [
    'Technology & Engineering',
    'Business & Finance',
    'Healthcare & Medicine',
    'Legal & Compliance',
    'Arts & Creative',
    'Education & Academia',
    'Sales & Marketing',
    'Other'
  ];

  // Auto-select first exam when education level changes
  useEffect(() => {
    if (!isLogin && formData.role === UserRole.STUDENT) {
      const exams = getExamOptions(formData.educationLevel);
      setFormData(prev => ({ ...prev, targetExam: exams[0] }));
    }
  }, [formData.educationLevel, formData.role, isLogin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setSuccessMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      // Signup Logic: Redirect to Login
      setIsLogin(true);
      setSuccessMsg('Account created successfully! Please login.');
      setFormData(prev => ({ ...prev, password: '' }));
      return;
    }

    // Login Logic: Complete Authentication
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || (isLogin ? 'Returning User' : 'New User'),
      email: formData.email,
      role: formData.role,
      // Only attach education details if they are a student
      educationLevel: formData.role === UserRole.STUDENT ? formData.educationLevel as any : undefined,
      targetExam: formData.role === UserRole.STUDENT ? formData.targetExam : undefined,
      // Attach profession if they are a professional
      profession: formData.role === UserRole.PROFESSIONAL ? formData.profession : undefined,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
    };
    onComplete(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-[#121212] w-full max-w-sm rounded-3xl shadow-2xl border border-gray-800 p-8 relative overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-wide font-sans">{isLogin ? 'Login' : 'Sign Up'}</h2>
          <p className="text-gray-500 text-xs mt-1">Access your intelligent learning space</p>
        </div>

        {successMsg && isLogin && (
          <div className="mb-6 p-3 bg-green-900/30 border border-green-800 rounded-xl text-green-400 text-xs text-center font-bold animate-pulse">
             {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors">👤</span>
              <input 
                required
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-[#0a0a0a] border border-transparent focus:border-indigo-900 rounded-2xl py-3 pl-12 pr-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-inner transition-all"
                placeholder="Full Name"
              />
            </div>
          )}

          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors">@</span>
            <input 
              required
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-[#0a0a0a] border border-transparent focus:border-indigo-900 rounded-2xl py-3 pl-12 pr-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-inner transition-all"
              placeholder="Email"
            />
          </div>

          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors">🔒</span>
            <input 
              required
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-[#0a0a0a] border border-transparent focus:border-indigo-900 rounded-2xl py-3 pl-12 pr-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-inner transition-all"
              placeholder="Password"
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative group">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
               {formData.role === UserRole.STUDENT ? '🎓' : 
                formData.role === UserRole.RESEARCHER ? '🔬' : 
                formData.role === UserRole.PROFESSIONAL ? '💼' : '🏛️'}
             </div>
             <select 
               name="role"
               value={formData.role}
               onChange={handleInputChange}
               className="w-full bg-[#0a0a0a] border border-transparent focus:border-indigo-900 rounded-2xl py-3 pl-12 pr-4 text-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-inner cursor-pointer"
             >
               <option value={UserRole.STUDENT}>Student</option>
               <option value={UserRole.RESEARCHER}>Researcher</option>
               <option value={UserRole.PROFESSIONAL}>Professional</option>
               <option value={UserRole.INSTITUTION}>Library Admin</option>
             </select>
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-xs">▼</span>
          </div>

          {/* Student Specific Fields (Only on Signup) */}
          {!isLogin && formData.role === UserRole.STUDENT && (
            <div className="space-y-4 animate-fade-in bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2">Academic Profile</p>
              
              <div>
                 <label className="block text-[10px] text-gray-500 mb-1">Current Education</label>
                 <select 
                   name="educationLevel"
                   value={formData.educationLevel}
                   onChange={handleInputChange}
                   className="w-full bg-[#0a0a0a] text-gray-300 text-sm rounded-lg p-2 border border-gray-700 focus:border-indigo-500 focus:outline-none"
                 >
                   <option value="Class 10">Class 10</option>
                   <option value="Class 11">Class 11</option>
                   <option value="Class 12">Class 12</option>
                   <option value="Undergraduate">Undergraduate (Engineering/Other)</option>
                   <option value="Graduate">Graduate</option>
                 </select>
              </div>

              <div>
                 <label className="block text-[10px] text-gray-500 mb-1">Target Exam / Goal</label>
                 <select 
                   name="targetExam"
                   value={formData.targetExam}
                   onChange={handleInputChange}
                   className="w-full bg-[#0a0a0a] text-gray-300 text-sm rounded-lg p-2 border border-gray-700 focus:border-indigo-500 focus:outline-none"
                 >
                    {getExamOptions(formData.educationLevel).map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                 </select>
              </div>
            </div>
          )}

          {/* Professional Specific Fields (Only on Signup) */}
          {!isLogin && formData.role === UserRole.PROFESSIONAL && (
            <div className="space-y-4 animate-fade-in bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800">
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Professional Profile</p>
              <div>
                 <label className="block text-[10px] text-gray-500 mb-1">Industry / Domain</label>
                 <select 
                   name="profession"
                   value={formData.profession}
                   onChange={handleInputChange}
                   className="w-full bg-[#0a0a0a] text-gray-300 text-sm rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                 >
                   {professionalDomains.map(domain => (
                     <option key={domain} value={domain}>{domain}</option>
                   ))}
                 </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" // Important: type button to prevent form submit
              onClick={() => isLogin ? handleSubmit({preventDefault:()=>{}} as any) : handleSwitchMode(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
                isLogin 
                ? 'bg-[#252525] text-white shadow-lg hover:bg-[#333] border border-gray-600' 
                : 'bg-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Login
            </button>
            <button 
              type="button" // Important: type button to prevent form submit
              onClick={() => !isLogin ? handleSubmit({preventDefault:()=>{}} as any) : handleSwitchMode(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
                !isLogin 
                ? 'bg-[#252525] text-white shadow-lg hover:bg-[#333] border border-gray-600' 
                : 'bg-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <button 
            type="button" 
            className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors mt-4"
          >
            Forgot Password?
          </button>
        </form>
      </div>
    </div>
  );
};
