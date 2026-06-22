import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankrollAdjustmentModal } from "../BankrollAdjustmentModal";

// ── Mocks ──────────────────────────────────────────────────────────────────
const mockCreateTransaction = vi.fn();
const mockUpsertInitial = vi.fn();

vi.mock("@/features/bets/hooks/useBankrollTransactions", () => ({
  useCreateBankrollTransaction: () => ({
    mutateAsync: mockCreateTransaction,
    isPending: false,
  }),
  useUpsertInitialBankroll: () => ({
    mutateAsync: mockUpsertInitial,
    isPending: false,
  }),
}));

// ── Helper ─────────────────────────────────────────────────────────────────
const CURRENT_BANKROLL = 151.68;
const BASE_BANKROLL = 108.64;

function renderModal() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <BankrollAdjustmentModal
        currentBankroll={CURRENT_BANKROLL}
        baseBankroll={BASE_BANKROLL}
      />
    </QueryClientProvider>
  );
}

async function openModal() {
  await userEvent.click(screen.getByRole("button", { name: /ajustar banca/i }));
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe("BankrollAdjustmentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pre-carga los valores actuales al abrir el modal", async () => {
    renderModal();
    await openModal();

    // El input de banca inicial debe mostrar BASE_BANKROLL
    const initialInput = screen.getByLabelText(/banca inicial/i) as HTMLInputElement;
    expect(initialInput.value).toBe(String(BASE_BANKROLL));

    // El input de banca actual debe mostrar CURRENT_BANKROLL
    const currentInput = screen.getByLabelText(/banca actual/i) as HTMLInputElement;
    expect(currentInput.value).toBe(String(CURRENT_BANKROLL));
  });

  it("no llama a ninguna mutación si no se cambia ningún valor", async () => {
    renderModal();
    await openModal();

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockCreateTransaction).not.toHaveBeenCalled();
      expect(mockUpsertInitial).not.toHaveBeenCalled();
    });
  });

  it("crea un DEPOSIT si la banca actual sube", async () => {
    mockCreateTransaction.mockResolvedValue(undefined);
    renderModal();
    await openModal();

    const currentInput = screen.getByLabelText(/banca actual/i);
    await userEvent.clear(currentInput);
    await userEvent.type(currentInput, "160");

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "deposit",
          amount: parseFloat((160 - CURRENT_BANKROLL).toFixed(2)),
        })
      );
    });
  });

  it("crea un WITHDRAWAL si la banca actual baja", async () => {
    mockCreateTransaction.mockResolvedValue(undefined);
    renderModal();
    await openModal();

    const currentInput = screen.getByLabelText(/banca actual/i);
    await userEvent.clear(currentInput);
    await userEvent.type(currentInput, "140");

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "withdrawal",
          amount: parseFloat((CURRENT_BANKROLL - 140).toFixed(2)),
        })
      );
    });
  });

  it("llama a upsertInitial si cambia la banca inicial", async () => {
    mockUpsertInitial.mockResolvedValue(undefined);
    renderModal();
    await openModal();

    const initialInput = screen.getByLabelText(/banca inicial/i);
    await userEvent.clear(initialInput);
    await userEvent.type(initialInput, "120");

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockUpsertInitial).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 120 })
      );
    });
  });

  it("muestra el delta en verde si la banca actual sube", async () => {
    renderModal();
    await openModal();

    const currentInput = screen.getByLabelText(/banca actual/i);
    fireEvent.change(currentInput, { target: { value: "160" } });

    const delta = parseFloat((160 - CURRENT_BANKROLL).toFixed(2));
    const indicator = await screen.findByTestId("delta-indicator");
    expect(indicator).toHaveTextContent(`+${delta.toFixed(2)}`);
  });

  it("muestra el delta en rojo si la banca actual baja", async () => {
    renderModal();
    await openModal();

    const currentInput = screen.getByLabelText(/banca actual/i);
    fireEvent.change(currentInput, { target: { value: "140" } });

    const delta = parseFloat((140 - CURRENT_BANKROLL).toFixed(2));
    const indicator = await screen.findByTestId("delta-indicator");
    expect(indicator).toHaveTextContent(`${delta.toFixed(2)}`);
  });
});
