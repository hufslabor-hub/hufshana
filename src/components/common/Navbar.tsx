"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout, isAdmin, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return null;

  const isActive = (path: string) =>
    pathname === path ? "text-primary-600 font-semibold" : "text-gray-600 hover:text-primary-600";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-primary-700">
              Insta AI Advisor
            </Link>

            {user && (
              <div className="hidden sm:flex gap-4 text-sm">
                <Link href="/dashboard" className={isActive("/dashboard")}>
                  대시보드
                </Link>
                <Link href="/analyze" className={isActive("/analyze")}>
                  분석하기
                </Link>
                <Link href="/history" className={isActive("/history")}>
                  이력
                </Link>
                {isAdmin && (
                  <Link href="/conditions" className={isActive("/conditions")}>
                    조건 관리
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {user.displayName || user.email}
                  </span>
                  {isAdmin && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => logout()}
                  className="text-sm text-gray-500 hover:text-red-600 transition"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
