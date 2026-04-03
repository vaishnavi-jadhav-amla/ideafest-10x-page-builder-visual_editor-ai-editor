import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "Invalid file parameter" }, { status: 400 });
    }

    const fullFilePath = path.resolve(__dirname, "../../../../../../public/quick-order-template/", filePath);

    if (!fs.existsSync(fullFilePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const data = fs.readFileSync(fullFilePath);

    return new NextResponse(data, {
      headers: {
        "Content-Disposition": `attachment; filename=${path.basename(fullFilePath)}`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error reading file" }, { status: 500 });
  }
}
