import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("user_access")
    .select("has_access")
    .eq("user_id", user.id)
    .maybeSingle<{ has_access: boolean }>();

  if (!data?.has_access) {
    return NextResponse.json({ error: "Payment required" }, { status: 402 });
  }

  const filePath = path.join(process.cwd(), "public", "downloads", env.downloadFileName);

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${env.downloadFileName}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Installer file not found" }, { status: 404 });
  }
}
