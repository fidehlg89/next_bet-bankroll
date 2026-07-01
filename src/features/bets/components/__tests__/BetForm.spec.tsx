import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BetForm } from "../BetForm";
import type { Bet } from "../../types/bet.types";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();

vi.mock("../../hooks/useBetMutations", () => ({
  useCreateBet: () => ({ mutateAsync: mockCreateMutateAsync, isPending: false }),
  useUpdateBet: () => ({ mutateAsync: mockUpdateMutateAsync, isPending: false }),
}));

// Default tipsters
let mockTipsters: string[] = ["tipsterA", "tipsterB"];
vi.mock("../../hooks/useBets", () => ({
  useTipsterList: () => ({ data: mockTipsters, isLoading: false }),
}));

// Mock @/components/ui/select with plain HTML
vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  function Select({
    value,
    defaultValue,
    onValueChange,
    children,
  }: {
    value?: string;
    defaultValue?: string;
    onValueChange?: (v: string) => void;
    children: React.ReactNode;
  }) {
    const val = value ?? defaultValue;
    return React.createElement(
      "div",
      { "data-select": true, "data-value": val },
      React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              _value: val,
              _onChange: onValueChange,
            })
          : child,
      ),
    );
  }

  function SelectTrigger({ children }: { children: React.ReactNode }) {
    return React.createElement("button", { type: "button", role: "combobox" }, children);
  }

  function SelectValue({ _value, placeholder }: { _value?: string; placeholder?: string }) {
    return React.createElement("span", null, _value || placeholder || "");
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

// Mock DateTimePicker as a simple input
vi.mock("@/components/ui/datetime-picker", async () => {
  const React = await import("react");
  return {
    DateTimePicker: ({ value, onChange }: { value?: string; onChange?: (v: string) => void }) =>
      React.createElement("input", {
        type: "datetime-local",
        "data-testid": "datetime-picker",
        value: value || "",
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value),
      }),
  };
});

// ── Fixtures ───────────────────────────────────────────────────────────────────

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: "bet-1",
    bet_date: "2025-06-01T10:00:00",
    event: "Real Madrid vs Barcelona",
    market: "Football",
    pick: "Real Madrid",
    bet_type: "Simple",
    tipster: "tipsterA",
    odds: 2.5,
    stake: 10,
    result: null,
    pnl: null,
    user_id: "user-1",
    created_at: "2025-06-01T10:00:00",
    ...overrides,
  };
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function renderForm(props: { onDone?: () => void; bet?: Bet } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <BetForm onDone={props.onDone ?? vi.fn()} bet={props.bet} />
    </QueryClientProvider>,
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("BetForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTipsters = ["tipsterA", "tipsterB"];
  });

  // ── Render modes ─────────────────────────────────────────────────────────────

  describe("render modes", () => {
    it("renders in Create mode with empty default values", () => {
      renderForm();
      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole("button", { name: /guardar pick/i })).toBeInTheDocument();
    });

    it("renders in Edit mode populated with bet values", () => {
      renderForm({ bet: makeBet({ event: "My Edited Event" }) });
      expect(screen.getByDisplayValue("My Edited Event")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /actualizar pick/i })).toBeInTheDocument();
    });
  });

  // ── Tipster field logic ──────────────────────────────────────────────────────

  describe("tipster field logic", () => {
    it("shows a select when tipsters exist", () => {
      renderForm();
      expect(screen.queryByPlaceholderText(/nombre del tipster/i)).toBeNull();
      // The select trigger acts as the combobox
      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBeGreaterThanOrEqual(1);
    });

    it("shows text input when tipster list is empty", () => {
      mockTipsters = [];
      renderForm();
      expect(screen.getByPlaceholderText(/nombre del tipster/i)).toBeInTheDocument();
    });

    it("shows text input when '+ Nuevo tipster…' is selected", async () => {
      const { fireEvent } = await import("@testing-library/react");
      renderForm();
      const newTipsterOption = screen.getByRole("option", { name: /\+ nuevo tipster/i });
      fireEvent.click(newTipsterOption);

      expect(screen.getByPlaceholderText(/nombre del tipster/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /existente/i })).toBeInTheDocument();
    });

    it("returns to select when 'Existente' is clicked", async () => {
      const { fireEvent } = await import("@testing-library/react");
      renderForm();
      const newTipsterOption = screen.getByRole("option", { name: /\+ nuevo tipster/i });
      fireEvent.click(newTipsterOption);

      const existenteBtn = screen.getByRole("button", { name: /existente/i });
      fireEvent.click(existenteBtn);

      expect(screen.queryByPlaceholderText(/nombre del tipster/i)).toBeNull();
    });
  });

  // ── Form Submission ──────────────────────────────────────────────────────────

  describe("form submission", () => {
    it("calls useCreateBet.mutateAsync with valid values in Create mode", async () => {
      const { fireEvent } = await import("@testing-library/react");
      const onDone = vi.fn();
      renderForm({ onDone });

      // Fill required fields that don't have defaults
      await userEvent.type(screen.getByPlaceholderText(/Real Madrid vs Barcelona/i), "Test Event");
      await userEvent.type(screen.getByPlaceholderText(/Over 2.5 goles/i), "Test Pick");

      // Select tipster using fireEvent to ensure the onClick on the div is fired synchronously
      const tipsterAOption = screen.getByRole("option", { name: "tipsterA" });
      fireEvent.click(tipsterAOption);

      // Submit
      const submitBtn = screen.getByRole("button", { name: /guardar pick/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalledOnce();
      });

      // Check values passed
      const passed = mockCreateMutateAsync.mock.calls[0][0];
      expect(passed.event).toBe("Test Event");
      expect(passed.pick).toBe("Test Pick");
      expect(passed.tipster).toBe("tipsterA");
      expect(passed.market).toBe("Football"); // default
      expect(passed.bet_type).toBe("Simple"); // default
      // default odds = 2, stake = 1
      expect(passed.odds).toBe(2);
      expect(passed.stake).toBe(1);

      expect(onDone).toHaveBeenCalled();
    });

    it("calls useUpdateBet.mutateAsync with bet ID in Edit mode", async () => {
      const { fireEvent } = await import("@testing-library/react");
      const onDone = vi.fn();
      const bet = makeBet({ event: "Old Event" });
      renderForm({ onDone, bet });

      // Change event
      const eventInput = screen.getByDisplayValue("Old Event");
      await userEvent.clear(eventInput);
      await userEvent.type(eventInput, "New Event");

      // Submit
      const submitBtn = screen.getByRole("button", { name: /actualizar pick/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalledOnce();
      });

      const passed = mockUpdateMutateAsync.mock.calls[0][0];
      expect(passed.id).toBe("bet-1");
      expect(passed.values.event).toBe("New Event");

      expect(onDone).toHaveBeenCalled();
    });
  });

  // ── Validation ───────────────────────────────────────────────────────────────

  describe("validation", () => {
    it("shows validation error if tipster is missing", async () => {
      const { fireEvent } = await import("@testing-library/react");
      renderForm();

      // Submit the form directly to bypass jsdom button click bubbling issues
      const submitBtn = screen.getByRole("button", { name: /guardar pick/i });
      fireEvent.submit(submitBtn.closest("form")!);

      // We expect the inline error for the tipster field since tipster="" fails .min(1)
      await waitFor(() => {
        expect(screen.getByText(/el tipster es obligatorio/i)).toBeInTheDocument();
      });
    });
  });
});
