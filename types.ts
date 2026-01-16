
export interface Point {
  x: number; // 0-1000 normalized coordinates
  y: number; // 0-1000 normalized coordinates
  label?: string;
}

export interface HarmonicRatios {
  xa_ab?: number;
  ab_bc?: number;
  bc_cd?: number;
  xa_ad?: number;
}

export interface PatternAnalysis {
  patternName: string;
  patternType: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  description: string;
  trendContext: string;
  candlestickObservations?: string[];
  harmonicRatios?: HarmonicRatios;
  overlayPoints?: Point[]; // Coordinates to draw the pattern on the image
  tradingStrategy: {
    entry: string;
    stopLoss: string;
    target1: string;
    target2: string;
  };
  keyLevels: {
    label: string;
    price: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
