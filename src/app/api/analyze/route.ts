import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { runAnalysis, type ImageInput } from "@/lib/gemini/analyze";
import type { Condition } from "@/types";

export const maxDuration = 60; // 이미지 분석은 시간이 더 걸릴 수 있음

export async function POST(req: NextRequest) {
  try {
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
    const body = await req.json();
    const {
      text,
      images = [],
      instagramUrl,
    } = body as {
      text: string;
      images?: ImageInput[];
      instagramUrl?: string;
    };

    if ((!text || text.trim().length < 3) && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: "텍스트 또는 이미지를 입력해주세요." },
        { status: 400 }
      );
    }

    // 이미지 개수/크기 제한
    if (images && images.length > 5) {
      return NextResponse.json(
        { error: "이미지는 최대 5장까지 가능합니다." },
        { status: 400 }
      );
    }

    // 활성 조건 조회
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

    conditions.sort((a, b) => a.order - b.order);

    if (conditions.length === 0) {
      return NextResponse.json(
        { error: "적용할 활성 조건이 없습니다. 관리자가 조건을 등록해야 합니다." },
        { status: 400 }
      );
    }

    const contentText =
      (text || "").trim() ||
      (instagramUrl
        ? `[인스타그램 링크] ${instagramUrl}`
        : "(이미지 기반 분석)");

    // pending 문서 생성
    const analysisRef = await adminDb.collection("analyses").add({
      userId,
      originalText: contentText,
      imageUrls: [], // base64는 저장하지 않음 (용량)
      imageCount: images?.length || 0,
      appliedConditionIds: conditions.map((c) => c.id),
      aiResponse: "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      const result = await runAnalysis(contentText, conditions, images || []);

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
