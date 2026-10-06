"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { getMyAnalyses } from "@/lib/firebase/analyses";
import type { Analysis } from "@/types";
import Link from "next/link";

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getMyAnalyses(user.uid);
        setAnalyses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const formatDate = (d: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <main className="max-w-3xl mx-auto p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">분석 이력</h1>
          <p className="text-gray-500 text-sm mt-1">
            내가 분석한 피드와 AI 답변을 확인합니다.
          </p>
        </div>
        <Link
          href="/analyze"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
        >
          새 분석
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="mb-3">아직 분석 이력이 없습니다.</p>
          <Link
            href="/analyze"
            className="text-primary-600 hover:underline text-sm"
          >
            첫 분석 하러 가기 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === a.id ? null : a.id)
                }
                className="w-full text-left p-5 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {a.originalText.slice(0, 120)}
                      {a.originalText.length > 120 ? "..." : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>{formatDate(a.createdAt)}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          a.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : a.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {a.status === "completed"
                          ? "완료"
                          : a.status === "failed"
                          ? "실패"
                          : "진행중"}
                      </span>
                      {typeof a.copyrightRiskScore === "number" && (
                        <span className="text-amber-600">
                          저작권 {a.copyrightRiskScore}점
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm shrink-0">
                    {expandedId === a.id ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedId === a.id && a.status === "completed" && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="pt-4 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {a.aiResponse}
                  </div>
                </div>
              )}

              {expandedId === a.id && a.status === "failed" && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <p className="pt-4 text-sm text-red-600">
                    {a.errorMessage || "분석에 실패했습니다."}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
