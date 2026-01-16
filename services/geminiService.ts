
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PatternAnalysis, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-3-flash-preview';

export const analyzeChartImage = async (base64Image: string): Promise<PatternAnalysis> => {
  const systemInstruction = `
    당신은 세계적인 수준의 금융 기술적 분석가입니다. 제공된 차트 이미지(주식, 코인, 선물, 외환)를 분석하는 것이 임무입니다.
    모든 중요한 기술적 패턴을 식별하십시오:
    1. 클래식 차트 패턴: 헤드앤숄더, 이중 천장/바닥, 삼각형(대칭, 상승, 하락), 깃발형, 페넌트, 쐐기형, 컵앤핸들 등.
    2. 하모닉 패턴: 가틀리, 뱃, 버터플라이, 크랩, 사이퍼, 샤크 등. (하모닉의 경우 반드시 피보나치 비율을 계산/추정하십시오).
    3. 캔들 패턴: 장악형, 망치형, 유성생, 샛별/석별형, 도지 클러스터 등.
    4. 시장 구조: 현재 추세(상승/하락/횡보), 지지/저항 영역, 돌파/이탈 가능성.

    응답 요구사항:
    - 모든 텍스트 설명은 한국어로 작성하십시오.
    - 하모닉 패턴의 경우 AB/XA, BC/AB 등의 비율을 계산하십시오.
    - 'overlayPoints' 필드에 패턴의 주요 지점 좌표(x, y)를 0에서 1000 사이의 정규화된 수치로 제공하십시오. (이미지 위에 선을 그릴 수 있도록).
    - 정확한 트레이딩 전략(진입가, 손절가, 목표가)을 제안하십시오.

    결과를 엄격하게 JSON 형식으로 반환하십시오.
  `;

  const prompt = "이 차트를 완전히 분석하십시오. 하모닉, 클래식, 캔들 패턴을 감지하고 좌표(overlayPoints)를 포함하십시오. 모든 설명은 한국어로 하십시오.";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patternName: { type: Type.STRING },
          patternType: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          trendContext: { type: Type.STRING },
          candlestickObservations: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          overlayPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                label: { type: Type.STRING }
              }
            }
          },
          harmonicRatios: {
            type: Type.OBJECT,
            properties: {
              xa_ab: { type: Type.NUMBER },
              ab_bc: { type: Type.NUMBER },
              bc_cd: { type: Type.NUMBER },
              xa_ad: { type: Type.NUMBER }
            }
          },
          tradingStrategy: {
            type: Type.OBJECT,
            properties: {
              entry: { type: Type.STRING },
              stopLoss: { type: Type.STRING },
              target1: { type: Type.STRING },
              target2: { type: Type.STRING }
            },
            required: ['entry', 'stopLoss', 'target1', 'target2']
          },
          keyLevels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                price: { type: Type.STRING }
              }
            }
          }
        },
        required: ['patternName', 'patternType', 'confidence', 'description', 'trendContext', 'tradingStrategy', 'keyLevels']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI로부터 분석 결과를 받지 못했습니다.");
  
  try {
    return JSON.parse(text) as PatternAnalysis;
  } catch (err) {
    console.error("AI 응답 파싱 실패:", text);
    throw new Error("분석 엔진으로부터 유효하지 않은 응답을 받았습니다.");
  }
};

export const askQuestionAboutChart = async (
  base64Image: string,
  analysis: PatternAnalysis,
  question: string,
  history: ChatMessage[]
): Promise<string> => {
  const systemInstruction = `
    당신은 전문 금융 분석가입니다. 사용자가 이전에 분석된 차트 이미지와 분석 결과에 대해 질문하고 있습니다.
    사용자의 질문에 대해 기술적 분석 관점에서 친절하고 전문적으로 한국어로 답변하십시오.
    이전 분석 결과: ${JSON.stringify(analysis)}
    답변 시 차트의 시각적 요소(이미지)와 이전 분석 내용을 적극 참고하십시오.
  `;

  // Build content array including history, image, and the new question
  const contents = [
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [
        { text: question },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        }
      ]
    }
  ];

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction,
    },
  });

  return response.text || "답변을 생성할 수 없습니다.";
};
