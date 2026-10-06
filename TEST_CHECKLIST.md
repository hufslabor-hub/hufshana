# 테스트 체크리스트

## 사전 준비 (Firebase Console)

- [ ] Authentication → Sign-in method → **Google 사용 설정 ON**
- [ ] Firestore Database 생성 완료
- [ ] Firestore 규칙 게시 완료 (firebase/firestore.rules 내용)
- [ ] users/Z8ZenAfsfCPt6PzXXIvEpJ7QEBB3 문서의 role = **"admin"**
- [ ] Authorized domains에 localhost 포함

## 로컬 실행

```bash
cd insta-ai-advisor
npm install
npm run dev
```

브라우저: http://localhost:3000

## 테스트 시나리오

### 1. 로그인
- [ ] 랜딩 페이지 → "Google로 시작하기"
- [ ] Google 팝업 로그인 성공
- [ ] /dashboard 로 이동
- [ ] Navbar에 이름/프로필 표시
- [ ] Admin 뱃지 표시 (role=admin인 경우)

### 2. 조건 관리 (관리자)
- [ ] /conditions 접속
- [ ] "기본 조건 3개 일괄 등록" 클릭 → 저작권/해시태그/톤앤매너 생성
- [ ] 조건 수정 / 활성 토글 / 삭제 동작 확인
- [ ] 새 조건 직접 추가

### 3. 피드 분석
- [ ] /analyze 접속
- [ ] 인스타 캡션 예시 붙여넣기 (5자 이상)
- [ ] "AI 분석 요청" 클릭
- [ ] 로딩 후 AI 조언 표시
- [ ] 저작권 위험도 점수 표시 (저작권 조건 활성 시)

### 4. 이력
- [ ] /history 접속
- [ ] 방금 분석한 항목 목록에 표시
- [ ] 클릭 시 AI 답변 펼쳐보기

### 5. 권한
- [ ] 로그아웃 후 보호 페이지 접근 → /login 리다이렉트
- [ ] 일반 유저로 conditions 접근 → dashboard로 리다이렉트

## 자주 나오는 오류

| 증상 | 원인 | 해결 |
|------|------|------|
| auth/operation-not-allowed | Google 로그인 미활성화 | Console에서 Google ON |
| permission-denied | role이 admin이 아니거나 규칙 미게시 | role=admin + 규칙 게시 |
| 활성 조건이 없습니다 | conditions 비어 있음 | 시드 버튼 또는 조건 추가 |
| GEMINI 오류 | API 키 문제 | .env.local의 GEMINI_API_KEY 확인 |
| Admin SDK 오류 | private key 형식 | \n이 제대로 이스케이프됐는지 확인 |
