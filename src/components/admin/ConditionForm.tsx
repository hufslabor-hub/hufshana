"use client";

import { useState, useEffect } from "react";
import type { Condition } from "@/types";
import type { ConditionInput } from "@/lib/firebase/conditions";

interface ConditionFormProps {
  initial?: Condition | null;
  onSubmit: (data: ConditionInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const DEFAULT: ConditionInput = {
  title: "",
  description: "",
  promptTemplate: "",
  isActive: true,
  order: 0,
  isCopyrightCheck: false,
};

export default function ConditionForm({
  initial,
  onSubmit,
  onCancel,
  loading = false,
}: ConditionFormProps) {
  const [form, setForm] = useState<ConditionInput>(DEFAULT);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        promptTemplate: initial.promptTemplate,
        isActive: initial.isActive,
        order: initial.order,
        isCopyrightCheck: initial.isCopyrightCheck ?? false,
      });
    } else {
      setForm(DEFAULT);
    }
  }, [initial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "order") {
      setForm((prev) => ({ ...prev, order: parseInt(value) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!form.promptTemplate.trim()) {
      setError("프롬프트 템플릿을 입력해주세요.");
      return;
    }

    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.message || "저장에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          제목 *
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="예: 저작권 위험 체크"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="이 조건이 무엇을 확인하는지 간단히"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          프롬프트 템플릿 *
        </label>
        <textarea
          name="promptTemplate"
          value={form.promptTemplate}
          onChange={handleChange}
          rows={6}
          placeholder={`예시:\n다음 인스타그램 피드 내용을 분석해주세요.\n\n{{content}}\n\n- 저작권이 있는 이미지나 영상이 사용되었는지 판단\n- 위험도(0~100)와 이유를 알려주세요.`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono text-sm"
          required
        />
        <p className="mt-1 text-xs text-gray-400">
          {"{{content}}"} 자리에 실제 피드 내용이 들어갑니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            정렬 순서
          </label>
          <input
            type="number"
            name="order"
            value={form.order}
            onChange={handleChange}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            활성화
          </label>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isCopyrightCheck"
            name="isCopyrightCheck"
            checked={form.isCopyrightCheck}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <label htmlFor="isCopyrightCheck" className="text-sm text-gray-700">
            저작권 체크 조건
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-60 font-medium"
        >
          {loading ? "저장 중..." : initial ? "수정하기" : "추가하기"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          취소
        </button>
      </div>
    </form>
  );
}
