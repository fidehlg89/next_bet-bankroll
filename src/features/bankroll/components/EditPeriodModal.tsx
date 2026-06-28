"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateMonthlyPeriod } from "@/features/bankroll/hooks/useMonthlyPeriods";
import { toFirstOfMonth } from "@/features/bankroll/services/monthlyPeriods.service";
import type { MonthlyPeriodEnriched } from "@/features/bankroll/types/period.types";

const schema = z.object({
  period_month: z.string().min(1, "Month is required"),
  opening_balance: z.coerce.number().min(0, "Value cannot be negative"),
  closing_balance: z.coerce
    .number()
    .min(0, "Value cannot be negative")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditPeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: MonthlyPeriodEnriched | null;
}

export function EditPeriodModal({ open, onOpenChange, period }: EditPeriodModalProps) {
  const { mutateAsync: updatePeriod, isPending } = useUpdateMonthlyPeriod();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      period_month: "",
      opening_balance: 0,
      closing_balance: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open && period) {
      form.reset({
        period_month: period.period_month.slice(0, 7), // "YYYY-MM"
        opening_balance: period.opening_balance,
        closing_balance: period.closing_balance ?? "",
        notes: period.notes ?? "",
      });
    }
  }, [open, period, form]);

  const onSubmit = async (values: FormValues) => {
    if (!period) return;
    try {
      await updatePeriod({
        id: period.id,
        period_month: toFirstOfMonth(new Date(`${values.period_month}-02`)), // Parse YYYY-MM safely
        opening_balance: values.opening_balance,
        closing_balance: values.closing_balance === "" ? null : Number(values.closing_balance),
        notes: values.notes,
      });
      onOpenChange(false);
    } catch (err) {
      // Error handled by hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Periodo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="period_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mes</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="opening_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Inicial (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {period?.status === "closed" && (
              <FormField
                control={form.control}
                name="closing_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Final (€)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
