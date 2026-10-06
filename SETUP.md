# Firebase + Gemini 설정 가이드

프로젝트 번호: **817364147122**

## 1. Firebase Console에서 확인할 정보

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 해당 프로젝트 선택 (번호 817364147122)
3. 왼쪽 톱니바퀴 → **프로젝트 설정**

### 1-1. 일반 탭 → 내 앱
- 웹 앱이 없으면 **앱 추가** → 웹(`</>`) 선택 후 앱 등록
- 아래 값을 복사해 주세요:

```
NEXT_PUBLIC_FIREBASE_API_KEY=           (apiKey)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=       (authDomain) 예: your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=        (projectId)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=    (storageBucket)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= (messagingSenderId)
NEXT_PUBLIC_FIREBASE_APP_ID=            (appId)
```

### 1-2. 서비스 계정 탭 (Admin SDK용)
1. **서비스 계정** 탭 클릭
2. **새 비공개 키 생성** → JSON 파일 다운로드
3. JSON 파일에서 아래 값 추출:

```
FIREBASE_ADMIN_PROJECT_ID=     (project_id)
FIREBASE_ADMIN_CLIENT_EMAIL=   (client_email)
FIREBASE_ADMIN_PRIVATE_KEY=    (private_key)  ← 따옴표 포함해서 한 줄로, \n 유지
```

> private_key는 `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` 형태입니다.  
> `.env.local`에 넣을 때 따옴표로 감싸주세요.

## 2. Authentication 설정
1. 왼쪽 메뉴 **Build → Authentication → Sign-in method**
2. **Google** 제공업체 사용 설정
3. 프로젝트 지원 이메일 선택 후 저장

## 3. Firestore 생성
1. **Build → Firestore Database**
2. **데이터베이스 만들기** → 프로덕션 모드 (나중에 Rules로 제어)
3. 위치: `asia-northeast3` (서울) 권장

## 4. Storage 생성
1. **Build → Storage**
2. **시작하기** → 보안 규칙 기본값으로 진행
3. 위치: Firestore와 동일하게

## 5. Gemini API 키
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. **API 키 만들기** (같은 Google 계정 사용 권장)
3. 생성된 키를 `GEMINI_API_KEY=`에 넣기

## 6. .env.local 작성 예시

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=817364147122
NEXT_PUBLIC_FIREBASE_APP_ID=1:817364147122:web:xxxxxxxxxxxx

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# Gemini
GEMINI_API_KEY=AIzaSy...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 7. 완료 후
값을 알려주시거나 `.env.local` 내용을 붙여넣어 주시면  
바로 파일에 반영하고 다음 단계(로그인 구현)로 진행하겠습니다.
