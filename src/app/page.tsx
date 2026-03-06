"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/constants";

interface CaseItem {
  id: string;
  title: string;
  contractType: string;
  counterparty: string;
  businessOwner: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  requirements: Array<{ status: string }>;
  tasks: Array<{ status: string }>;
  _count: { auditRecords: number };
}

const STATUS_FILTERS = [
  "ALL",
  "DRAFT",
  "INTAKE_VALIDATED",
  "WAITING_FOR_EVIDENCE",
  "IN_REVIEW",
  "EXCEPTION",
  "APPROVED",
  "REJECTED",
  "CLOSED",
];

export default function Dashboard() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchCases = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/cases?${params}`);
    const data = await res.json();
    setCases(data);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const stats = {
    total: cases.length,
    exception: cases.filter((c) => c.status === "EXCEPTION").length,
    inReview: cases.filter((c) => c.status === "IN_REVIEW").length,
    waitingForEvidence: cases.filter(
      (c) => c.status === "WAITING_FOR_EVIDENCE"
    ).length,
  };

  const getEvidenceProgress = (c: CaseItem) => {
    if (c.requirements.length === 0) return null;
    const met = c.requirements.filter((r) => r.status === "MET").length;
    return { met, total: c.requirements.length };
  };

  const getOpenTasks = (c: CaseItem) =>
    c.tasks.filter((t) => t.status !== "DONE").length;

  const hasOverdueTasks = (c: CaseItem) =>
    c.tasks.some((t) => t.status === "OVERDUE");

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="総案件数"
          value={stats.total}
          color="blue"
        />
        <StatCard
          label="例外対応中"
          value={stats.exception}
          color="red"
          alert={stats.exception > 0}
        />
        <StatCard
          label="審査中"
          value={stats.inReview}
          color="purple"
        />
        <StatCard
          label="証拠収集中"
          value={stats.waitingForEvidence}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="案件名・相手先・担当者で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s === "ALL" ? "すべて" : CASE_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Case List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="font-medium">案件が見つかりません</p>
          <p className="text-sm mt-1">
            <a href="/cases/new" className="text-blue-600 hover:underline">
              新しい案件を起票する
            </a>
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((c) => {
            const progress = getEvidenceProgress(c);
            const openTasks = getOpenTasks(c);
            const overdue = hasOverdueTasks(c);

            return (
              <a
                key={c.id}
                href={`/cases/${c.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          CASE_STATUS_COLORS[c.status]
                        }`}
                      >
                        {CASE_STATUS_LABELS[c.status] || c.status}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          PRIORITY_COLORS[c.priority]
                        }`}
                      >
                        優先度：{PRIORITY_LABELS[c.priority]}
                      </span>
                      {overdue && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          ⚠ 期限超過タスクあり
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base truncate">
                      {c.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {c.contractType} | 相手先: {c.counterparty} |
                      担当: {c.businessOwner}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">
                      更新: {new Date(c.updatedAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
                  {progress && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">必要条件:</span>
                      <span
                        className={
                          progress.met === progress.total
                            ? "text-green-600 font-medium"
                            : "text-yellow-600 font-medium"
                        }
                      >
                        {progress.met}/{progress.total} 充足
                      </span>
                    </div>
                  )}
                  {openTasks > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>未完了タスク {openTasks}件</span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  alert,
}: {
  label: string;
  value: number;
  color: string;
  alert?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };
  return (
    <div
      className={`rounded-xl p-4 ${colorMap[color]} ${alert && value > 0 ? "ring-2 ring-red-300" : ""}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium opacity-80">{label}</p>
    </div>
  );
}
