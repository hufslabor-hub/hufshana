"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ConditionList from "@/components/admin/ConditionList";
import ConditionForm from "@/components/admin/ConditionForm";
import SeedButton from "@/components/admin/SeedButton";
import {
  getConditions,
  createCondition,
  updateCondition,
  deleteCondition,
  type ConditionInput,
} from "@/lib/firebase/conditions";
import { useAuth } from "@/hooks/useAuth";
import type { Condition } from "@/types";

export default function ConditionsPage() {
  return (
    <ProtectedRoute adminOnly>
      <ConditionsContent />
    </ProtectedRoute>
  );
}

function ConditionsContent() {
  const { user } = useAuth();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<Condition | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConditions();
      setConditions(data);
    } catch (err) {
      console.error(err);
      setMessage("조건 목록을 불러오지 못했습니다. Firestore 규칙/권한을 확인하세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreate = async (data: ConditionInput) => {
    if (!user) return;
    setSaving(true);
    try {
      await createCondition(data, user.uid);
      showMessage("조건이 추가되었습니다.");
      setMode("list");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: ConditionInput) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateCondition(editing.id, data);
      showMessage("조건이 수정되었습니다.");
      setMode("list");
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCondition(id);
      showMessage("조건이 삭제되었습니다.");
      await load();
    } catch (err) {
      console.error(err);
      showMessage("삭제에 실패했습니다.");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCondition(id, { isActive });
      await load();
    } catch (err) {
      console.error(err);
      showMessage("상태 변경에 실패했습니다.");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">조건 관리</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI 분석에 사용되는 조건을 관리합니다.
          </p>
        </div>

        {mode === "list" && (
          <button
            onClick={() => {
              setEditing(null);
              setMode("create");
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
          >
            + 새 조건
          </button>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 bg-primary-50 text-primary-800 text-sm rounded-lg">
          {message}
        </div>
      )}

      {mode === "list" && (
        <>
          {/* 조건이 없을 때 시드 버튼 표시 */}
          {!loading && conditions.length === 0 && (
            <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800 mb-3">
                아직 조건이 없습니다. 기본 조건 3개(저작권 체크 / 해시태그 / 톤앤매너)를
                한 번에 등록할 수 있습니다.
              </p>
              <SeedButton onDone={load} />
            </div>
          )}

          <ConditionList
            conditions={conditions}
            onEdit={(c) => {
              setEditing(c);
              setMode("edit");
            }}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            loading={loading}
          />
        </>
      )}

      {(mode === "create" || mode === "edit") && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {mode === "create" ? "새 조건 추가" : "조건 수정"}
          </h2>
          <ConditionForm
            initial={editing}
            onSubmit={mode === "create" ? handleCreate : handleUpdate}
            onCancel={() => {
              setMode("list");
              setEditing(null);
            }}
            loading={saving}
          />
        </div>
      )}
    </main>
  );
}
