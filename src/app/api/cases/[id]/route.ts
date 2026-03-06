import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NEXT_STATUS_MAP } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      requirements: {
        include: { evidences: true },
        orderBy: { createdAt: "asc" },
      },
      tasks: { orderBy: { createdAt: "asc" } },
      auditRecords: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!caseData) {
    return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(caseData);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, actor, ...data } = body;

  const existing = await prisma.case.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
  }

  if (action === "transition") {
    const { newStatus } = data;
    const allowed = NEXT_STATUS_MAP[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `${existing.status} から ${newStatus} への遷移は許可されていません` },
        { status: 400 }
      );
    }

    const updated = await prisma.case.update({
      where: { id },
      data: {
        status: newStatus,
        auditRecords: {
          create: {
            eventType: getEventType(newStatus),
            description: `ステータスが「${existing.status}」から「${newStatus}」に変更されました`,
            actor: actor || "システム",
          },
        },
      },
      include: {
        requirements: { include: { evidences: true } },
        tasks: true,
        auditRecords: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json(updated);
  }

  if (action === "addRequirement") {
    const { name, description, dueDate } = data;
    const updated = await prisma.case.update({
      where: { id },
      data: {
        requirements: {
          create: {
            name,
            description: description || null,
            dueDate: dueDate ? new Date(dueDate) : null,
          },
        },
        auditRecords: {
          create: {
            eventType: "RequirementsCalculated",
            description: `必要条件「${name}」が追加されました`,
            actor: actor || "担当者",
          },
        },
      },
      include: {
        requirements: { include: { evidences: true } },
        tasks: true,
        auditRecords: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json(updated);
  }

  if (action === "addEvidence") {
    const { requirementId, name, notes, status: evidenceStatus } = data;
    const evidence = await prisma.evidence.create({
      data: {
        requirementId,
        name,
        notes: notes || null,
        status: evidenceStatus || "SUBMITTED",
      },
    });

    const reqId = requirementId;
    const req = await prisma.requirement.findUnique({ where: { id: reqId } });
    if (req) {
      const allEvidence = await prisma.evidence.findMany({
        where: { requirementId: reqId },
      });
      const verified = allEvidence.every((e) => e.status === "VERIFIED");
      if (verified && allEvidence.length > 0) {
        await prisma.requirement.update({
          where: { id: reqId },
          data: { status: "MET" },
        });
      }
    }

    await prisma.auditRecord.create({
      data: {
        caseId: id,
        eventType: "EvidenceReceived",
        description: `証拠「${name}」が提出されました`,
        actor: actor || "担当者",
      },
    });

    const updated = await prisma.case.findUnique({
      where: { id },
      include: {
        requirements: { include: { evidences: true } },
        tasks: true,
        auditRecords: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json({ ...updated, newEvidence: evidence });
  }

  if (action === "updateRequirementStatus") {
    const { requirementId, status: reqStatus } = data;
    await prisma.requirement.update({
      where: { id: requirementId },
      data: { status: reqStatus },
    });
    await prisma.auditRecord.create({
      data: {
        caseId: id,
        eventType: "EvidenceReceived",
        description: `必要条件のステータスが「${reqStatus}」に更新されました`,
        actor: actor || "担当者",
      },
    });
    const updated = await prisma.case.findUnique({
      where: { id },
      include: {
        requirements: { include: { evidences: true } },
        tasks: true,
        auditRecords: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json(updated);
  }

  if (action === "updateEvidenceStatus") {
    const { evidenceId, status: evStatus } = data;
    await prisma.evidence.update({
      where: { id: evidenceId },
      data: { status: evStatus },
    });
    await prisma.auditRecord.create({
      data: {
        caseId: id,
        eventType: evStatus === "VERIFIED" ? "EvidenceReceived" : "EvidenceRejected",
        description: `証拠のステータスが「${evStatus}」に更新されました`,
        actor: actor || "担当者",
      },
    });
    const updated = await prisma.case.findUnique({
      where: { id },
      include: {
        requirements: { include: { evidences: true } },
        tasks: true,
        auditRecords: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json(updated);
  }

  // General update
  const updated = await prisma.case.update({
    where: { id },
    data,
    include: {
      requirements: { include: { evidences: true } },
      tasks: true,
      auditRecords: { orderBy: { createdAt: "desc" } },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.case.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

function getEventType(status: string): string {
  const map: Record<string, string> = {
    APPROVED: "DecisionConfirmed",
    REJECTED: "DecisionConfirmed",
    EXCEPTION: "ExceptionRaised",
    CLOSED: "CaseClosed",
    REOPENED: "CaseReopened",
    IN_REVIEW: "TaskAssigned",
    WAITING_FOR_EVIDENCE: "RequirementsCalculated",
  };
  return map[status] || "StatusChanged";
}
