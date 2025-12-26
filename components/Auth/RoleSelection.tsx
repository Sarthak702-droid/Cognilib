
import React from 'react';
import { UserRole } from '../../types';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  const roles = [
    {
      id: UserRole.STUDENT,
      title: 'Student',
      desc: 'Get study plans, AI notes, and exam prep tools.',
      icon: '🎓',
      color: 'bg-indigo-50/50 border-indigo-200 text-indigo-700 hover:border-indigo-400'
    },
    {
      id: UserRole.RESEARCHER,
      title: 'Researcher',
      desc: 'Compare papers, deep-dive analysis, no fluff.',
      icon: '🧑‍🔬',
      color: 'bg-emerald-50/50 border-emerald-200 text-emerald-700 hover:border-emerald-400'
    },
    {
      id: UserRole.PROFESSIONAL,
      title: 'Professional',
      desc: 'Quick summaries, ROI-focused reading, insights.',
      icon: '💼',
      color: 'bg-blue-50/50 border-blue-200 text-blue-700 hover:border-blue-400'
    },
    {
      id: UserRole.INSTITUTION,
      title: 'Library Admin',
      desc: 'Manage inventory, add books, track usage analytics.',
      icon: '🏛️',
      color: 'bg-amber-50/50 border-amber-200 text-amber-700 hover:border-amber-400'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-5xl font-bold text-gray-900 mb-4 font-serif cursor-target">Who are you?</h2>
          <p className="text-xl text-gray-600 cursor-target">CogniLib adapts its entire interface to your goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role, idx) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`cursor-target relative group p-8 rounded-3xl border-2 text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 ${role.color} bg-white/60 hover:bg-white backdrop-blur-md animate-fade-in`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-5xl p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">{role.icon}</div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 text-2xl">
                  →
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
              <p className="text-base opacity-80 font-medium leading-relaxed">{role.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
