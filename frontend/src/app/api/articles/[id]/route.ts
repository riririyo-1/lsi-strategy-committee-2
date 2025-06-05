import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_URL_INTERNAL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // paramsをawaitして安全に扱う
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}