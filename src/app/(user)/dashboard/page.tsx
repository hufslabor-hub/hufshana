"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, isAdmin } = useAuth();

  return (
    <main className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {user?.displayName || "사용자"}님 👋
        </h1>
        <p className="text-gray-500 mt-1">
          인스타그램 피드를 분석하고 AI 조언을 받아보세요.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/analyze"
          className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition"
        >
          <div className="text-3xl mb-3">📸</div>
          <h2 className="font-semibold text-lg">피드 분석하기</h2>
          <p className="text-sm text-gray-500 mt-1">
            인스타그램 피드를 붙여넣고 AI 조언을 받습니다.
          </p>
        </Link>

        <Link
          href="/history"
          className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition"
        >
          <div className="text-3xl mb-3">📋</div>
          <h2 className="font-semibold text-lg">분석 이력</h2>
          <p className="text-sm text-gray-500 mt-1">
            이전에 분석한 피드와 AI 답변을 확인합니다.
          </p>
        </Link>

        {isAdmin && (
          <Link
            href="/conditions"
            className="block p-6 bg-white rounded-xl border border-primary-200 hover:border-primary-400 hover:shadow-md transition sm:col-span-2"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h2 className="font-semibold text-lg text-primary-700">
              조건 관리 (관리자)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              AI 분석에 사용되는 조건을 추가/수정/삭제합니다.
            </p>
          </Link>
        )}
      </div>
    </main>
  );
}
