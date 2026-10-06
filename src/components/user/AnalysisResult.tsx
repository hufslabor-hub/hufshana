"use client";

interface AnalysisResultProps {
  aiResponse: string;
  copyrightRiskScore?: number;
  copyrightNotes?: string;
  onReset: () => void;
}

export default function AnalysisResult({
  aiResponse,
  copyrightRiskScore,
  copyrightNotes,
  onReset,
}: AnalysisResultProps) {
  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 40) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return "높음";
    if (score >= 40) return "보통";
    return "낮음";
  };

  return (
    <div className="space-y-5">
      {/* 저작권 위험도 카드 */}
      {typeof copyrightRiskScore === "number" && (
        <div
          className={`p-4 rounded-xl border ${getRiskColor(copyrightRiskScore)}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">저작권 위험도</span>
            <span className="text-2xl font-bold">
              {copyrightRiskScore}점
              <span className="text-sm font-normal ml-2">
                ({getRiskLabel(copyrightRiskScore)})
              </span>
            </span>
          </div>
          {copyrightNotes && (
            <p className="text-sm mt-2 opacity-80">{copyrightNotes}</p>
          )}
        </div>
      )}

      {/* AI 전체 응답 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">AI 조언</h3>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {aiResponse}
        </div>
      </div>

      <button
        onClick={onReset}
        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
      >
        새 분석하기
      </button>
    </div>
  );
}
