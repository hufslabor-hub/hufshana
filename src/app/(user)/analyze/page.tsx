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
          피드를 붙여넣으면 사전에 정의된 조건에 따라 AI가 조언을 해줍니다.
        </p>
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
