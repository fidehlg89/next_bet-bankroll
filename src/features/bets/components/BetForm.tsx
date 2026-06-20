import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { betSchema, type BetFormValues } from "../schemas/bet.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateBet, useUpdateBet } from "../hooks/useBetMutations";
import { MARKETS, BET_TYPES, RESULTS } from "@/shared/lib/constants";
import { useTipsterList } from "../hooks/useBets";
import type { Bet } from "../types/bet.types";

interface Props { onDone: () => void; bet?: Bet }

export function BetForm({ onDone, bet }: Props) {
  const { data: tipsters } = useTipsterList();
  const create = useCreateBet();
  const update = useUpdateBet();
  const today = new Date().toISOString().slice(0, 10);
  const isEdit = !!bet;

  const form = useForm<BetFormValues>({
    resolver: zodResolver(betSchema),
    defaultValues: bet
      ? {
          bet_date: bet.bet_date,
          event: bet.event ?? "",
          market: bet.market,
          pick: bet.pick ?? "",
          bet_type: bet.bet_type,
          tipster: bet.tipster,
          odds: bet.odds,
          stake: bet.stake,
          result: bet.result ?? "",
          notes: bet.notes ?? "",
        }
      : {
          bet_date: today, event: "", market: "Football", pick: "",
          bet_type: "Simple", tipster: "", odds: 2 as unknown as number,
          stake: 1 as unknown as number, result: "", notes: "",
        },
  });

  const currentTipster = form.watch("tipster");
  const knownTipsters = tipsters ?? [];
  const [addingNew, setAddingNew] = useState(
    isEdit ? !knownTipsters.includes(bet!.tipster) : knownTipsters.length === 0,
  );

  const onSubmit = form.handleSubmit(async (vals) => {
    const clean = { ...vals, result: (vals.result as string) === "pending-_" ? "" as const : vals.result };
    if (isEdit && bet) {
      await update.mutateAsync({ id: bet.id, values: clean });
    } else {
      await create.mutateAsync(clean);
    }
    onDone();
  }, () => {
    // surface a toast when there are validation errors so it's obvious
    // even if the user doesn't see the inline messages
  });

  const pending = isEdit ? update.isPending : create.isPending;
  const errors = form.formState.errors;
  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {errorCount > 0 && (
        <div
          role="alert"
          className="md:col-span-2 rounded-md border border-neg/40 bg-neg/10 px-3 py-2 text-xs text-neg"
        >
          Revisa los campos marcados ({errorCount} {errorCount === 1 ? "error" : "errores"}).
        </div>
      )}
      <Field label="Fecha" error={form.formState.errors.bet_date?.message}>
        <Input type="date" {...form.register("bet_date")} />
      </Field>
      <Field label="Tipster *" error={form.formState.errors.tipster?.message}>
        {addingNew || knownTipsters.length === 0 ? (
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del tipster"
              maxLength={80}
              autoFocus={addingNew && knownTipsters.length > 0}
              {...form.register("tipster")}
            />
            {knownTipsters.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddingNew(false);
                  form.setValue("tipster", knownTipsters[0] ?? "", { shouldValidate: true });
                }}
              >
                Existente
              </Button>
            )}
          </div>
        ) : (
          <Select
            value={knownTipsters.includes(currentTipster) ? currentTipster : ""}
            onValueChange={(v) => {
              if (v === "__new__") {
                setAddingNew(true);
                form.setValue("tipster", "", { shouldValidate: false });
              } else {
                form.setValue("tipster", v, { shouldValidate: true });
              }
            }}
          >
            <SelectTrigger><SelectValue placeholder="Selecciona tipster" /></SelectTrigger>
            <SelectContent>
              {knownTipsters.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              <SelectItem value="__new__">+ Nuevo tipster…</SelectItem>
            </SelectContent>
          </Select>
        )}
      </Field>
      <Field label="Mercado" error={form.formState.errors.market?.message}>
        <Select defaultValue={bet?.market ?? "Football"} onValueChange={(v) => form.setValue("market", v as never)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{MARKETS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Tipo" error={form.formState.errors.bet_type?.message}>
        <Select defaultValue={bet?.bet_type ?? "Simple"} onValueChange={(v) => form.setValue("bet_type", v as never)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{BET_TYPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Evento" className="md:col-span-2" error={form.formState.errors.event?.message}>
        <Input placeholder="Real Madrid vs Barcelona" maxLength={160} {...form.register("event")} />
      </Field>
      <Field label="Pick / Selección" className="md:col-span-2" error={form.formState.errors.pick?.message}>
        <Input placeholder="Over 2.5 goles" maxLength={160} {...form.register("pick")} />
      </Field>
      <Field label="Cuota *" error={form.formState.errors.odds?.message}>
        <Input type="number" step="0.001" {...form.register("odds")} className="font-mono-num" />
      </Field>
      <Field label="Stake (€) *" error={form.formState.errors.stake?.message}>
        <Input type="number" step="0.01" {...form.register("stake")} className="font-mono-num" />
      </Field>
      <Field label="Resultado" error={form.formState.errors.result?.message}>
        <Select defaultValue={bet?.result ?? "pending-_"} onValueChange={(v) => form.setValue("result", v as never)}>
          <SelectTrigger><SelectValue placeholder="Pendiente" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending-_">Pendiente</SelectItem>
            {RESULTS.map((r) => <SelectItem key={r} value={r}>{r === "W" ? "Win" : r === "L" ? "Loss" : "Push"}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Notas" className="md:col-span-2" error={form.formState.errors.notes?.message}>
        <Textarea rows={2} maxLength={500} {...form.register("notes")} />
      </Field>
      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : isEdit ? "Actualizar pick" : "Guardar pick"}</Button>
      </div>
    </form>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-neg">{error}</p>}
    </div>
  );
}