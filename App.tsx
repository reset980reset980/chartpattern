
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PatternResult from './components/PatternResult';
import AnalysisChat from './components/AnalysisChat';
import PatternWiki from './components/PatternWiki';
import AuthModal from './components/AuthModal';
import { analyzeChartImage } from './services/geminiService';
import { PatternAnalysis, AnalysisStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PatternAnalysis | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check login on mount and handle OAuth callback
  React.useEffect(() => {
    const checkUser = async () => {
      // Handle token in URL from OAuth callback
      const params = new URLSearchParams(window.location.search);
      const tokenInUrl = params.get('token');
      if (tokenInUrl) {
        // Optionally store token if using JWT, but current backend uses cookies.
        // Let's assume the backend set the cookie and redirected.
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleAnalysis = useCallback(async (base64: string) => {
    setCurrentImage(base64);
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeChartImage(base64);
      setAnalysisResult(result);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 중 예상치 못한 오류가 발생했습니다.');
      setStatus(AnalysisStatus.ERROR);
    }
  }, []);

  const reset = () => {
    setStatus(AnalysisStatus.IDLE);
    setAnalysisResult(null);
    setCurrentImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header
        onOpenWiki={() => setIsWikiOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
            전문 트레이더를 위한 <span className="text-blue-500">AI 차트 패턴 분석</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            클래식 패턴, 캔들스틱 신호 감지 및 하모닉 비율 계산을 단 몇 초 만에 처리합니다.
          </p>
        </div>

        <div className="space-y-8">
          {(status === AnalysisStatus.IDLE || status === AnalysisStatus.ERROR) && (
            <div className="max-w-xl mx-auto">
              <ImageUploader
                onImageSelected={handleAnalysis}
                isLoading={status === AnalysisStatus.ANALYZING}
                isLoggedIn={!!user}
                onOpenAuth={() => setIsAuthOpen(true)}
              />

              {status === AnalysisStatus.ERROR && (
                <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                  <div className="text-blue-400 font-bold mb-1 group-hover:scale-110 transition-transform">통합 분석</div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold">모든 패턴</div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                  <div className="text-emerald-400 font-bold mb-1 group-hover:scale-110 transition-transform">하모닉</div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold">비율 자동 계산</div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                  <div className="text-purple-400 font-bold mb-1 group-hover:scale-110 transition-transform">캔들스틱</div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold">신호 감지</div>
                </div>
              </div>
            </div>
          )}

          {status === AnalysisStatus.ANALYZING && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">고급 차트 분석 진행 중...</h3>
                <p className="text-slate-500 text-sm mt-2 font-mono uppercase tracking-widest">구조적 패턴 및 피보나치 관계 스캐닝</p>
              </div>
            </div>
          )}

          {status === AnalysisStatus.SUCCESS && analysisResult && currentImage && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={reset}
                  className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  새 차트 분석하기
                </button>
              </div>

              <PatternResult data={analysisResult} image={currentImage} />

              <div className="max-w-4xl mx-auto w-full pt-12">
                <AnalysisChat image={currentImage} analysis={analysisResult} />
              </div>
            </div>
          )}
        </div>
      </main>

      <PatternWiki isOpen={isWikiOpen} onClose={() => setIsWikiOpen(false)} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      <footer className="border-t border-slate-800 py-8 bg-slate-900/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">Gemini 3 Vision 엔진 기반. 교육 및 참고용으로만 사용하십시오.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
