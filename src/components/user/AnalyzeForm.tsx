"use client";

import { useState, useRef, useCallback } from "react";
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

interface PreviewImage {
  id: string;
  base64: string;
  mimeType: string;
  name: string;
}

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 4;

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      reject(new Error(`이미지 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`));
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("이미지 파일만 업로드할 수 있습니다."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        base64: reader.result as string,
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

export default function AnalyzeForm({ onSuccess }: AnalyzeFormProps) {
  const { user } = useAuth();
  const [instagramUrl, setInstagramUrl] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback(async (files: FileList | File[]) => {
    setError(null);
    const fileArr = Array.from(files);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`이미지는 최대 ${MAX_IMAGES}장까지 가능합니다.`);
      return;
    }

    const toAdd = fileArr.slice(0, remaining);
    try {
      const converted = await Promise.all(
        toAdd.map(async (file) => {
          const { base64, mimeType } = await fileToBase64(file);
          return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            base64,
            mimeType,
            name: file.name,
          };
        })
      );
      setImages((prev) => [...prev, ...converted]);
    } catch (err: any) {
      setError(err?.message || "이미지 처리 중 오류가 발생했습니다.");
    }
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // 클립보드 붙여넣기
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        await addImages(imageFiles);
      }
    },
    [addImages]
  );

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      await addImages(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedText = text.trim();
    const trimmedUrl = instagramUrl.trim();

    if (!trimmedText && !trimmedUrl && images.length === 0) {
      setError("링크, 텍스트, 이미지 중 하나 이상 입력해주세요.");
      return;
    }

    if (!user || !auth.currentUser) {
      setError("로그인이 필요합니다.");
      return;
    }

    const content =
      trimmedText ||
      (trimmedUrl
        ? `[인스타그램 게시물 링크]\n${trimmedUrl}`
        : "(이미지 기반 분석 요청)");

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
          text: content,
          instagramUrl: trimmedUrl || undefined,
          images: images.map((img) => ({
            base64: img.base64,
            mimeType: img.mimeType,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || "분석에 실패했습니다.");
      }

      onSuccess({
        id: data.id,
        aiResponse: data.aiResponse,
        copyrightRiskScore: data.copyrightRiskScore,
        copyrightNotes: data.copyrightNotes,
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" onPaste={handlePaste}>
      {/* 인스타 링크 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          인스타그램 게시물 링크
        </label>
        <input
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://www.instagram.com/p/XXXXXXXX/"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
          disabled={loading}
        />
      </div>

      {/* 이미지 업로드 영역 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          사진 / 이미지{" "}
          <span className="text-gray-400 font-normal">
            (최대 {MAX_IMAGES}장, 각 {MAX_SIZE_MB}MB)
          </span>
        </label>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
            dragOver
              ? "border-primary-400 bg-primary-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <p className="text-sm text-gray-600 mb-2">
            이미지를 드래그하거나,{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary-600 underline"
            >
              파일 선택
            </button>
            {" · "}
            <span className="text-gray-500">Ctrl+V 로 클립보드 붙여넣기</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addImages(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* 미리보기 */}
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative w-24 h-24 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.base64}
                  alt={img.name}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-90 hover:opacity-100"
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 캡션 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          캡션 · 해시태그 · 설명{" "}
          <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="캡션, 해시태그 등을 붙여넣으세요. (이미지와 함께 분석됩니다)"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-y text-sm"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={
          loading ||
          (!text.trim() && !instagramUrl.trim() && images.length === 0)
        }
        className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            AI 분석 중... (이미지 포함 시 조금 더 걸릴 수 있습니다)
          </>
        ) : (
          "AI 분석 요청"
        )}
      </button>
    </form>
  );
}
