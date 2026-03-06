export const CASE_STATUS = {
  DRAFT: "DRAFT",
  INTAKE_VALIDATED: "INTAKE_VALIDATED",
  WAITING_FOR_EVIDENCE: "WAITING_FOR_EVIDENCE",
  IN_REVIEW: "IN_REVIEW",
  EXCEPTION: "EXCEPTION",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
  REOPENED: "REOPENED",
} as const;

export const CASE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "下書き",
  INTAKE_VALIDATED: "受付確認済",
  WAITING_FOR_EVIDENCE: "証拠収集中",
  IN_REVIEW: "審査中",
  EXCEPTION: "例外対応中",
  APPROVED: "承認済",
  REJECTED: "却下",
  CLOSED: "完了",
  REOPENED: "再審査",
};

export const CASE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  INTAKE_VALIDATED: "bg-blue-100 text-blue-700",
  WAITING_FOR_EVIDENCE: "bg-yellow-100 text-yellow-700",
  IN_REVIEW: "bg-purple-100 text-purple-700",
  EXCEPTION: "bg-red-100 text-red-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-200 text-red-800",
  CLOSED: "bg-gray-200 text-gray-600",
  REOPENED: "bg-orange-100 text-orange-700",
};

export const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

export const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

export const CONTRACT_TYPES = [
  "売買契約",
  "サービス契約",
  "業務委託契約",
  "NDA（機密保持契約）",
  "ライセンス契約",
  "賃貸借契約",
  "雇用契約",
  "その他",
];

export const REQUIREMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "未対応",
  MET: "充足",
  NOT_MET: "不足",
  EXPIRED: "期限切れ",
};

export const REQUIREMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  MET: "bg-green-100 text-green-700",
  NOT_MET: "bg-red-100 text-red-700",
  EXPIRED: "bg-orange-100 text-orange-700",
};

export const EVIDENCE_STATUS_LABELS: Record<string, string> = {
  PENDING: "未提出",
  SUBMITTED: "提出済",
  VERIFIED: "確認済",
  REJECTED: "却下",
};

export const EVIDENCE_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "対応中",
  DONE: "完了",
  OVERDUE: "期限超過",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export const NEXT_STATUS_MAP: Record<string, string[]> = {
  DRAFT: ["INTAKE_VALIDATED"],
  INTAKE_VALIDATED: ["WAITING_FOR_EVIDENCE"],
  WAITING_FOR_EVIDENCE: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED", "EXCEPTION"],
  EXCEPTION: ["IN_REVIEW", "WAITING_FOR_EVIDENCE"],
  APPROVED: ["CLOSED"],
  REJECTED: ["CLOSED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["IN_REVIEW"],
};
