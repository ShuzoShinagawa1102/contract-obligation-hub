"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  REQUIREMENT_STATUS_LABELS,
  REQUIREMENT_STATUS_COLORS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  NEXT_STATUS_MAP,
} from "@/lib/constants";

interface Evidence {
  id: string;
  name: string;
  notes: string | null;
  status: string;
  uploadedAt: string;
}

interface Requirement {
  id: string;
  name: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  evidences: Evidence[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  owner: string;
  dueDate: string | null;
  status: string;
  createdAt: string;
}

interface AuditRecord {
  id: string;
  eventType: string;
  description: string;
  actor: string;
  createdAt: string;
}

interface CaseDetail {
  id: string;
  title: string;
  contractType: string;
  counterparty: string;
  businessOwner: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  requirements: Requirement[];
  tasks: Task[];
  auditRecords: AuditRecord[];
}

type Tab = "overview" | "requirements" | "tasks" | "audit";

const EVENT_ICONS: Record<string, string> = {
  CaseCreated: "📋",
  RequirementsCalculated: "📐",
  EvidenceReceived: "📎",
  EvidenceRejected: "❌",
  ExceptionRaised: "⚠️",
  TaskAssigned: "👤",
  DecisionRecommended: "💡",
  DecisionConfirmed: "✅",
  CaseClosed: "🔒",
  CaseReopened: "🔓",
  StatusChanged: "🔄",
};

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [actor] = useState("担当者");

