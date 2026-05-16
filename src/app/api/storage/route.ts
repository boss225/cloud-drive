import { NextResponse } from "next/server";
import { getStorageStats } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json(await getStorageStats(user.id));
  } catch (error) {
    console.error("Failed to fetch storage stats", error);

    return NextResponse.json(
      { error: "Failed to fetch storage stats" },
      { status: 500 },
    );
  }
}
