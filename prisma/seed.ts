import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma";
import path from "path";

const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: "file:" + dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean up
  await prisma.auditRecord.deleteMany();
  await prisma.task.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.case.deleteMany();

  // Case 1: IN_REVIEW - SaaS contract
  const case1 = await prisma.case.create({
    data: {
      title: "クラウドSaaS基盤サービス契約",
      contractType: "サービス契約",
      counterparty: "テクノロジー株式会社",
      businessOwner: "山田 太郎",
      description: "基幹業務システムのクラウド移行に伴うSaaSサービス契約。年間ライセンス費用800万円。",
      status: "IN_REVIEW",
      priority: "HIGH",
      requirements: {
        create: [
          {
            name: "法務レビュー完了",
            description: "標準条項からの逸脱事項の確認と承認",
            status: "MET",
            evidences: {
              create: [
                {
                  name: "法務レビューシート_v2.pdf",
                  status: "VERIFIED",
                  notes: "標準条項比較完了。免責条項に軽微な逸脱あり（承認済）",
                },
              ],
            },
          },
          {
            name: "稟議承認",
            description: "800万円以上の契約に必要な部長承認",
            status: "MET",
            evidences: {
              create: [
                {
                  name: "稟議書_承認済.pdf",
                  status: "VERIFIED",
                  notes: "部長承認 2024/03/01",
                },
              ],
            },
          },
          {
            name: "セキュリティ審査",
            description: "情報セキュリティポリシー準拠確認",
            status: "NOT_MET",
            evidences: {
              create: [
                {
                  name: "セキュリティチェックリスト_draft.xlsx",
                  status: "SUBMITTED",
                  notes: "ISMS認証証明書が未提出",
                },
              ],
            },
          },
        ],
      },
      tasks: {
        create: [
          {
            title: "セキュリティ審査書類の追加収集",
            description: "相手先にISMS認証証明書の提出を依頼する",
            owner: "鈴木 花子",
            dueDate: new Date("2024-03-20"),
            status: "IN_PROGRESS",
          },
          {
            title: "最終条件確認ミーティング",
            description: "サービスレベル合意（SLA）の最終確認",
            owner: "山田 太郎",
            dueDate: new Date("2024-03-25"),
            status: "TODO",
          },
        ],
      },
      auditRecords: {
        create: [
          {
            eventType: "CaseCreated",
            description: "案件「クラウドSaaS基盤サービス契約」が起票されました",
            actor: "山田 太郎",
            createdAt: new Date("2024-02-20"),
          },
          {
            eventType: "RequirementsCalculated",
            description: "必要条件が計算されました（3件）",
            actor: "システム",
            createdAt: new Date("2024-02-20"),
          },
          {
            eventType: "EvidenceReceived",
            description: "法務レビューシートが提出されました",
            actor: "法務部",
            createdAt: new Date("2024-02-28"),
          },
          {
            eventType: "TaskAssigned",
            description: "セキュリティ審査書類の追加収集タスクが鈴木 花子に割り当てられました",
            actor: "山田 太郎",
            createdAt: new Date("2024-03-05"),
          },
        ],
      },
    },
  });

  // Case 2: EXCEPTION - NDA contract
  const case2 = await prisma.case.create({
    data: {
      title: "新規取引先NDA締結",
      contractType: "NDA（機密保持契約）",
      counterparty: "グローバル商事株式会社",
      businessOwner: "佐藤 次郎",
      description: "新規事業提携に向けた機密保持契約。相手先が独自条項の挿入を要求している。",
      status: "EXCEPTION",
      priority: "MEDIUM",
      requirements: {
        create: [
          {
            name: "相手先条項レビュー",
            description: "相手先提案の独自NDA条項の法務確認",
            status: "NOT_MET",
            evidences: {
              create: [
                {
                  name: "相手先NDA_draft.docx",
                  status: "SUBMITTED",
                  notes: "第8条（準拠法）が日本法でなく米国法を指定している",
                },
              ],
            },
          },
          {
            name: "事業部長承認",
            description: "標準外条項のため事業部長の特別承認が必要",
            status: "PENDING",
          },
        ],
      },
      tasks: {
        create: [
          {
            title: "準拠法条項の交渉",
            description: "相手先に日本法への変更を要求する。不可の場合はエスカレーション。",
            owner: "佐藤 次郎",
            dueDate: new Date("2024-03-15"),
            status: "OVERDUE",
          },
        ],
      },
      auditRecords: {
        create: [
          {
            eventType: "CaseCreated",
            description: "案件「新規取引先NDA締結」が起票されました",
            actor: "佐藤 次郎",
            createdAt: new Date("2024-02-10"),
          },
          {
            eventType: "ExceptionRaised",
            description: "相手先が独自条項を要求したため例外案件として管理されます",
            actor: "法務部",
            createdAt: new Date("2024-02-15"),
          },
        ],
      },
    },
  });

  // Case 3: WAITING_FOR_EVIDENCE - software license
  const case3 = await prisma.case.create({
    data: {
      title: "開発ツールライセンス更新",
      contractType: "ライセンス契約",
      counterparty: "ソフトウェア開発社",
      businessOwner: "田中 三郎",
      description: "開発チームが使用する開発ツールのライセンス年次更新。前年度比20%値上げの提示を受けている。",
      status: "WAITING_FOR_EVIDENCE",
      priority: "LOW",
      requirements: {
        create: [
          {
            name: "使用実績レポート",
            description: "過去1年間のライセンス使用状況の確認",
            status: "PENDING",
          },
          {
            name: "価格交渉記録",
            description: "値上げ交渉の記録と最終合意金額の確認",
            status: "PENDING",
          },
        ],
      },
      tasks: {
        create: [
          {
            title: "使用実績データ収集",
            description: "IT部門から過去12ヶ月の使用ログを取得する",
            owner: "田中 三郎",
            dueDate: new Date("2024-03-30"),
            status: "TODO",
          },
        ],
      },
      auditRecords: {
        create: [
          {
            eventType: "CaseCreated",
            description: "案件「開発ツールライセンス更新」が起票されました",
            actor: "田中 三郎",
            createdAt: new Date("2024-03-01"),
          },
        ],
      },
    },
  });

  // Case 4: APPROVED - vendor contract
  const case4 = await prisma.case.create({
    data: {
      title: "物流アウトソーシング契約",
      contractType: "業務委託契約",
      counterparty: "ロジスティクス株式会社",
      businessOwner: "伊藤 四郎",
      description: "倉庫・配送業務の外部委託契約。3年間の長期契約。",
      status: "APPROVED",
      priority: "HIGH",
      requirements: {
        create: [
          {
            name: "法務審査",
            description: "長期契約の法務リスク確認",
            status: "MET",
            evidences: {
              create: [{ name: "法務審査報告書.pdf", status: "VERIFIED" }],
            },
          },
          {
            name: "役員承認",
            description: "3年以上の長期契約に必要な役員承認",
            status: "MET",
            evidences: {
              create: [{ name: "取締役会議事録.pdf", status: "VERIFIED" }],
            },
          },
        ],
      },
      tasks: { create: [] },
      auditRecords: {
        create: [
          {
            eventType: "CaseCreated",
            description: "案件「物流アウトソーシング契約」が起票されました",
            actor: "伊藤 四郎",
            createdAt: new Date("2024-01-15"),
          },
          {
            eventType: "DecisionConfirmed",
            description: "案件が承認されました",
            actor: "取締役会",
            createdAt: new Date("2024-02-05"),
          },
        ],
      },
    },
  });

  // Case 5: DRAFT - new partnership
  await prisma.case.create({
    data: {
      title: "戦略的パートナーシップ基本協定",
      contractType: "その他",
      counterparty: "イノベーション株式会社",
      businessOwner: "渡辺 五郎",
      description: "共同研究開発に向けた基本協定の締結。知的財産の帰属条件の調整が必要。",
      status: "DRAFT",
      priority: "MEDIUM",
      requirements: { create: [] },
      tasks: { create: [] },
      auditRecords: {
        create: [
          {
            eventType: "CaseCreated",
            description: "案件「戦略的パートナーシップ基本協定」が起票されました",
            actor: "渡辺 五郎",
            createdAt: new Date("2024-03-05"),
          },
        ],
      },
    },
  });

  console.log(`Seed completed! Created 5 cases.`);
  console.log(`  Case 1: ${case1.id} - ${case1.title}`);
  console.log(`  Case 2: ${case2.id} - ${case2.title}`);
  console.log(`  Case 3: ${case3.id} - ${case3.title}`);
  console.log(`  Case 4: ${case4.id} - ${case4.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