  const [showAddRequirement, setShowAddRequirement] = useState(false);
  const [showAddEvidence, setShowAddEvidence] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);

  const fetchCase = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`);
    if (!res.ok) {
      router.push("/");
      return;
    }
    const data = await res.json();
    setCaseData(data);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const transition = async (newStatus: string) => {
    const res = await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "transition", newStatus, actor }),
    });
    if (res.ok) {
      const data = await res.json();
      setCaseData(data);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, actor }),
    });
    fetchCase();
  };

  const updateRequirementStatus = async (reqId: string, status: string) => {
    const res = await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateRequirementStatus",
        requirementId: reqId,
        status,
        actor,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setCaseData(data);
    }
  };

  const updateEvidenceStatus = async (evidenceId: string, status: string) => {
    const res = await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateEvidenceStatus",
        evidenceId,
        status,
        actor,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setCaseData(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caseData) return null;

  const nextStatuses = NEXT_STATUS_MAP[caseData.status] || [];
  const requirementsMet = caseData.requirements.filter(
    (r) => r.status === "MET"
  ).length;

  const getStatusTransitionLabel = (s: string) => {
    const labels: Record<string, string> = {
      INTAKE_VALIDATED: "受付確認",
      WAITING_FOR_EVIDENCE: "証拠収集へ",
      IN_REVIEW: "審査開始",
      EXCEPTION: "例外として管理",
      APPROVED: "承認する",
      REJECTED: "却下する",
      CLOSED: "完了にする",
      REOPENED: "再審査する",
    };
    return labels[s] || CASE_STATUS_LABELS[s];
  };

  const getStatusTransitionColor = (s: string) => {
    if (s === "APPROVED") return "bg-green-600 hover:bg-green-700 text-white";
    if (s === "REJECTED") return "bg-red-600 hover:bg-red-700 text-white";
    if (s === "EXCEPTION")
      return "bg-orange-500 hover:bg-orange-600 text-white";
    return "bg-blue-600 hover:bg-blue-700 text-white";
  };

  return (
    <div>
      <div className="mb-4">
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
          案件一覧
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${CASE_STATUS_COLORS[caseData.status]}`}
              >
                {CASE_STATUS_LABELS[caseData.status]}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[caseData.priority]}`}
              >
                優先度: {PRIORITY_LABELS[caseData.priority]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {caseData.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {caseData.contractType} | 相手先:{" "}
              <strong>{caseData.counterparty}</strong> | 担当:{" "}
              <strong>{caseData.businessOwner}</strong>
            </p>
          </div>

          {nextStatuses.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => transition(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getStatusTransitionColor(s)}`}
                >
                  {getStatusTransitionLabel(s)}
                </button>
              ))}
            </div>
          )}
        </div>

        {caseData.description && (
          <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {caseData.description}
          </p>
        )}

        {caseData.requirements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-gray-600">
                必要条件の充足状況 ({requirementsMet}/
                {caseData.requirements.length})
              </span>
              <span
                className={
                  requirementsMet === caseData.requirements.length
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {Math.round(
                  (requirementsMet / caseData.requirements.length) * 100
                )}
                %
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  requirementsMet === caseData.requirements.length
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                style={{
                  width: `${(requirementsMet / caseData.requirements.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {(
          [
            { key: "overview", label: "概要" },
            {
              key: "requirements",
              label: `必要条件 (${caseData.requirements.length})`,
            },
            { key: "tasks", label: `タスク (${caseData.tasks.length})` },
            { key: "audit", label: "監査証跡" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid sm:grid-cols-2 gap-6">
          <InfoCard label="契約種別" value={caseData.contractType} />
          <InfoCard label="相手先" value={caseData.counterparty} />
          <InfoCard label="事業部担当者" value={caseData.businessOwner} />
          <InfoCard label="優先度" value={PRIORITY_LABELS[caseData.priority]} />
          <InfoCard
            label="起票日"
            value={new Date(caseData.createdAt).toLocaleDateString("ja-JP")}
          />
          <InfoCard
            label="最終更新"
            value={new Date(caseData.updatedAt).toLocaleDateString("ja-JP")}
          />
          {caseData.description && (
            <div className="sm:col-span-2">
              <InfoCard label="案件説明" value={caseData.description} />
            </div>
          )}
        </div>
      )}

      {activeTab === "requirements" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">必要条件・証拠管理</h2>
            <button
              onClick={() => setShowAddRequirement(true)}
              className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium"
            >
              ＋ 必要条件を追加
            </button>
          </div>

          {caseData.requirements.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
              必要条件がまだ登録されていません
            </div>
          ) : (
            caseData.requirements.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${REQUIREMENT_STATUS_COLORS[req.status]}`}
                      >
                        {REQUIREMENT_STATUS_LABELS[req.status]}
                      </span>
                      {req.dueDate && (
                        <span className="text-xs text-gray-500">
                          期限:{" "}
                          {new Date(req.dueDate).toLocaleDateString("ja-JP")}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{req.name}</h3>
                    {req.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {req.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={req.status}
                      onChange={(e) =>
                        updateRequirementStatus(req.id, e.target.value)
                      }
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="PENDING">未対応</option>
                      <option value="MET">充足</option>
                      <option value="NOT_MET">不足</option>
                      <option value="EXPIRED">期限切れ</option>
                    </select>
                    <button
                      onClick={() => setShowAddEvidence(req.id)}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100"
                    >
                      ＋ 証拠
                    </button>
                  </div>
                </div>

                {req.evidences.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-medium text-gray-500">
                      提出済み証拠:
                    </p>
                    {req.evidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-400">📎</span>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-800 truncate block">
                              {ev.name}
                            </span>
                            {ev.notes && (
                              <span className="text-xs text-gray-500 truncate block">
                                {ev.notes}
                              </span>
                            )}
                          </div>
                        </div>
                        <select
                          value={ev.status}
                          onChange={(e) =>
                            updateEvidenceStatus(ev.id, e.target.value)
                          }
                          className={`text-xs border rounded px-2 py-0.5 focus:outline-none ml-2 shrink-0 ${EVIDENCE_STATUS_COLORS[ev.status]}`}
                        >
                          <option value="PENDING">未提出</option>
                          <option value="SUBMITTED">提出済</option>
                          <option value="VERIFIED">確認済</option>
                          <option value="REJECTED">却下</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">タスク管理</h2>
            <button
              onClick={() => setShowAddTask(true)}
              className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium"
            >
              ＋ タスクを追加
            </button>
          </div>

          {caseData.tasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
              タスクがまだ登録されていません
            </div>
          ) : (
            caseData.tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status]}`}
                      >
                        {TASK_STATUS_LABELS[task.status]}
                      </span>
                      {task.dueDate && (
                        <span
                          className={`text-xs ${task.status === "OVERDUE" ? "text-red-600 font-medium" : "text-gray-500"}`}
                        >
                          期限:{" "}
                          {new Date(task.dueDate).toLocaleDateString("ja-JP")}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {task.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      担当: {task.owner}
                    </p>
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none shrink-0"
                  >
                    <option value="TODO">未着手</option>
                    <option value="IN_PROGRESS">対応中</option>
                    <option value="DONE">完了</option>
                    <option value="OVERDUE">期限超過</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">監査証跡</h2>
          {caseData.auditRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              監査記録がありません
            </div>
          ) : (
            <div className="space-y-3">
              {caseData.auditRecords.map((record, idx) => (
                <div key={record.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 flex items-center justify-center text-lg bg-gray-50 rounded-full border border-gray-200">
                      {EVENT_ICONS[record.eventType] || "📝"}
                    </div>
                    {idx < caseData.auditRecords.length - 1 && (
                      <div className="w-px h-full bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {record.eventType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(record.createdAt).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1">
                      {record.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      実行者: {record.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddRequirement && (
        <AddRequirementModal
          caseId={id}
          actor={actor}
          onClose={() => setShowAddRequirement(false)}
          onSuccess={(data) => {
            setCaseData(data);
            setShowAddRequirement(false);
          }}
        />
      )}

      {showAddEvidence && (
        <AddEvidenceModal
          caseId={id}
          requirementId={showAddEvidence}
          actor={actor}
          onClose={() => setShowAddEvidence(null)}
          onSuccess={(data) => {
            setCaseData(data);
            setShowAddEvidence(null);
          }}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          caseId={id}
          onClose={() => setShowAddTask(false)}
          onSuccess={() => {
            setShowAddTask(false);
            fetchCase();
          }}
        />
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

function AddRequirementModal({
  caseId,
  actor,
  onClose,
  onSuccess,
}: {
  caseId: string;
  actor: string;
  onClose: () => void;
  onSuccess: (data: CaseDetail) => void;
}) {
  const [form, setForm] = useState({ name: "", description: "", dueDate: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addRequirement", ...form, actor }),
    });
    if (res.ok) {
      const data = await res.json();
      onSuccess(data);
    }
    setLoading(false);
  };

  return (
    <Modal title="必要条件を追加" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            条件名 <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            期限
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddEvidenceModal({
  caseId,
  requirementId,
  actor,
  onClose,
  onSuccess,
}: {
  caseId: string;
  requirementId: string;
  actor: string;
  onClose: () => void;
  onSuccess: (data: CaseDetail) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    notes: "",
    status: "SUBMITTED",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addEvidence",
        requirementId,
        ...form,
        actor,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      onSuccess(data);
    }
    setLoading(false);
  };

  return (
    <Modal title="証拠を追加" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            証拠名 <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="例: 法務レビューシート_v1.pdf"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SUBMITTED">提出済</option>
            <option value="VERIFIED">確認済</option>
            <option value="REJECTED">却下</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddTaskModal({
  caseId,
  onClose,
  onSuccess,
}: {
  caseId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    owner: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, ...form }),
    });
    if (res.ok) {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Modal title="タスクを追加" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タスク名 <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            担当者 <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            期限
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
