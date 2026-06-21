import { MARKETS } from "@/shared/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { BetFilters } from "../hooks/useBets";
import { useTipsterList } from "../hooks/useBets";

interface Props {
  value: BetFilters;
  onChange: (f: BetFilters) => void;
}

export function BetFiltersBar({ value, onChange }: Props) {
  const { data: tipsters } = useTipsterList();
  const hasAny = !!(
    value.tipster ||
    (value.market && value.market !== "all") ||
    value.month ||
    (value.result && value.result !== "all")
  );
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
          Mercado
        </label>
        <Select
          value={value.market ?? "all"}
          onValueChange={(v) => onChange({ ...value, market: v as never })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {MARKETS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
          Tipster
        </label>
        <Select
          value={value.tipster ?? "all"}
          onValueChange={(v) => onChange({ ...value, tipster: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(tipsters ?? []).map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
          Mes
        </label>
        <Input
          type="month"
          className="w-[140px]"
          value={value.month ?? ""}
          onChange={(e) => onChange({ ...value, month: e.target.value || undefined })}
        />
      </div>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
          Resultado
        </label>
        <Select
          value={value.result ?? "all"}
          onValueChange={(v) => onChange({ ...value, result: v as never })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="W">Wins</SelectItem>
            <SelectItem value="L">Losses</SelectItem>
            <SelectItem value="P">Push</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasAny && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})} className="gap-1">
          <X className="h-3 w-3" /> Limpiar
        </Button>
      )}
    </div>
  );
}
