
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';

interface OnboardingSetupProps {
  auth0User: any;
  onComplete: (user: User) => void;
}

export const OnboardingSetup: React.FC<OnboardingSetupProps> = ({ auth0User, onComplete }) => {
  const [formData, setFormData] = useState({
    role: UserRole.STUDENT,
    educationLevel: 'Class 12',
    targetExam: '',
    profession: 'Technology & Engineering'
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
    if (formData.role === UserRole.STUDENT) {
      const exams = getExamOptions(formData.educationLevel);
      setFormData(prev => ({ ...prev, targetExam: exams[0] }));
    }
  }, [formData.educationLevel, formData.role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the full user object merging Auth0 data with Form data
    const newUser: User = {
      id: auth0User.sub,
      name: auth0User.name || auth0User.nickname || 'User',
      email: auth0User.email,
      avatarUrl: auth0User.picture,
      role: formData.role,
      // Only attach education details if they are a student
      educationLevel: formData.role === UserRole.STUDENT ? formData.educationLevel as any : undefined,
      targetExam: formData.role === UserRole.STUDENT ? formData.targetExam : undefined,
      // Attach profession if they are a professional
      profession: formData.role === UserRole.PROFESSIONAL ? formData.profession : undefined,
    };
    onComplete(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-[#121212] w-full max-w-md rounded-3xl shadow-2xl border border-gray-800 p-8 relative overflow-hidden">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-wide font-sans mb-2">Setup Profile</h2>
          <p className="text-gray-400 text-sm">Hi <span className="text-indigo-400 font-bold">{auth0User.name}</span>, let's personalize your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Role Dropdown */}
          <div className="relative group">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">I am a...</label>
             <div className="relative">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-lg">
                 {formData.role === UserRole.STUDENT ? '🎓' : 
                  formData.role === UserRole.RESEARCHER ? '🔬' : 
                  formData.role === UserRole.PROFESSIONAL ? '💼' : '🏛️'}
               </div>
               <select 
                 name="role"
                 value={formData.role}
                 onChange={handleInputChange}
                 className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-indigo-500 rounded-xl py-4 pl-12 pr-4 text-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all cursor-pointer"
               >
                 <option value={UserRole.STUDENT}>Student</option>
                 <option value={UserRole.RESEARCHER}>Researcher</option>
                 <option value={UserRole.PROFESSIONAL}>Professional</option>
                 <option value={UserRole.INSTITUTION}>Library Admin</option>
               </select>
               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none text-xs">▼</span>
             </div>
          </div>

          {/* Student Specific Fields */}
          {formData.role === UserRole.STUDENT && (
            <div className="space-y-4 animate-fade-in bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                 <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                 <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Education Details</p>
              </div>
              
              <div>
                 <label className="block text-[10px] text-gray-500 mb-1">Current Education</label>
                 <select 
                   name="educationLevel"
                   value={formData.educationLevel}
                   onChange={handleInputChange}
                   className="w-full bg-[#0a0a0a] text-gray-300 text-sm rounded-lg p-3 border border-gray-700 focus:border-indigo-500 focus:outline-none"
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
                   className="w-full bg-[#0a0a0a] text-gray-300 text-sm rounded-lg p-3 border border-gray-700 focus:border-indigo-500 focus:outline-none"
                 >
                    {getExamOptions(formData.educationLevel).map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                 </select>
              </div>
            </div>
          )}

          {/* Professional Specific Fields */}
          {formData.role === UserRole.PROFESSIONAL && (
            <div className="space-y-4 animate-fade-in bg-[#1a1a1a] p-5 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                 <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Professional Profile</p>
              </div>
              
              <div>
                 <label className="block text-[10px] text-gray-500 mb-1">Industry / Domain</label>
                 <select 
                   name="profession"
                   value={formData.profession}
                   onChange={handleInputChange}
                   className="w-full bg-[#0a0a0a] text-gray-300 text-sm rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                 >
                   {professionalDomains.map(domain => (
                     <option key={domain} value={domain}>{domain}</option>
                   ))}
                 </select>
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-300"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
};
