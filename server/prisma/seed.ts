import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 既存のダミーデータを投入
  const reports = [
    {
      title: "SS事業部向け講演会: 次世代半導体とLSI戦略",
      summary:
        "シリコンカーバイド(SiC)、窒化ガリウム(GaN)などの次世代材料に関する最新の研究開発動向と市場予測を解説します。",
      publishDate: new Date("2025-05-20"),
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      posterUrl: "https://placehold.co/1280x720/111827/ffffff?text=動画1",
      pdfUrl: "dummy_pdf_url_1.pdf",
      speaker: "山田 太郎",
      department: "先端技術研究部",
      agendaItems: {
        create: [
          { content: "半導体業界の最新動向とメガトレンド", order: 0 },
          { content: "次世代半導体材料(SiC, GaN)の可能性と課題", order: 1 },
          { content: "AIチップ設計におけるチップレット技術の重要性", order: 2 },
          { content: "当社のLSI戦略と今後の研究開発ロードマップ", order: 3 },
          { content: "質疑応答", order: 4 },
        ],
      },
    },
    {
      title: "AIチップ市場の競争環境分析",
      summary:
        "NVIDIA, Intel, AMDをはじめとする主要プレイヤーの戦略と、新興企業の動向を詳細に分析。今後の市場シェア変動を予測します。",
      publishDate: new Date("2025-04-15"),
      videoUrl: "dummy_video_url_2.mp4",
      posterUrl: "https://placehold.co/1280x720/111827/ffffff?text=動画2",
      pdfUrl: "dummy_pdf_url_2.pdf",
      speaker: "佐藤 花子",
      department: "市場分析部門",
      agendaItems: {
        create: [
          { content: "主要AIチップメーカーの戦略比較", order: 0 },
          { content: "新興企業の技術的強み", order: 1 },
          { content: "AIチップ市場の将来予測", order: 2 },
        ],
      },
    },
    {
      title: "チップレット技術が切り開く半導体の未来",
      summary:
        "高性能コンピューティングにおけるチップレット技術の採用状況、標準化の動き、および今後の技術的課題について考察します。",
      publishDate: new Date("2025-03-10"),
      videoUrl: "dummy_video_url_3.mp4",
      posterUrl: "https://placehold.co/1280x720/111827/ffffff?text=動画3",
      pdfUrl: "dummy_pdf_url_3.pdf",
      speaker: "鈴木 一郎",
      department: "LSI設計部",
      agendaItems: {
        create: [
          { content: "チップレット技術の概要とメリット", order: 0 },
          { content: "主要企業の採用事例", order: 1 },
          { content: "標準化動向とエコシステム", order: 2 },
          { content: "技術的課題と今後の展望", order: 3 },
        ],
      },
    },
  ];

  for (const report of reports) {
    await prisma.trendReport.create({
      data: report,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
