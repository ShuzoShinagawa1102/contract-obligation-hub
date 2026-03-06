"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONTRACT_TYPES } from "@/lib/constants";

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    contractType: "",
    counterparty: "",
    businessOwner: "",
    description: "",
    priority: "MEDIUM",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "エラーが発生しました");
        return;
      }
      const newCase = await res.json();
      router.push(`/cases/${newCase.id}`);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          案件一覧に戻る
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">新規案件起票</h1>
        <p className="text-sm text-gray-500 mb-8">
          契約案件の基本情報を入力してください
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              案件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="例: A社との業務委託契約 2024年度版"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              契約種別 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.contractType}
              onChange={(e) =>
                setForm({ ...form, contractType: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {CONTRACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              相手先 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.counterparty}
              onChange={(e) =>
                setForm({ ...form, counterparty: e.target.value })
              }
              placeholder="例: 株式会社〇〇"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              事業部担当者 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.businessOwner}
              onChange={(e) =>
                setForm({ ...form, businessOwner: e.target.value })
              }
              placeholder="例: 山田 太郎"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              優先度
            </label>
            <div className="flex gap-3">
              {[
                { value: "HIGH", label: "高", color: "text-red-600" },
                { value: "MEDIUM", label: "中", color: "text-yellow-600" },
                { value: "LOW", label: "低", color: "text-green-600" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p.value })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.priority === p.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={p.color}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              案件説明
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="契約の概要、背景、特記事項など"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="/"
              className="flex-1 text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </a>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "起票中..." : "案件を起票する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
