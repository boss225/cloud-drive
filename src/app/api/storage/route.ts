import { NextResponse } from "next/server";
import { getStorageStats } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json(await getStorageStats());
  } catch (error) {
    console.error("Failed to fetch storage stats", error);

    return NextResponse.json(
      { error: "Failed to fetch storage stats" },
      { status: 500 },
    );
  }
}
