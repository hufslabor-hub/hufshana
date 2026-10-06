/**
 * 초기 조건 시드 데이터 (개발용)
 * 브라우저 콘솔이나 관리자 페이지에서 한 번만 실행하면 됩니다.
 */
import { createCondition } from "./conditions";

export const DEFAULT_CONDITIONS = [
  {
    title: "저작권 위험 체크",
    description: "피드에 사용된 이미지나 영상이 저작권이 있는 자료인지 분석합니다.",
    promptTemplate: `다음 인스타그램 피드 내용을 분석해주세요.

{{content}}

다음 항목을 평가해주세요:
1. 저작권이 있는 사진, 그림, 영상, 캐릭터, 로고 등이 사용되었을 가능성
2. 위험도 점수 (0~100, 높을수록 위험)
3. 구체적인 이유와 개선 제안

응답 형식:
- 위험도: XX점
- 판단 근거: ...
- 조언: ...`,
    isActive: true,
    order: 1,
    isCopyrightCheck: true,
  },
  {
    title: "해시태그 & 카피 품질",
    description: "캡션과 해시태그가 효과적인지 평가합니다.",
    promptTemplate: `다음 인스타그램 피드의 캡션과 해시태그를 분석해주세요.

{{content}}

다음을 평가해주세요:
1. 캡션의 매력도와 가독성
2. 해시태그 적절성 (너무 많거나 관련 없는 태그 여부)
3. 개선 제안

응답 형식:
- 캡션 점수: XX점
- 해시태그 점수: XX점
- 조언: ...`,
    isActive: true,
    order: 2,
    isCopyrightCheck: false,
  },
  {
    title: "브랜드 톤앤매너",
    description: "브랜드 이미지와 일관된 톤인지 확인합니다.",
    promptTemplate: `다음 인스타그램 피드가 전문적이고 신뢰감 있는 톤앤매너를 유지하는지 분석해주세요.

{{content}}

다음을 평가해주세요:
1. 말투와 표현이 적절한지
2. 부적절하거나 논란이 될 수 있는 표현 여부
3. 개선 제안

응답 형식:
- 톤앤매너 점수: XX점
- 판단 근거: ...
- 조언: ...`,
    isActive: true,
    order: 3,
    isCopyrightCheck: false,
  },
];

/** 시드 실행 (관리자 로그인 상태에서 호출) */
export async function seedDefaultConditions(userId: string) {
  for (const c of DEFAULT_CONDITIONS) {
    await createCondition(c, userId);
  }
}
