# 관리자 지정 + Firestore Rules 배포 가이드

## 1. 본인을 관리자로 지정 (중요)

Firebase Console → Firestore Database → `users` 컬렉션

문서 ID: `Z8ZenAfsfCPt6PzXXIvEpJ7QEBB3`

다음 필드를 확인/수정하세요:

```
uid: "Z8ZenAfsfCPt6PzXXIvEpJ7QEBB3"
email: (본인 Gmail)
displayName: (이름)
photoURL: (프로필 이미지 URL)
role: "admin"          ← 이 값을 "admin"으로 설정
createdAt: (타임스탬프)
updatedAt: (타임스탬프)
```

문서가 아직 없다면:
1. 앱에서 Google 로그인 한 번 진행 → users 문서 자동 생성
2. 그 다음 role을 "admin"으로 변경

또는 Console에서 직접 문서를 만들어도 됩니다.

## 2. Firestore 보안 규칙 배포

### 방법 A: Console에서 직접 붙여넣기 (가장 빠름)

1. Firebase Console → Firestore Database → **규칙** 탭
2. 아래 규칙 전체를 복사해서 붙여넣기
3. **게시** 클릭

### 방법 B: Firebase CLI

```bash
cd insta-ai-advisor
firebase deploy --only firestore:rules
```

## 3. 규칙 전문 (복사해서 사용)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated()
                    && request.auth.uid == userId
                    && request.resource.data.uid == userId
                    && request.resource.data.role in ['user', 'admin'];
      allow update: if isAdmin()
                    || (isOwner(userId)
                        && request.resource.data.role == resource.data.role);
      allow delete: if isAdmin();
    }

    match /conditions/{conditionId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    match /analyses/{analysisId} {
      allow read: if isAuthenticated()
                  && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated()
                    && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated()
                    && (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }
  }
}
