import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { counterparty: { contains: search } },
      { businessOwner: { contains: search } },
    ];
  }

  const cases = await prisma.case.findMany({
    where,
    include: {
      requirements: {
        include: { evidences: true },
      },
      tasks: true,
      _count: { select: { auditRecords: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(cases);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, contractType, counterparty, businessOwner, description, priority } = body;

  if (!title || !contractType || !counterparty || !businessOwner) {
    return NextResponse.json(
      { error: "必須項目が不足しています" },
      { status: 400 }
    );
  }

  const newCase = await prisma.case.create({
    data: {
      title,
      contractType,
      counterparty,
      businessOwner,
      description: description || null,
      priority: priority || "MEDIUM",
      status: "DRAFT",
      auditRecords: {
        create: {
          eventType: "CaseCreated",
          description: `案件「${title}」が起票されました`,
          actor: businessOwner,
        },
      },
    },
    include: {
      requirements: true,
      tasks: true,
      auditRecords: true,
    },
  });

  return NextResponse.json(newCase, { status: 201 });
}
