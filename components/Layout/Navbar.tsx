
import React from 'react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate }) => {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer cursor-target" onClick={() => onNavigate('home')}>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-serif">
              CogniLib
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full cursor-target">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-gray-500 uppercase">| {user.role}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="cursor-target px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};
