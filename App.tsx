
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { LandingPage } from './components/LandingPage';
import { LoginSignup } from './components/Auth/LoginSignup';
import { StudentDashboard } from './components/Student/StudentDashboard';
import { LibraryAssistant } from './components/Library/LibraryAssistant';
import { ResearcherDashboard } from './components/Researcher/ResearcherDashboard';
import { ProfessionalDashboard } from './components/Professional/ProfessionalDashboard';
import { LibraryAdminDashboard } from './components/Library/LibraryAdminDashboard';
import { Navbar } from './components/Layout/Navbar';
import { AnimatedBackground } from './components/Layout/AnimatedBackground';
import TargetCursor from './components/TargetCursor';

function App() {
  const [appUser, setAppUser] = useState<User | null>(null);
  const [view, setView] = useState('home'); // home, dashboard, library-demo
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check for persisted user
  useEffect(() => {
    const savedUser = localStorage.getItem('cognilib_user');
    if (savedUser) {
      setAppUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthComplete = (newUser: User) => {
    setAppUser(newUser);
    localStorage.setItem('cognilib_user', JSON.stringify(newUser));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setAppUser(null);
    localStorage.removeItem('cognilib_user');
    setView('home');
  };

  const renderContent = () => {
    // Public Access to Library Demo
    if (view === 'library-demo') {
      return (
        <div className="pt-6">
          <button 
             onClick={() => setView('home')} 
             className="mb-4 text-gray-500 hover:text-indigo-600 cursor-target"
          >
            ← Back to Home
          </button>
          <LibraryAssistant user={appUser} />
        </div>
      );
    }

    if (!appUser) {
      return (
        <>
          <LandingPage 
            onGetStarted={() => setShowAuthModal(true)} 
            onGoToLibrary={() => setView('library-demo')} 
          />
          {showAuthModal && (
            <LoginSignup 
              onComplete={handleAuthComplete} 
              onCancel={() => setShowAuthModal(false)} 
            />
          )}
        </>
      );
    }

    // Role Based Routing
    switch (appUser.role) {
      case UserRole.STUDENT:
        return <StudentDashboard user={appUser} />;
      case UserRole.RESEARCHER:
        return <ResearcherDashboard user={appUser} />;
      case UserRole.PROFESSIONAL:
        return <ProfessionalDashboard user={appUser} />;
      case UserRole.INSTITUTION:
        return <LibraryAdminDashboard user={appUser} />;
      default:
        return <div>Unknown Role</div>;
    }
  };

  return (
    <div className="min-h-screen relative text-gray-900 cursor-none">
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar 
          user={appUser} 
          onLogout={handleLogout} 
          onNavigate={(v) => setView(v)} 
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
