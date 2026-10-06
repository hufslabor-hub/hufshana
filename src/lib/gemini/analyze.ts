import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Condition } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AnalyzeResult {
  fullResponse: string;
  copyrightRiskScore?: number;
  copyrightNotes?: string;
}

/**
 * 활성 조건들을 기반으로 Gemini에 분석 요청
 */
export async function runAnalysis(
  content: string,
  conditions: Condition[],
  imageUrls: string[] = []
): Promise<AnalyzeResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  if (conditions.length === 0) {
    throw new Error("적용할 활성 조건이 없습니다. 관리자에게 문의하세요.");
  }

  // 조건별 프롬프트 조립
  const conditionBlocks = conditions
    .map((c, i) => {
      const prompt = c.promptTemplate.replace(/\{\{content\}\}/g, content);
      return `### 조건 ${i + 1}: ${c.title}\n${prompt}`;
    })
    .join("\n\n---\n\n");

  const systemInstruction = `당신은 인스타그램 피드 콘텐츠를 전문적으로 분석하는 AI 어드바이저입니다.
주어진 조건에 따라 피드를 분석하고, 구체적이고 실행 가능한 조언을 한국어로 제공하세요.
각 조건에 대해 명확히 구분하여 답변하세요.`;

  const fullPrompt = `${systemInstruction}

아래 인스타그램 피드 원문:
"""
${content}
"""

${imageUrls.length > 0 ? `(참고: ${imageUrls.length}개의 이미지가 함께 제공되었습니다.)` : ""}

아래 조건들에 따라 분석해주세요:

${conditionBlocks}

---
전체 응답은 마크다운 형식으로 정리해주세요.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // 이미지가 있으면 multimodal 요청
  let result;
  if (imageUrls.length > 0) {
    // 이미지를 base64 또는 URL로 전달 (Gemini는 URL 직접 지원이 제한적이므로
    // 여기서는 텍스트 중심으로 처리. 필요시 Storage에서 base64 변환 가능)
    const parts: any[] = [{ text: fullPrompt }];
    // 간단한 구현: 이미지 URL을 프롬프트에 포함
    // 실제 비전 분석을 원하면 fetch → base64 변환 후 inlineData로 전달
    result = await model.generateContent(parts);
  } else {
    result = await model.generateContent(fullPrompt);
  }

  const response = await result.response;
  const fullResponse = response.text();

  // 저작권 조건이 있으면 점수 추출 시도
  let copyrightRiskScore: number | undefined;
  let copyrightNotes: string | undefined;

  const copyrightCondition = conditions.find((c) => c.isCopyrightCheck);
  if (copyrightCondition) {
    const scoreMatch = fullResponse.match(/위험도[:\s]*(\d{1,3})\s*점/);
    if (scoreMatch) {
      copyrightRiskScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));
    }
    // 간단한 노트 추출
    const noteMatch = fullResponse.match(/판단 근거[:\s]*(.+?)(?=\n|$)/);
    if (noteMatch) {
      copyrightNotes = noteMatch[1].trim();
    }
  }

  return {
    fullResponse,
    copyrightRiskScore,
    copyrightNotes,
  };
}
