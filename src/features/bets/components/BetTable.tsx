import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BetForm } from "./BetForm";
import { fDate, fDateTime, fEUR, fOdds, pnlClass } from "@/shared/lib/formatters";
import { ResultBadge } from "./ResultBadge";
import { useDeleteBet, useSettleBet, useUpdateBetTipster } from "../hooks/useBetMutations";
import { useTipsterList } from "../hooks/useBets";
import type { Bet, BetResult } from "../types/bet.types";
import { Pencil, Trash2, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTipsterSettingsStore } from "@/store/tipster-settings";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";

export function BetTable({ bets }: { bets: Bet[] }) {
  const settle = useSettleBet();
  const del = useDeleteBet();
  const updateTipster = useUpdateBetTipster();
  const { data: tipsters } = useTipsterList();
  const { inactiveTipsters } = useTipsterSettingsStore();
  const [flashId, setFlashId] = useState<string | null>(null);
  const [editBet, setEditBet] = useState<Bet | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(bets.length / itemsPerPage);
  const paginatedBets = bets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (!bets.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Sin picks todavía. Pulsa <span className="text-foreground">Nuevo Pick</span> para empezar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10">#</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Mercado</TableHead>
            <TableHead>Pick</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Tipster</TableHead>
            <TableHead className="text-right">Cuota</TableHead>
            <TableHead className="text-right">Stake</TableHead>
            <TableHead className="text-center">W/L/P</TableHead>
            <TableHead className="text-right">P&amp;L</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBets.map((b, i) => {
            const isPending = b.result === null;
            const globalIndex = (page - 1) * itemsPerPage + i + 1;
            return (
              <TableRow
                key={b.id}
                className={cn(
                  "border-border transition-colors",
                  isPending && "border-l-2 border-l-amber-500/60",
                  flashId === b.id && "row-settle-flash",
                )}
              >
                <TableCell className="text-muted-foreground font-mono-num">{globalIndex}</TableCell>
                <TableCell className="font-mono-num text-xs">{fDateTime(b.bet_date)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{b.event ?? "—"}</TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{b.market}</span>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">{b.pick ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.bet_type}</TableCell>
                <TableCell className="text-sm">
                  <Select
                    value={b.tipster}
                    onValueChange={(v) => {
                      if (!v || v === b.tipster) return;
                      updateTipster.mutate({ id: b.id, tipster: v });
                    }}
                  >
                    <SelectTrigger className="h-8 w-[130px] border-none bg-transparent p-0 text-sm hover:text-foreground [&>span]:truncate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set([...(tipsters ?? []), b.tipster]))
                        .filter(Boolean)
                        .filter((t) => !inactiveTipsters.includes(t) || t === b.tipster)
                        .map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right font-mono-num">{fOdds(b.odds)}</TableCell>
                <TableCell className="text-right font-mono-num">{fEUR(b.stake)}</TableCell>
                <TableCell className="text-center">
                  <Select
                    value={b.result ?? ""}
                    onValueChange={(v) => {
                      if (!v) return;
                      setFlashId(b.id);
                      settle.mutate({
                        id: b.id,
                        result: v as BetResult,
                        odds: b.odds,
                        stake: b.stake,
                      });
                      setTimeout(() => setFlashId(null), 600);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] mx-auto border-none bg-transparent p-0 [&>span]:flex [&>span]:justify-center">
                      <SelectValue placeholder={<ResultBadge />}>
                        <ResultBadge result={b.result ?? undefined} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="W">Win</SelectItem>
                      <SelectItem value="L">Loss</SelectItem>
                      <SelectItem value="P">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className={cn("text-right font-mono-num font-medium", pnlClass(b.pnl))}>
                  {b.pnl === null ? "—" : fEUR(Number(b.pnl))}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditBet(b)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-neg"
                      onClick={() => {
                        if (confirm("¿Eliminar este pick?")) del.mutate(b.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Mostrar</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => {
                setItemsPerPage(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>por página</span>
          </div>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(1);
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm text-muted-foreground mx-4">
                  Página {page} de {totalPages || 1}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={
                    page === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(totalPages);
                  }}
                  className={
                    page === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : ""
                  }
                >
                  <ChevronsRight className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      <Dialog open={!!editBet} onOpenChange={(o) => !o && setEditBet(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Editar pick</DialogTitle>
          </DialogHeader>
          {editBet && <BetForm bet={editBet} onDone={() => setEditBet(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
