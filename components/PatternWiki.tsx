
import React from 'react';

interface WikiCategory {
  title: string;
  patterns: {
    name: string;
    desc: string;
    type: 'Bullish' | 'Bearish' | 'Neutral';
    imageUrl: string;
  }[];
}

const WIKI_DATA: WikiCategory[] = [
  {
    title: '클래식 패턴 (Classic Patterns)',
    patterns: [
      { 
        name: '헤드앤숄더 (Head & Shoulders)', 
        desc: '세 개의 고점 중 중간이 가장 높은 형태. 하락 반전 신호입니다.', 
        type: 'Bearish',
        imageUrl: 'https://images.unsplash.com/photo-1611974717535-7c857a488437?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '이중 바닥 (Double Bottom)', 
        desc: '알파벳 W 형태. 강력한 상승 반전 신호입니다.', 
        type: 'Bullish',
        imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3ad29a?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '상승 삼각형 (Ascending Triangle)', 
        desc: '수평 저항선과 상승 추세선이 만나는 형태. 돌파 시 상승 가능성이 큽니다.', 
        type: 'Bullish',
        imageUrl: 'https://images.unsplash.com/photo-1611974717535-7c857a488437?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '컵앤핸들 (Cup and Handle)', 
        desc: '둥근 바닥 이후 짧은 조정. 지속적인 상승 추세를 나타냅니다.', 
        type: 'Bullish',
        imageUrl: 'https://images.unsplash.com/photo-1611974717535-7c857a488437?auto=format&fit=crop&q=80&w=400&h=250'
      },
    ]
  },
  {
    title: '하모닉 패턴 (Harmonic Patterns)',
    patterns: [
      { 
        name: '가틀리 (Gartley)', 
        desc: '0.618, 0.786 비율을 기반으로 하는 대표적인 하모닉 패턴입니다.', 
        type: 'Neutral',
        imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '뱃 (Bat)', 
        desc: '0.886 D 지점 회귀를 특징으로 하는 고정밀 패턴입니다.', 
        type: 'Neutral',
        imageUrl: 'https://images.unsplash.com/photo-1611974717535-7c857a488437?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '버터플라이 (Butterfly)', 
        desc: '추세의 끝에서 나타나는 확장형 반전 패턴입니다.', 
        type: 'Neutral',
        imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '사이퍼 (Cypher)', 
        desc: '독특한 피보나치 비율을 가진 반전 패턴입니다.', 
        type: 'Neutral',
        imageUrl: 'https://images.unsplash.com/photo-1611974717535-7c857a488437?auto=format&fit=crop&q=80&w=400&h=250'
      },
    ]
  },
  {
    title: '캔들스틱 패턴 (Candlestick Patterns)',
    patterns: [
      { 
        name: '강세 장악형 (Bullish Engulfing)', 
        desc: '이전 음봉을 완전히 감싸는 양봉. 매수세 유입을 뜻합니다.', 
        type: 'Bullish',
        imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '유성생 (Shooting Star)', 
        desc: '긴 윗꼬리를 가진 작은 몸통. 고점에서 하락 반전을 경고합니다.', 
        type: 'Bearish',
        imageUrl: 'https://images.unsplash.com/photo-1611974717535-7c857a488437?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '도지 (Doji)', 
        desc: '시가와 종가가 거의 같은 형태. 시장의 불확실성과 반전 가능성을 시사합니다.', 
        type: 'Neutral',
        imageUrl: 'https://images.unsplash.com/photo-1611974717535-7c857a488437?auto=format&fit=crop&q=80&w=400&h=250'
      },
      { 
        name: '망치형 (Hammer)', 
        desc: '긴 아래꼬리를 가진 캔들. 바닥권에서 상승 반전 신호로 쓰입니다.', 
        type: 'Bullish',
        imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3ad29a?auto=format&fit=crop&q=80&w=400&h=250'
      },
    ]
  }
];

interface PatternWikiProps {
  isOpen: boolean;
  onClose: () => void;
}

const PatternWiki: React.FC<PatternWikiProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">차트 패턴 위키</h2>
              <p className="text-xs text-slate-500 font-medium">AI가 감지할 수 있는 주요 기술적 패턴 가이드</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-12 custom-scrollbar">
          {WIKI_DATA.map((cat, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-4">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></span>
                {cat.title}
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.patterns.map((p, pIdx) => (
                  <div key={pIdx} className="group bg-slate-800/20 border border-slate-800 hover:border-slate-600 rounded-2xl transition-all overflow-hidden flex flex-col hover:translate-y-[-4px] duration-300">
                    <div className="relative aspect-video overflow-hidden bg-slate-900">
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute top-3 right-3">
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg backdrop-blur-md ${
                          p.type === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          p.type === 'Bearish' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                          {p.type === 'Bullish' ? '강세' : p.type === 'Bearish' ? '약세' : '중립'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-white mb-2 text-base">{p.name}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                        {p.desc}
                      </p>
                      <div className="mt-auto pt-4 flex justify-end">
                         <button className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                           자세히 보기
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                           </svg>
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 italic">모든 패턴은 시장 상황에 따라 확률이 달라질 수 있습니다. 위 이미지는 예시 이미지이며, 본 정보는 참고용입니다.</p>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default PatternWiki;
