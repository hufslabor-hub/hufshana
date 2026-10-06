export type UserRole = "user" | "admin";

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Condition {
  id: string;
  title: string;
  description: string;
  /** Gemini에 전달할 프롬프트 템플릿. {{content}} 자리에 피드 내용이 들어감 */
  promptTemplate: string;
  isActive: boolean;
  order: number;
  /** 저작권 체크 등 특수 조건 여부 */
  isCopyrightCheck?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Analysis {
  id: string;
  userId: string;
  /** 사용자가 붙여넣은 원본 텍스트 */
  originalText: string;
  /** 업로드한 이미지 Storage URL 목록 */
  imageUrls: string[];
  /** 적용된 조건 ID 목록 */
  appliedConditionIds: string[];
  /** AI가 생성한 전체 조언 */
  aiResponse: string;
  /** 저작권 위험도 (0~100) - 저작권 조건이 있을 때만 */
  copyrightRiskScore?: number;
  copyrightNotes?: string;
  status: "pending" | "completed" | "failed";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisRequest {
  text: string;
  imageUrls?: string[];
  conditionIds?: string[]; // 비어있으면 모든 활성 조건 적용
}
