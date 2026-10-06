import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { runAnalysis } from "@/lib/gemini/analyze";
import type { Condition } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization 헤더에서 ID 토큰 검증
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "유효하지 않은 토큰입니다." }, { status: 401 });
    }

    const userId = decoded.uid;

    // 2. 요청 바디
    const body = await req.json();
    const { text, imageUrls = [], conditionIds } = body as {
      text: string;
      imageUrls?: string[];
      conditionIds?: string[];
    };

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json(
        { error: "피드 내용을 최소 5자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    // 3. 활성 조건 조회 (index 없이 안전하게)
    const conditionsSnap = await adminDb
      .collection("conditions")
      .where("isActive", "==", true)
      .get();

    let conditions: Condition[] = conditionsSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || "",
        description: data.description || "",
        promptTemplate: data.promptTemplate || "",
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
        isCopyrightCheck: data.isCopyrightCheck ?? false,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        createdBy: data.createdBy || "",
      };
    });

    // order 기준 정렬
    conditions.sort((a, b) => a.order - b.order);

    // 특정 조건만 선택했다면 필터
    if (conditionIds && conditionIds.length > 0) {
      conditions = conditions.filter((c) => conditionIds.includes(c.id));
    }

    if (conditions.length === 0) {
      return NextResponse.json(
        { error: "적용할 활성 조건이 없습니다. 관리자가 조건을 등록해야 합니다." },
        { status: 400 }
      );
    }

    // 4. pending 상태로 분석 문서 생성
    const analysisRef = await adminDb.collection("analyses").add({
      userId,
      originalText: text.trim(),
      imageUrls: imageUrls || [],
      appliedConditionIds: conditions.map((c) => c.id),
      aiResponse: "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Gemini 호출
    try {
      const result = await runAnalysis(text.trim(), conditions, imageUrls);

      await analysisRef.update({
        aiResponse: result.fullResponse,
        copyrightRiskScore: result.copyrightRiskScore ?? null,
        copyrightNotes: result.copyrightNotes ?? null,
        status: "completed",
        updatedAt: new Date(),
      });

      return NextResponse.json({
        id: analysisRef.id,
        aiResponse: result.fullResponse,
        copyrightRiskScore: result.copyrightRiskScore,
        copyrightNotes: result.copyrightNotes,
        status: "completed",
      });
    } catch (geminiErr: any) {
      console.error("Gemini error:", geminiErr);
      await analysisRef.update({
        status: "failed",
        errorMessage: geminiErr?.message || "AI 분석 실패",
        updatedAt: new Date(),
      });

      return NextResponse.json(
        { error: "AI 분석 중 오류가 발생했습니다.", detail: geminiErr?.message },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", detail: err?.message },
      { status: 500 }
    );
  }
}
