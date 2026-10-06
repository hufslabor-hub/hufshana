import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { Condition } from "@/types";

const COLLECTION = "conditions";

function toCondition(id: string, data: any): Condition {
  return {
    id,
    title: data.title || "",
    description: data.description || "",
    promptTemplate: data.promptTemplate || "",
    isActive: data.isActive ?? true,
    order: data.order ?? 0,
    isCopyrightCheck: data.isCopyrightCheck ?? false,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    createdBy: data.createdBy || "",
  };
}

/** 전체 조건 목록 (order 오름차순) */
export async function getConditions(): Promise<Condition[]> {
  const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toCondition(d.id, d.data()));
}

/** 활성 조건만 */
export async function getActiveConditions(): Promise<Condition[]> {
  const all = await getConditions();
  return all.filter((c) => c.isActive);
}

/** 단일 조건 */
export async function getCondition(id: string): Promise<Condition | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return toCondition(snap.id, snap.data());
}

export interface ConditionInput {
  title: string;
  description: string;
  promptTemplate: string;
  isActive: boolean;
  order: number;
  isCopyrightCheck?: boolean;
}

/** 조건 생성 */
export async function createCondition(
  input: ConditionInput,
  createdBy: string
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    isCopyrightCheck: input.isCopyrightCheck ?? false,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** 조건 수정 */
export async function updateCondition(
  id: string,
  input: Partial<ConditionInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

/** 조건 삭제 */
export async function deleteCondition(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
