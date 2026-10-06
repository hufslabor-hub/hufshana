"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AnalyzeForm from "@/components/user/AnalyzeForm";
import AnalysisResult from "@/components/user/AnalysisResult";

interface Result {
  id: string;
  aiResponse: string;
  copyrightRiskScore?: number;
  copyrightNotes?: string;
}

export default function AnalyzePage() {
  return (
    <ProtectedRoute>
      <AnalyzeContent />
    </ProtectedRoute>
  );
}

function AnalyzeContent() {
  const [result, setResult] = useState<Result | null>(null);

  return (
    <main className="max-w-3xl mx-auto p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">인스타 피드 분석</h1>
        <p className="text-gray-500 mt-1">
          게시물 링크와 캡션을 넣으면 조건에 맞춰 AI가 조언합니다.
        </p>
        <div className="mt-3 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
          💡 <strong>팁:</strong> 인스타에서 게시물 → 공유 → 링크 복사 후 붙여넣고,
          캡션/해시태그도 함께 복사해 넣으면 분석이 더 정확해집니다.
          (인스타 정책상 링크만으로는 본문을 자동으로 가져오기 어렵습니다.)
        </div>
      </div>

      {!result ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <AnalyzeForm onSuccess={setResult} />
        </div>
      ) : (
        <AnalysisResult
          aiResponse={result.aiResponse}
          copyrightRiskScore={result.copyrightRiskScore}
          copyrightNotes={result.copyrightNotes}
          onReset={() => setResult(null)}
        />
      )}
    </main>
  );
}
