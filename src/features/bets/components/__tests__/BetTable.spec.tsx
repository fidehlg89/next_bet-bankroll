import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BetTable } from "../BetTable";
import type { Bet } from "../../types/bet.types";

// ── Mocks ──────────────────────────────────────────────────────────────────────
//
// 1. Supabase-backed hooks → replaced with vi.fn() spies.
// 2. @/components/ui/select → plain HTML (same pattern as BetFiltersBar spec).
// 3. @/components/ui/dialog → renders children directly (no portal issues).
// 4. @/components/ui/table → thin pass-throughs so table structure is testable.
// ──────────────────────────────────────────────────────────────────────────────

const mockSettleMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockUpdateTipsterMutate = vi.fn();
const mockCreateBetMutate = vi.fn();
const mockUpdateBetMutate = vi.fn();

vi.mock("../../hooks/useBetMutations", () => ({
  useSettleBet: () => ({ mutate: mockSettleMutate }),
  useDeleteBet: () => ({ mutate: mockDeleteMutate }),
  useUpdateBetTipster: () => ({ mutate: mockUpdateTipsterMutate }),
  // Required by BetForm (rendered inside the edit dialog)
  useCreateBet: () => ({ mutate: mockCreateBetMutate, isPending: false }),
  useUpdateBet: () => ({ mutate: mockUpdateBetMutate, isPending: false }),
}));

vi.mock("../../hooks/useBets", () => ({
  useTipsterList: () => ({ data: ["tipsterA", "tipsterB"], isLoading: false }),
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  function Select({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange?: (v: string) => void;
    children: React.ReactNode;
  }) {
    return React.createElement(
      "div",
      { "data-select": true, "data-value": value },
      React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              _value: value,
              _onChange: onValueChange,
            })
          : child,
      ),
    );
  }

  function SelectTrigger({ children }: { children: React.ReactNode }) {
    return React.createElement("button", { role: "combobox" }, children);
  }

  function SelectValue({ _value }: { _value?: string }) {
    return React.createElement("span", null, _value ?? "");
  }

  function SelectContent({
    children,
    _onChange,
  }: {
    children: React.ReactNode;
    _onChange?: (v: string) => void;
  }) {
    return React.createElement(
      "div",
      { "data-testid": "select-content" },
      React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              _onSelect: _onChange,
            })
          : child,
      ),
    );
  }

  function SelectItem({
    value,
    children,
    _onSelect,
  }: {
    value: string;
    children: React.ReactNode;
    _onSelect?: (v: string) => void;
  }) {
    return React.createElement(
      "div",
      { role: "option", "data-value": value, onClick: () => _onSelect?.(value) },
      children,
    );
  }

  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
});

