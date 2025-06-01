import { NextResponse } from "next/server";
import { GetTrendReport } from "@/features/admin/research/use-cases/GetTrendReport";
import { UpdateTrendReport } from "@/features/admin/research/use-cases/UpdateTrendReport";
import { DeleteTrendReport } from "@/features/admin/research/use-cases/DeleteTrendReport";

// GET /api/trend-reports/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const useCase = new GetTrendReport();
    const report = await useCase.execute(params.id);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error(`Failed to fetch trend report ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch trend report" },
      { status: 500 }
    );
  }
}

// PUT /api/trend-reports/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const useCase = new UpdateTrendReport();
    const report = await useCase.execute(params.id, data);

    return NextResponse.json(report);
  } catch (error) {
    console.error(`Failed to update trend report ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update trend report" },
      { status: 500 }
    );
  }
}

// DELETE /api/trend-reports/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const useCase = new DeleteTrendReport();
    await useCase.execute(params.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete trend report ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete trend report" },
      { status: 500 }
    );
  }
}
