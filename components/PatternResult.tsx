
import React from 'react';
import { PatternAnalysis } from '../types';

interface PatternResultProps {
  data: PatternAnalysis;
  image: string;
}

const PatternResult: React.FC<PatternResultProps> = ({ data, image }) => {
  const isBullish = data.patternType === 'Bullish';
  const typeColor = isBullish ? 'text-emerald-400 bg-emerald-400/10' : data.patternType === 'Bearish' ? 'text-rose-400 bg-rose-400/10' : 'text-slate-400 bg-slate-400/10';
  const strokeColor = isBullish ? '#10b981' : data.patternType === 'Bearish' ? '#f43f5e' : '#64748b';

  // Create SVG path/polygon from points
  const renderOverlay = () => {
    if (!data.overlayPoints || data.overlayPoints.length === 0) return null;
    
    // Convert 0-1000 coordinates to percentage for SVG
    const pointsStr = data.overlayPoints
      .map(p => `${(p.x / 10).toFixed(2)},${(p.y / 10).toFixed(2)}`)
      .join(' ');

    return (
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
      >
        <polyline
          points={pointsStr}
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.5"
          strokeDasharray="1,0.5"
          className="animate-[dash_2s_linear_infinite]"
        />
        {data.overlayPoints.map((p, i) => (
          <g key={i}>
            <circle 
              cx={p.x / 10} 
              cy={p.y / 10} 
              r="0.8" 
              fill={strokeColor} 
              className="animate-pulse"
            />
            {p.label && (
              <text 
                x={p.x / 10} 
                y={(p.y / 10) - 2} 
                fill="white" 
                fontSize="2" 
                fontWeight="bold" 
                textAnchor="middle"
                className="select-none filter drop-shadow-md"
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Column: Image and Observations */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm z-10 relative">
            <h3 className="font-semibold text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              AI 차트 분석 오버레이
            </h3>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Real-time Vision</span>
          </div>
          <div className="relative">
            <img src={image} alt="Chart Analysis" className="w-full h-auto object-contain max-h-[600px] block" />
            {renderOverlay()}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">상세 시장 분석</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">추세 환경 (Trend Context)</p>
              <p className="text-slate-200 font-medium">{data.trendContext}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">패턴 관찰</p>
              <p className="text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-4">
                "{data.description}"
              </p>
            </div>
            {data.candlestickObservations && data.candlestickObservations.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">캔들스틱 주요 형성</p>
                <div className="flex flex-wrap gap-2">
                  {data.candlestickObservations.map((obs, i) => (
                    <span key={i} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                      {obs}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Pattern Details and Strategy */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 opacity-20 ${isBullish ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                {data.patternType === 'Bullish' ? '매수 관점' : data.patternType === 'Bearish' ? '매도 관점' : '중립 관점'}
              </span>
              <h2 className="text-3xl font-black text-white mt-1 uppercase tracking-tight leading-none">{data.patternName}</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs font-medium uppercase">신뢰도</p>
              <p className="text-2xl font-mono font-bold text-blue-400">{(data.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Harmonic Ratios Section */}
          {data.harmonicRatios && Object.values(data.harmonicRatios).some(v => v !== undefined) && (
            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-blue-500"></span>
                하모닉 피보나치 비율
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(data.harmonicRatios).map(([key, value]) => value && (
                  <div key={key} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{key.replace('_', ' / ')}</span>
                    <span className="text-lg font-bold text-blue-300 font-mono">{(value as number).toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategy Section */}
          <div className="space-y-4">
             <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <span className="w-1 h-3 bg-blue-500"></span>
                매매 실행 계획
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border-l-4 border-blue-500">
                  <span className="text-sm text-slate-400">진입가 (Entry)</span>
                  <span className="font-bold text-white font-mono">{data.tradingStrategy.entry}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border-l-4 border-rose-500">
                  <span className="text-sm text-slate-400">손절가 (Stop)</span>
                  <span className="font-bold text-rose-300 font-mono">{data.tradingStrategy.stopLoss}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border-l-4 border-emerald-500">
                  <span className="text-sm text-slate-400">목표가 1 (TP1)</span>
                  <span className="font-bold text-emerald-300 font-mono">{data.tradingStrategy.target1}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border-l-4 border-emerald-500">
                  <span className="text-sm text-slate-400">목표가 2 (TP2)</span>
                  <span className="font-bold text-emerald-300 font-mono">{data.tradingStrategy.target2}</span>
                </div>
              </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">주요 가격 레벨</h4>
            <div className="flex flex-wrap gap-2">
              {data.keyLevels.map((level, i) => (
                <div key={i} className="px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{level.label}</span>
                  <span className="text-xs font-bold text-white font-mono">{level.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2">
            저장하기
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
            공유하기
          </button>
        </div>
      </div>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -2;
          }
        }
      `}</style>
    </div>
  );
};

export default PatternResult;
