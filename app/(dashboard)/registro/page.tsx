"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Download } from "lucide-react";
import { BetForm } from "@/features/bets/components/BetForm";
import { BetTable } from "@/features/bets/components/BetTable";
import { BetFiltersBar } from "@/features/bets/components/BetFilters";
import { useBets, type BetFilters } from "@/features/bets/hooks/useBets";
import { fDate } from "@/shared/lib/formatters";

export default function RegistroPage() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<BetFilters>({});
  const { data: bets = [], isLoading } = useBets(filters);

  const exportCsv = () => {
    const head = [
      "Fecha",
      "Evento",
      "Mercado",
      "Pick",
      "Tipo",
      "Tipster",
      "Cuota",
      "Stake",
      "Resultado",
      "P&L",
    ];
    const lines = [head.join(",")];
    bets.forEach((b) => {
      lines.push(
        [
          fDate(b.bet_date),
          JSON.stringify(b.event ?? ""),
          b.market,
          JSON.stringify(b.pick ?? ""),
          b.bet_type,
          b.tipster,
          b.odds,
          b.stake,
          b.result ?? "Pending",
          b.pnl ?? "",
        ].join(","),
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bankrollos-picks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">REGISTRO</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {bets.length} picks · pendientes con borde ámbar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} className="gap-2">
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nuevo Pick
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Nuevo pick</DialogTitle>
              </DialogHeader>
              <BetForm onDone={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <BetFiltersBar value={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
      ) : (
        <BetTable bets={bets} />
      )}
    </div>
  );
}