vi.mock("@/components/ui/dialog", async () => {
  const React = await import("react");
  return {
    Dialog: ({
      open,
      children,
    }: {
      open: boolean;
      onOpenChange?: (o: boolean) => void;
      children: React.ReactNode;
    }) => (open ? React.createElement("div", { "data-testid": "dialog" }, children) : null),
    DialogContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "dialog-content" }, children),
    DialogHeader: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    DialogTitle: ({ children }: { children: React.ReactNode }) =>
      React.createElement("h2", null, children),
  };
});

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: crypto.randomUUID(),
    bet_date: "2025-06-01T10:00:00Z",
    event: "Real Madrid vs Barcelona",
    market: "Football",
    pick: "Real Madrid",
    bet_type: "1X2",
    tipster: "tipsterA",
    odds: 2.5,
    stake: 10,
    result: null,
    pnl: null,
    user_id: "user-1",
    created_at: "2025-06-01T10:00:00Z",
    ...overrides,
  };
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function renderTable(bets: Bet[]) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <BetTable bets={bets} />
    </QueryClientProvider>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("BetTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Empty state ──────────────────────────────────────────────────────────────

  describe("empty state", () => {
    it("renders the empty state message when bets array is empty", () => {
      renderTable([]);
      expect(screen.getByText(/sin picks todavía/i)).toBeInTheDocument();
    });

    it("does not render the table when bets array is empty", () => {
      renderTable([]);
      expect(screen.queryByRole("table")).toBeNull();
    });
  });

  // ── Table structure ──────────────────────────────────────────────────────────

  describe("table structure", () => {
    it("renders all expected column headers", () => {
      renderTable([makeBet()]);
      const headers = screen.getAllByRole("columnheader");
      const headerTexts = headers.map((h) => h.textContent?.trim());
      expect(headerTexts).toContain("Fecha");
      expect(headerTexts).toContain("Evento");
      expect(headerTexts).toContain("Mercado");
      expect(headerTexts).toContain("Pick");
      expect(headerTexts).toContain("Tipo");
      expect(headerTexts).toContain("Tipster");
      expect(headerTexts).toContain("Cuota");
      expect(headerTexts).toContain("Stake");
    });

    it("renders one row per bet (plus header row)", () => {
      const bets = [makeBet(), makeBet(), makeBet()];
      renderTable(bets);
      // 3 data rows + 1 header row = 4 rows total
      expect(screen.getAllByRole("row")).toHaveLength(4);
    });

    it("renders the event name for each bet", () => {
      const bets = [makeBet({ event: "Match Alpha" }), makeBet({ event: "Match Beta" })];
      renderTable(bets);
      expect(screen.getByText("Match Alpha")).toBeInTheDocument();
      expect(screen.getByText("Match Beta")).toBeInTheDocument();
    });

    it("renders the market for each bet", () => {
      renderTable([makeBet({ market: "Tennis" })]);
      expect(screen.getByText("Tennis")).toBeInTheDocument();
    });

    it("renders '—' for pnl when result is null (pending bet)", () => {
      renderTable([makeBet({ result: null, pnl: null })]);
      // The P&L cell shows "—" for pending bets
      const rows = screen.getAllByRole("row");
      const dataRow = rows[1]; // first data row
      expect(within(dataRow).getByText("—")).toBeInTheDocument();
    });
  });

  // ── Pagination ───────────────────────────────────────────────────────────────

  describe("pagination", () => {
    it("shows pagination controls when there are bets", () => {
      renderTable([makeBet()]);
      // "Página X de Y" appears in the pagination area
      const paginationTexts = screen.getAllByText(/página/i);
      expect(paginationTexts.length).toBeGreaterThanOrEqual(1);
    });

    it("only renders itemsPerPage (default 10) rows when bets > 10", () => {
      const bets = Array.from({ length: 15 }, () => makeBet());
      renderTable(bets);
      // 10 data rows + 1 header = 11 rows on first page
      expect(screen.getAllByRole("row")).toHaveLength(11);
    });

    it("shows page 1 of 2 label when 15 bets with 10 per page", () => {
      const bets = Array.from({ length: 15 }, () => makeBet());
      renderTable(bets);
      // Find the specific pagination span (not the "por página" label)
      const paginationEl = screen
        .getAllByText(/página/i)
        .find((el) => /página \d+ de \d+/i.test(el.textContent ?? ""));
      expect(paginationEl).toBeDefined();
      expect(paginationEl?.textContent).toMatch(/página 1 de 2/i);
    });

    it("navigates to page 2 when Next is clicked", async () => {
      const bets = Array.from({ length: 15 }, (_, i) => makeBet({ event: `Event ${i + 1}` }));
      renderTable(bets);

      const nextBtn = screen.getByRole("link", { name: /next/i });
      await userEvent.click(nextBtn);

      // Page 2 should have 5 remaining rows + 1 header = 6
      expect(screen.getAllByRole("row")).toHaveLength(6);
    });
  });

  // ── Delete action ────────────────────────────────────────────────────────────

  describe("delete action", () => {
    it("calls confirm() when delete button is clicked", async () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
      renderTable([makeBet()]);

      // Trash2 icon has no accessible name — find the last icon button in the data row
      const rows = screen.getAllByRole("row");
      const actionBtns = within(rows[1]).getAllByRole("button");
      const trashBtn = actionBtns[actionBtns.length - 1]; // last button is delete

      await userEvent.click(trashBtn);
      expect(confirmSpy).toHaveBeenCalledOnce();
      confirmSpy.mockRestore();
    });

    it("calls deletebet.mutate with the bet id when user confirms", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      const bet = makeBet({ id: "bet-to-delete" });
      renderTable([bet]);

      const rows = screen.getAllByRole("row");
      const actionBtns = within(rows[1]).getAllByRole("button");
      const trashBtn = actionBtns[actionBtns.length - 1];

      await userEvent.click(trashBtn);
      expect(mockDeleteMutate).toHaveBeenCalledWith("bet-to-delete");
      vi.restoreAllMocks();
    });

    it("does NOT call deleteBet.mutate when user cancels", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(false);
      renderTable([makeBet()]);

      const rows = screen.getAllByRole("row");
      const actionBtns = within(rows[1]).getAllByRole("button");
      const trashBtn = actionBtns[actionBtns.length - 1];

      await userEvent.click(trashBtn);
      expect(mockDeleteMutate).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    });
  });

  // ── Edit action ──────────────────────────────────────────────────────────────

  describe("edit action", () => {
    it("opens the edit dialog when the edit button is clicked", async () => {
      renderTable([makeBet()]);

      expect(screen.queryByTestId("dialog")).toBeNull();

      const rows = screen.getAllByRole("row");
      const actionBtns = within(rows[1]).getAllByRole("button");
      const editBtn = actionBtns[0]; // first icon button is edit (Pencil)

      await userEvent.click(editBtn);
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    it("shows 'Editar pick' title in the dialog", async () => {
      renderTable([makeBet()]);

      const rows = screen.getAllByRole("row");
      const actionBtns = within(rows[1]).getAllByRole("button");
      await userEvent.click(actionBtns[0]);

      expect(screen.getByText(/editar pick/i)).toBeInTheDocument();
    });
  });
});
