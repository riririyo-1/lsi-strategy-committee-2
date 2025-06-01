import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";

/**
 * ファイルアップロード処理のAPIエンドポイント
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルがアップロードされていません" },
        { status: 400 }
      );
    }

    // ファイルの種類を確認
    const fileType = file.type;
    let uploadDir = "";

    if (fileType.startsWith("image/")) {
      uploadDir = "images";
    } else if (fileType.startsWith("video/")) {
      uploadDir = "videos";
    } else if (fileType === "application/pdf") {
      uploadDir = "pdfs";
    } else {
      return NextResponse.json(
        { error: "サポートされていないファイル形式です" },
        { status: 400 }
      );
    }

    // ファイル名を生成（タイムスタンプを含めることで一意性を確保）
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split(".").pop();
    const fileName = `${timestamp}-${originalName}`;

    // 保存先ディレクトリが存在するか確認し、なければ作成
    const publicDir = path.join(process.cwd(), "public");
    const uploadPath = path.join(publicDir, uploadDir);

    try {
      await mkdir(uploadPath, { recursive: true });
    } catch (err) {
      console.error("ディレクトリ作成エラー:", err);
    }

    // ファイルパスを生成
    const filePath = path.join(uploadPath, fileName);

    // ファイルをバッファに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ファイルを書き込み
    await writeFile(filePath, buffer);

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      url: `/${uploadDir}/${fileName}`,
    });
  } catch (error) {
    console.error("ファイルアップロードエラー:", error);
    return NextResponse.json(
      { error: "ファイルのアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
