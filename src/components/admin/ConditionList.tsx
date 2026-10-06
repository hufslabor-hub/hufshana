"use client";

import type { Condition } from "@/types";

interface ConditionListProps {
  conditions: Condition[];
  onEdit: (condition: Condition) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  loading?: boolean;
}

export default function ConditionList({
  conditions,
  onEdit,
  onDelete,
  onToggleActive,
  loading = false,
}: ConditionListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (conditions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
        등록된 조건이 없습니다. 새 조건을 추가해보세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conditions.map((c) => (
        <div
          key={c.id}
          className={`bg-white rounded-xl border p-5 transition ${
            c.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{c.title}</h3>
                <span className="text-xs text-gray-400">#{c.order}</span>
                {c.isCopyrightCheck && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    저작권
                  </span>
                )}
                {!c.isActive && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    비활성
                  </span>
                )}
              </div>
              {c.description && (
                <p className="text-sm text-gray-500 mt-1">{c.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2 font-mono line-clamp-2">
                {c.promptTemplate}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleActive(c.id, !c.isActive)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  c.isActive
                    ? "border-green-200 text-green-700 hover:bg-green-50"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
                title={c.isActive ? "비활성화" : "활성화"}
              >
                {c.isActive ? "ON" : "OFF"}
              </button>
              <button
                onClick={() => onEdit(c)}
                className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                수정
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${c.title}" 조건을 삭제할까요?`)) {
                    onDelete(c.id);
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
