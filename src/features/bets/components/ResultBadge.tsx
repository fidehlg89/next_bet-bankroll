import { resultClass } from "@/shared/lib/formatters";
import { cn } from "@/lib/utils";

export function ResultBadge({ result }: { result?: string | null }) {
  const label = result ?? "—";
  const isPending = !result;
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-[28px] items-center justify-center rounded-md border px-2 text-xs font-semibold",
        resultClass(result),
      )}
    >
      {isPending ? "•" : label}
    </span>
  );
}