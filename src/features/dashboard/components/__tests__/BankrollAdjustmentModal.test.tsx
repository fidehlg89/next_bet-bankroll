import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankrollAdjustmentModal } from "../BankrollAdjustmentModal";

// ── Mocks ──────────────────────────────────────────────────────────────────
const mockSetBankroll = vi.fn();
const mockUpsertInitialBankroll = vi.fn();

vi.mock("@/features/bets/hooks/useBankrollTransactions", () => ({
  useSetBankroll: () => ({
    mutateAsync: mockSetBankroll,
    isPending: false,
  }),
  useUpsertInitialBankroll: () => ({
    mutateAsync: mockUpsertInitialBankroll,
    isPending: false,
  }),
}));

// ── Helper ─────────────────────────────────────────────────────────────────
const CURRENT_BANKROLL = 151.68;
const INITIAL_BANKROLL = 100.00;

function renderModal() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <BankrollAdjustmentModal 
        currentBankroll={CURRENT_BANKROLL} 
        initialBankroll={INITIAL_BANKROLL} 
      />
    </QueryClientProvider>,
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

    const initialInput = screen.getByLabelText(/banca inicial/i) as HTMLInputElement;
    expect(initialInput.value).toBe(String(INITIAL_BANKROLL));

    const currentInput = screen.getByLabelText(/banca actual/i) as HTMLInputElement;
    expect(currentInput.value).toBe(String(CURRENT_BANKROLL));
  });

  it("no llama a ninguna mutación si no se cambia ningún valor", async () => {
    renderModal();
    await openModal();

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    expect(mockSetBankroll).not.toHaveBeenCalled();
    expect(mockUpsertInitialBankroll).not.toHaveBeenCalled();
  });

  it("calcula correctamente el delta positivo (depósito) y llama a setBankroll", async () => {
    renderModal();
    await openModal();

    const currentInput = screen.getByLabelText(/banca actual/i);
    await userEvent.clear(currentInput);
    await userEvent.type(currentInput, "200");

    const deltaIndicator = await screen.findByTestId("delta-indicator");
    expect(deltaIndicator).toHaveTextContent("+48.32 €");

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockSetBankroll).toHaveBeenCalledWith(
        expect.objectContaining({
          delta: 48.32,
        }),
      );
    });
    expect(mockUpsertInitialBankroll).not.toHaveBeenCalled();
  });

  it("calcula correctamente el delta negativo (retiro) y llama a setBankroll", async () => {
    renderModal();
    await openModal();

    const currentInput = screen.getByLabelText(/banca actual/i);
    await userEvent.clear(currentInput);
    await userEvent.type(currentInput, "100");

    const deltaIndicator = await screen.findByTestId("delta-indicator");
    expect(deltaIndicator).toHaveTextContent("-51.68 €");

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockSetBankroll).toHaveBeenCalledWith(
        expect.objectContaining({
          delta: -51.68,
        }),
      );
    });
    expect(mockUpsertInitialBankroll).not.toHaveBeenCalled();
  });

  it("cambiar la banca inicial auto-actualiza la banca actual y no hace setBankroll si no hay delta extra", async () => {
    renderModal();
    await openModal();

    const initialInput = screen.getByLabelText(/banca inicial/i);
    await userEvent.clear(initialInput);
    await userEvent.type(initialInput, "120"); // +20

    // La banca actual debería haber subido de 151.68 a 171.68
    const currentInput = screen.getByLabelText(/banca actual/i) as HTMLInputElement;
    expect(currentInput.value).toBe("171.68");

    // No debe haber delta indicador de ajuste extra
    expect(screen.queryByTestId("delta-indicator")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockUpsertInitialBankroll).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 120 })
      );
    });
    expect(mockSetBankroll).not.toHaveBeenCalled();
  });

  it("permite cambiar ambos valores simultáneamente de forma independiente", async () => {
    renderModal();
    await openModal();

    const initialInput = screen.getByLabelText(/banca inicial/i);
    await userEvent.clear(initialInput);
    await userEvent.type(initialInput, "120"); // +20 (expected current = 171.68)

    const currentInput = screen.getByLabelText(/banca actual/i);
    await userEvent.clear(currentInput);
    await userEvent.type(currentInput, "180"); // 180 - 171.68 = +8.32 delta extra

    const deltaIndicator = await screen.findByTestId("delta-indicator");
    expect(deltaIndicator).toHaveTextContent("+8.32 €");

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockUpsertInitialBankroll).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 120 })
      );
    });
    await waitFor(() => {
      expect(mockSetBankroll).toHaveBeenCalledWith(
        expect.objectContaining({ delta: 8.32 })
      );
    });
  });
});
