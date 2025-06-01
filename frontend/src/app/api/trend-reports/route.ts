import { NextResponse } from "next/server";
import { ListTrendReports } from "@/features/admin/research/use-cases/ListTrendReports";
import { CreateTrendReport } from "@/features/admin/research/use-cases/CreateTrendReport";

// GET /api/trend-reports
export async function GET() {
  try {
    const useCase = new ListTrendReports();
    const reports = await useCase.execute();
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Failed to fetch trend reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch trend reports" },
      { status: 500 }
    );
  }
}

// POST /api/trend-reports
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const useCase = new CreateTrendReport();
    const report = await useCase.execute(data);
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Failed to create trend report:", error);
    return NextResponse.json(
      { error: "Failed to create trend report" },
      { status: 500 }
    );
  }
}
