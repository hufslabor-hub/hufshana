import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";
import type { User, UserRole } from "@/types";

const googleProvider = new GoogleAuthProvider();

/**
 * 관리자로 지정할 이메일 목록
 * 첫 로그인 시 이 목록에 있으면 role = "admin"으로 생성됩니다.
 * 나중에 Firestore에서 직접 수정해도 됩니다.
 */
const ADMIN_EMAILS: string[] = [
  // 예: "your-email@gmail.com",
];

/** Google 팝업 로그인 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  let role: UserRole = "user";

  if (!userSnap.exists()) {
    // 첫 로그인 → 기본 role = user (ADMIN_EMAILS에 있으면 admin)
    if (ADMIN_EMAILS.includes(firebaseUser.email || "")) {
      role = "admin";
    }

    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // 기존 사용자 → role 유지, 프로필만 최신화
    const data = userSnap.data();
    role = data.role || "user";
    await setDoc(
      userRef,
      {
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/** 로그아웃 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/** 현재 Firebase 유저로부터 Firestore 유저 정보 가져오기 */
export async function getUserProfile(firebaseUser: FirebaseUser): Promise<User | null> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    role: data.role || "user",
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

/** onAuthStateChanged 래퍼 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
