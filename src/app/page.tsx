"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-8">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center">
        Insta AI Advisor
      </h1>
      <p className="text-lg text-gray-600 mb-10 text-center max-w-md">
        인스타그램 피드를 붙여넣으면 AI가 조건에 맞춰 조언을 해줍니다.
      </p>

      <div className="flex gap-4">
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        ) : user ? (
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
          >
            대시보드로 이동
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
            >
              Google로 시작하기
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
