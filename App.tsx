import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import GamePage from './pages/GamePage';
import TeacherDashboard from './pages/TeacherDashboard';
import LevelEditor from './pages/LevelEditor';

const NavBar = () => {
  const location = useLocation();
  const getLinkClass = (path: string) => `
    px-4 py-2 rounded-full font-medium transition-colors duration-200
    ${location.pathname === path 
      ? 'bg-forest text-white shadow-md' 
      : 'text-gray-600 hover:text-forest hover:bg-green-50'}
  `;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 h-16 px-8 flex items-center justify-between z-50 relative">
      <div className="flex items-center space-x-3">
        <div className="bg-forest text-white p-2 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
           </svg>
        </div>
        <h1 className="font-display font-bold text-2xl text-forest tracking-tight">PAL <span className="text-amber font-light text-lg">| Python Lab</span></h1>
      </div>
      
      <div className="flex space-x-2">
        <Link to="/" className={getLinkClass('/')}>Học tập</Link>
        <Link to="/teacher" className={getLinkClass('/teacher')}>Giáo viên</Link>
        <Link to="/editor" className={getLinkClass('/editor')}>Soạn bài</Link>
      </div>

      <div className="flex items-center space-x-3">
         <div className="text-right hidden sm:block">
             <div className="text-sm font-bold text-charcoal">Học sinh A</div>
             <div className="text-xs text-gray-500">Lớp 11A2</div>
         </div>
         <div className="h-10 w-10 rounded-full bg-amber text-white flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
             A
         </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
       <div className="min-h-screen bg-gray-50 flex flex-col font-body">
          <NavBar />
          <main className="flex-1 overflow-hidden">
            <Routes>
               <Route path="/" element={<GamePage />} />
               <Route path="/teacher" element={<TeacherDashboard />} />
               <Route path="/editor" element={<LevelEditor />} />
            </Routes>
          </main>
       </div>
    </Router>
  );
};

export default App;