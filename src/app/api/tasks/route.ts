import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { caseId, title, description, owner, dueDate } = body;

  if (!caseId || !title || !owner) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      caseId,
      title,
      description: description || null,
      owner,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "TODO",
    },
  });

  await prisma.auditRecord.create({
    data: {
      caseId,
      eventType: "TaskAssigned",
      description: `タスク「${title}」が${owner}に割り当てられました`,
      actor: owner,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
