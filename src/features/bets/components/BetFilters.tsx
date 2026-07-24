import { MARKETS } from "@/shared/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { BetFilters } from "../hooks/useBets";
import { useTipsterList } from "../hooks/useBets";
import { ManageTipstersDialog } from "./ManageTipstersDialog";
import { useTipsterSettingsStore } from "@/store/tipster-settings";

interface Props {
  value: BetFilters;
  onChange: (f: BetFilters) => void;
}

export function BetFiltersBar({ value, onChange }: Props) {
  const { data: tipsters } = useTipsterList();
  const { inactiveTipsters } = useTipsterSettingsStore();
  const activeTipsters = (tipsters ?? []).filter((t) => !inactiveTipsters.includes(t));

  const hasAny = !!(
    value.tipster ||
    (value.market && value.market !== "all") ||
    value.dateRange?.from ||
    (value.result && value.result !== "all")
  );
  return (
    <div className="flex flex-wrap items-end gap-6 py-6">
      <div>
        <label className="mb-3 block text-[10px] uppercase tracking-wider text-muted-foreground">
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
        <label className="mb-3 block text-[10px] uppercase tracking-wider text-muted-foreground">
          Tipster
        </label>
        <div className="flex items-center gap-2">
          <Select
            value={value.tipster ?? "all"}
            onValueChange={(v) => onChange({ ...value, tipster: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {activeTipsters.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ManageTipstersDialog />
        </div>
      </div>
      <div>
        <label className="mb-3 block text-[10px] uppercase tracking-wider text-muted-foreground">
          Rango de Fechas
        </label>
        <DateRangePicker
          className="w-[240px]"
          value={value.dateRange}
          onChange={(d) => onChange({ ...value, dateRange: d })}
        />
      </div>
      <div>
        <label className="mb-3 block text-[10px] uppercase tracking-wider text-muted-foreground">
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
        <Button variant="ghost" size="sm" onClick={() => onChange({})} className="h-9 gap-1">
          <X className="h-3 w-3" /> Limpiar
        </Button>
      )}
    </div>
  );
}
