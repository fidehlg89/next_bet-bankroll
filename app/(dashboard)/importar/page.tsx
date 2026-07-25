"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileCode2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ImportarPage() {
  const qc = useQueryClient();
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [html, setHtml] = useState("");

  const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("No autenticado");
    return { Authorization: `Bearer ${token}` };
  };

  const onImportHtml = async () => {
    const text = html.trim();
    if (!text) {
      toast.error("Pega el HTML del historial de 22Bet antes de importar.");
      return;
    }
    if (!/class="cupHisNew/.test(text) || !/Boleto de apuestas\s*№/.test(text)) {
      toast.error(
        "Esto no parece el HTML de 22Bet. Asegúrate de copiar el código fuente (Ctrl+U) de la página del historial.",
      );
      return;
    }
    setHtmlLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch("/api/import/22bet", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      const r = await res.json();
      toast.success(
        `22Bet: ${r.inserted} nuevas · ${r.updated} actualizadas · ${r.skipped} sin cambios (parsed ${r.parsed})`,
      );
      setHtml("");
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error analizando HTML");
    } finally {
      setHtmlLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Importar</h1>
        <p className="text-sm text-muted-foreground">
          Pega el HTML del historial de 22Bet para importar tus apuestas de forma automática.
        </p>
      </div>

      <div className="max-w-xl">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-accent" />
            <h2 className="font-display font-semibold">Importar HTML de 22Bet</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Pega el HTML completo del historial de 22Bet (Ctrl+U → copiar todo). Cada ticket se
            identifica por su nº; reimportar el mismo HTML no duplica nada, y si una apuesta estaba
            pendiente y ya tiene resultado, se actualiza. Tipster = <em>Sin asignar</em>.
          </p>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<html>… historial 22Bet …</html>"
            className="mt-3 h-40 font-mono text-xs"
          />
          <Button
            onClick={onImportHtml}
            disabled={!html.trim() || htmlLoading}
            variant="outline"
            className="mt-3 w-full gap-2"
          >
            {htmlLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCode2 className="h-4 w-4" />
            )}
            {htmlLoading ? "Importando…" : "Importar apuestas del HTML"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
