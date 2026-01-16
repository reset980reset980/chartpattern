
import React from 'react';

interface HeaderProps {
  onOpenWiki: () => void;
  onOpenAuth: () => void;
  user: any;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenWiki, onOpenAuth, user, onLogout }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            차트패턴 프로 <span className="text-blue-500 font-mono text-xs ml-1 px-1.5 py-0.5 border border-blue-500/30 rounded uppercase">AI</span>
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">분석기</a>
          <button
            onClick={onOpenWiki}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            패턴 위키
          </button>
        </nav>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-7 h-7 rounded-full border border-slate-700" />
              ) : (
                <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-700">
                  {user.name?.charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">{user.name} 님</span>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-500 hover:text-rose-400 text-[10px] font-black uppercase tracking-tighter transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all border border-slate-700 active:scale-95"
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
