import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, actor } = body;

  const task = await prisma.task.update({
    where: { id },
    data: { status },
  });

  await prisma.auditRecord.create({
    data: {
      caseId: task.caseId,
      eventType: "TaskAssigned",
      description: `タスク「${task.title}」のステータスが「${status}」に更新されました`,
      actor: actor || "担当者",
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
