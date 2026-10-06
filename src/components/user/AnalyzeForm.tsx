"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/client";

interface AnalyzeFormProps {
  onSuccess: (result: {
    id: string;
    aiResponse: string;
    copyrightRiskScore?: number;
    copyrightNotes?: string;
  }) => void;
}

export default function AnalyzeForm({ onSuccess }: AnalyzeFormProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!text.trim() || text.trim().length < 5) {
      setError("피드 내용을 최소 5자 이상 입력해주세요.");
      return;
    }

    if (!user || !auth.currentUser) {
      setError("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          text: text.trim(),
          imageUrls: [], // 이미지 업로드는 다음 단계에서 확장 가능
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "분석에 실패했습니다.");
      }

      onSuccess({
        id: data.id,
        aiResponse: data.aiResponse,
        copyrightRiskScore: data.copyrightRiskScore,
        copyrightNotes: data.copyrightNotes,
      });

      // 성공 후 입력 초기화는 선택
      // setText("");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          인스타그램 피드 내용
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={`인스타그램 게시물 캡션, 해시태그, 설명 등을 붙여넣으세요.

예시:
오늘 새로 산 원피스 너무 맘에 들어 💕
#ootd #데일리룩 #원피스추천 #패션

또는 게시물 전체를 복사해서 붙여넣어도 됩니다.`}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-y text-sm leading-relaxed"
          disabled={loading}
        />
        <p className="mt-1.5 text-xs text-gray-400">
          {text.length}자 · 최소 5자 이상
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || text.trim().length < 5}
        className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            AI 분석 중...
          </>
        ) : (
          "AI 분석 요청"
        )}
      </button>
    </form>
  );
}
