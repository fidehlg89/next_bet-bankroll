import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { syncGoogleSheet } from "@/lib/sheet-import.functions";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await syncGoogleSheet(user.id, supabase);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Sheet import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
