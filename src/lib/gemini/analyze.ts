import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Condition } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AnalyzeResult {
  fullResponse: string;
  copyrightRiskScore?: number;
  copyrightNotes?: string;
}

/** base64 이미지 (data URL 또는 pure base64) */
export interface ImageInput {
  base64: string; // data:image/jpeg;base64,... 또는 pure base64
  mimeType: string; // image/jpeg, image/png, image/webp
}

/**
 * 활성 조건들을 기반으로 Gemini에 분석 요청 (텍스트 + 이미지)
 */
export async function runAnalysis(
  content: string,
  conditions: Condition[],
  images: ImageInput[] = []
): Promise<AnalyzeResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  if (conditions.length === 0) {
    throw new Error("적용할 활성 조건이 없습니다. 관리자에게 문의하세요.");
  }

  const conditionBlocks = conditions
    .map((c, i) => {
      const prompt = c.promptTemplate.replace(/\{\{content\}\}/g, content);
      return `### 조건 ${i + 1}: ${c.title}\n${prompt}`;
    })
    .join("\n\n---\n\n");

  const systemInstruction = `당신은 인스타그램 피드 콘텐츠를 전문적으로 분석하는 AI 어드바이저입니다.
주어진 텍스트와 이미지를 함께 보고, 조건에 따라 구체적이고 실행 가능한 조언을 한국어로 제공하세요.
이미지가 있으면 이미지 내용(피사체, 구도, 텍스트, 워터마크, 브랜드 로고, 유명 캐릭터/작품 유사성 등)을 반드시 반영하세요.
각 조건에 대해 명확히 구분하여 답변하세요.`;

  const fullPrompt = `${systemInstruction}

아래 인스타그램 피드 정보:
"""
${content}
"""

${images.length > 0 ? `(첨부 이미지 ${images.length}장을 함께 분석해주세요.)` : ""}

아래 조건들에 따라 분석해주세요:

${conditionBlocks}

---
전체 응답은 마크다운 형식으로 정리해주세요.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
  });

  // multimodal parts
  const parts: any[] = [];

  for (const img of images) {
    let data = img.base64;
    // data URL이면 pure base64만 추출
    if (data.startsWith("data:")) {
      const match = data.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        data = match[2];
      }
    }
    parts.push({
      inlineData: {
        mimeType: img.mimeType || "image/jpeg",
        data,
      },
    });
  }

  parts.push({ text: fullPrompt });

  const result = await model.generateContent({ contents: [{ role: "user", parts }] });
  const response = await result.response;
  const fullResponse = response.text();

  let copyrightRiskScore: number | undefined;
  let copyrightNotes: string | undefined;

  const copyrightCondition = conditions.find((c) => c.isCopyrightCheck);
  if (copyrightCondition) {
    const scoreMatch = fullResponse.match(/위험도[:\s]*(\d{1,3})\s*점/);
    if (scoreMatch) {
      copyrightRiskScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));
    }
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
