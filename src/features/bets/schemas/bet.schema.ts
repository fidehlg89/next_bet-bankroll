import { z } from "zod";
import { MARKETS, BET_TYPES, RESULTS } from "@/shared/lib/constants";

const today = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const betSchema = z.object({
  bet_date: z
    .string()
    .min(1, "La fecha es obligatoria")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha/Hora inválida")
    .refine((v) => new Date(v) <= today(), "La fecha/hora no puede ser futura"),
  event: z.string().trim().max(160, "Máximo 160 caracteres").optional().or(z.literal("")),
  market: z.enum(MARKETS, { message: "Mercado inválido" }),
  pick: z.string().trim().max(160, "Máximo 160 caracteres").optional().or(z.literal("")),
  bet_type: z.enum(BET_TYPES, { message: "Tipo de apuesta inválido" }),
  tipster: z.string().trim().min(1, "El tipster es obligatorio").max(80, "Máximo 80 caracteres"),
  odds: z.coerce
    .number({ message: "La cuota debe ser numérica" })
    .min(0.5, "La cuota debe ser ≥ 0.5")
    .max(1000, "La cuota debe ser ≤ 1000")
    .refine((n) => Number.isFinite(n), "Cuota inválida"),
  stake: z.coerce
    .number({ message: "El stake debe ser numérico" })
    .positive("El stake debe ser > 0")
    .max(1_000_000, "Stake demasiado alto")
    .refine((n) => Number.isFinite(n), "Stake inválido"),
  result: z.enum(RESULTS).optional().or(z.literal("")),
  notes: z.string().trim().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
});

export type BetFormValues = z.infer<typeof betSchema>;
