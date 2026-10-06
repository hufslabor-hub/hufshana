import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { Analysis } from "@/types";

const COLLECTION = "analyses";

function toAnalysis(id: string, data: any): Analysis {
  return {
    id,
    userId: data.userId,
    originalText: data.originalText || "",
    imageUrls: data.imageUrls || [],
    appliedConditionIds: data.appliedConditionIds || [],
    aiResponse: data.aiResponse || "",
    copyrightRiskScore: data.copyrightRiskScore,
    copyrightNotes: data.copyrightNotes,
    status: data.status || "pending",
    errorMessage: data.errorMessage,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

/** 분석 결과 저장 (pending 상태로 생성) */
export async function createAnalysis(data: {
  userId: string;
  originalText: string;
  imageUrls?: string[];
  appliedConditionIds: string[];
}): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    userId: data.userId,
    originalText: data.originalText,
    imageUrls: data.imageUrls || [],
    appliedConditionIds: data.appliedConditionIds,
    aiResponse: "",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** 분석 결과 업데이트 (완료/실패) */
export async function updateAnalysis(
  id: string,
  data: Partial<{
    aiResponse: string;
    copyrightRiskScore: number;
    copyrightNotes: string;
    status: "pending" | "completed" | "failed";
    errorMessage: string;
  }>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** 내 분석 이력 */
export async function getMyAnalyses(userId: string): Promise<Analysis[]> {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toAnalysis(d.id, d.data()));
}

/** 단일 분석 */
export async function getAnalysis(id: string): Promise<Analysis | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return toAnalysis(snap.id, snap.data());
}
