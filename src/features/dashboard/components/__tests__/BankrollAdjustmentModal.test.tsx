import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BankrollAdjustmentModal } from "../BankrollAdjustmentModal";

// ── Mocks ──────────────────────────────────────────────────────────────────
const mockSetBankroll = vi.fn();

vi.mock("@/features/bets/hooks/useBankrollTransactions", () => ({
  useSetBankroll: () => ({
    mutateAsync: mockSetBankroll,
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
      <BankrollAdjustmentModal currentBankroll={CURRENT_BANKROLL} baseBankroll={BASE_BANKROLL} profit={0} />
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
    expect(initialInput.value).toBe(String(BASE_BANKROLL));

    const currentInput = screen.getByLabelText(/banca actual/i) as HTMLInputElement;
    expect(currentInput.value).toBe(String(CURRENT_BANKROLL));
  });

  it("no llama a ninguna mutación si no se cambia ningún valor", async () => {
    renderModal();
    await openModal();

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockSetBankroll).not.toHaveBeenCalled();
    });
  });

  it("llama a useSetBankroll con delta en verde si la banca actual sube", async () => {
    mockSetBankroll.mockResolvedValue(undefined);
    renderModal();
    await openModal();

    const currentInput = screen.getByLabelText(/banca actual/i);
    await userEvent.clear(currentInput);
    await userEvent.type(currentInput, "160");

    const delta = parseFloat((160 - CURRENT_BANKROLL).toFixed(2));
    const indicator = await screen.findByTestId("delta-indicator");
    expect(indicator).toHaveTextContent("+" + delta.toFixed(2));

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockSetBankroll).toHaveBeenCalledWith(
        expect.objectContaining({
          initialBalance: BASE_BANKROLL,
          newBalance: 160,
          profit: 0,
        }),
      );
    });
  });

  it("llama a useSetBankroll con delta en rojo si la banca actual baja", async () => {
    mockSetBankroll.mockResolvedValue(undefined);
    renderModal();
    await openModal();

    const currentInput = screen.getByLabelText(/banca actual/i);
    await userEvent.clear(currentInput);
    await userEvent.type(currentInput, "140");

    const delta = parseFloat((140 - CURRENT_BANKROLL).toFixed(2));
    const indicator = await screen.findByTestId("delta-indicator");
    expect(indicator).toHaveTextContent(delta.toFixed(2));

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockSetBankroll).toHaveBeenCalledWith(
        expect.objectContaining({
          initialBalance: BASE_BANKROLL,
          newBalance: 140,
          profit: 0,
        }),
      );
    });
  });

  it("llama a useSetBankroll si cambia la banca inicial", async () => {
    mockSetBankroll.mockResolvedValue(undefined);
    renderModal();
    await openModal();

    const initialInput = screen.getByLabelText(/banca inicial/i);
    await userEvent.clear(initialInput);
    await userEvent.type(initialInput, "120");

    await userEvent.click(screen.getByRole("button", { name: /guardar ajuste/i }));

    await waitFor(() => {
      expect(mockSetBankroll).toHaveBeenCalledWith(
        expect.objectContaining({
          initialBalance: 120,
          newBalance: CURRENT_BANKROLL,
          profit: 0,
        }),
      );
    });
  });
});
