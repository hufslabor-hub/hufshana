# Insta AI Advisor

인스타그램 피드를 붙여넣으면 사전에 정의한 조건에 따라 AI가 조언을 해주는 웹앱입니다.

## 주요 기능

- **Google(Gmail) 로그인** (Firebase Authentication)
- **사용자 모드**: 인스타 피드 업로드 → AI 분석 → 개인 이력 조회
- **관리자 모드**: 분석 조건 CRUD (추가/수정/삭제/활성 토글)
- **Gemini AI** 기반 멀티 조건 분석 (저작권 위험도 포함)
- **Cloud Firestore**에 개인별 분석 이력 저장

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Auth | Firebase Authentication (Google Provider) |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| AI | Google Gemini 1.5 Flash |
| Backend | Next.js API Routes + Firebase Admin SDK |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`에 Firebase / Gemini 키를 입력하세요.  
자세한 방법은 [SETUP.md](./SETUP.md)를 참고하세요.

### 3. Firebase Console 설정

1. Authentication → Sign-in method → **Google 사용 설정 ON**
2. Firestore Database 생성
3. [firestore.rules](./firebase/firestore.rules) 내용을 Firestore 규칙에 붙여넣고 게시
4. 본인 users 문서의 `role`을 `"admin"`으로 설정

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

## 폴더 구조

```
src/
├── app/
│   ├── (auth)/login/          # 로그인
│   ├── (user)/
│   │   ├── dashboard/         # 대시보드
│   │   ├── analyze/           # 피드 분석
│   │   └── history/           # 분석 이력
│   ├── (admin)/conditions/    # 조건 관리
│   └── api/analyze/           # Gemini 분석 API
├── components/
├── lib/firebase/              # Firebase 헬퍼
├── lib/gemini/                # Gemini 분석 로직
├── hooks/                     # useAuth 등
└── types/
firebase/
├── firestore.rules            # 보안 규칙
├── storage.rules
└── firestore.indexes.json
```

## 테스트

[TEST_CHECKLIST.md](./TEST_CHECKLIST.md) 참고

## 라이선스

Private / 내부 사용
