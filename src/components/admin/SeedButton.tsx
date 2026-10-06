"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { seedDefaultConditions } from "@/lib/firebase/seed";

interface SeedButtonProps {
  onDone: () => void;
}

export default function SeedButton({ onDone }: SeedButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSeed = async () => {
    if (!user) return;
    if (!confirm("기본 조건 3개(저작권/해시태그/톤앤매너)를 추가할까요?")) return;

    setLoading(true);
    setMsg(null);
    try {
      await seedDefaultConditions(user.uid);
      setMsg("기본 조건 3개가 추가되었습니다.");
      onDone();
    } catch (err: any) {
      console.error(err);
      setMsg(err?.message || "시드 실패. 관리자 권한과 Firestore 규칙을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-4 py-2 text-sm border border-dashed border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition disabled:opacity-50"
      >
        {loading ? "추가 중..." : "기본 조건 3개 일괄 등록"}
      </button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
