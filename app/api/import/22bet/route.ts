import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { import22BetHistory } from "@/lib/html-22bet-import.functions";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.html) {
      return NextResponse.json({ error: "HTML requerido" }, { status: 400 });
    }

    const result = await import22BetHistory(body.html, user.id, supabase);
    return NextResponse.json(result);
  } catch (error) {
    console.error("22Bet import error:", error);
    const errorMessage = error instanceof Error ? error.message : String((error as any)?.message || error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
