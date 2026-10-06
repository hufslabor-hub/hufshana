import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // 속도와 비용 균형. 필요시 gemini-1.5-pro로 변경
});

export async function analyzeWithGemini(
  prompt: string,
  imageUrls?: string[]
): Promise<string> {
  // 이미지가 있으면 multimodal 요청으로 확장 가능
  // 현재는 텍스트 프롬프트 기준
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
