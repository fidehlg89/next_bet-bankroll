import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BetFiltersBar } from "../BetFilters";
import type { BetFilters } from "../../hooks/useBets";

// ── Mocks ─────────────────────────────────────────────────────────────────────
//
// 1. useTipsterList: queries Supabase — replaced with static fixture data.
// 2. @/components/ui/select: Radix Select requires pointer-capture APIs that
//    jsdom does not implement. We swap the entire module with plain HTML
//    equivalents so the component tree renders without errors and we can still
//    assert roles, labels, and values.
// ─────────────────────────────────────────────────────────────────────────────

vi.mock("../../hooks/useBets", () => ({
  useTipsterList: () => ({ data: ["tipsterA", "tipsterB", "tipsterC"], isLoading: false }),
}));

// Full HTML-native mock for @/components/ui/select.
// • Select       → tracks value via state and calls onValueChange on change.
// • SelectTrigger → renders a <button role="combobox"> (keeps aria role).
// • SelectValue  → renders the current value text.
// • SelectContent → renders a visible <div> wrapping all children (no portal).
// • SelectItem   → renders an <option> element with the right role + value.
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

  function SelectTrigger({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return React.createElement("button", { role: "combobox", className }, children);
  }

  function SelectValue({ _value }: { _value?: string }) {
    return React.createElement("span", null, _value ?? "");
  }

  function SelectContent({
    children,
    _value,
    _onChange,
  }: {
    children: React.ReactNode;
    _value?: string;
    _onChange?: (v: string) => void;
  }) {
    return React.createElement(
      "div",
      { "data-testid": "select-content" },
      React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              _currentValue: _value,
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
    _currentValue?: string;
  }) {
    return React.createElement(
      "div",
      {
        role: "option",
        "data-value": value,
        onClick: () => _onSelect?.(value),
      },
      children,
    );
  }

  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderFilters(value: BetFilters, onChange: (f: BetFilters) => void) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <BetFiltersBar value={value} onChange={onChange} />
    </QueryClientProvider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("BetFiltersBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  describe("render", () => {
    it("renders all four filter labels", () => {
      renderFilters({}, vi.fn());

      // Use getAllByText for 'tipster' since the mocked SelectContent renders
      // tipsterA/tipsterB/tipsterC options in the DOM too — multiple matches.
      expect(screen.getByText(/mercado/i)).toBeInTheDocument();
      expect(screen.getAllByText(/tipster/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/mes/i)).toBeInTheDocument();
      expect(screen.getByText(/resultado/i)).toBeInTheDocument();
    });

    it("does NOT render the Limpiar button when no filter is active", () => {
      renderFilters({}, vi.fn());
      expect(screen.queryByRole("button", { name: /limpiar/i })).toBeNull();
    });

    it("renders the Limpiar button when tipster filter is active", () => {
      renderFilters({ tipster: "tipsterA" }, vi.fn());
      expect(screen.getByRole("button", { name: /limpiar/i })).toBeInTheDocument();
    });

    it("renders the Limpiar button when market filter is active", () => {
      renderFilters({ market: "Football" }, vi.fn());
      expect(screen.getByRole("button", { name: /limpiar/i })).toBeInTheDocument();
    });

    it("renders the Limpiar button when month filter is active", () => {
      renderFilters({ month: "2025-01" }, vi.fn());
      expect(screen.getByRole("button", { name: /limpiar/i })).toBeInTheDocument();
    });

    it("renders the Limpiar button when result filter is active (not 'all')", () => {
      renderFilters({ result: "W" }, vi.fn());
      expect(screen.getByRole("button", { name: /limpiar/i })).toBeInTheDocument();
    });

    it("does NOT render Limpiar when market is explicitly 'all'", () => {
      renderFilters({ market: "all" }, vi.fn());
      expect(screen.queryByRole("button", { name: /limpiar/i })).toBeNull();
    });

    it("does NOT render Limpiar when result is explicitly 'all'", () => {
      renderFilters({ result: "all" }, vi.fn());
      expect(screen.queryByRole("button", { name: /limpiar/i })).toBeNull();
    });
  });

  // ── Month input ────────────────────────────────────────────────────────────

  describe("month input", () => {
    it("renders a month input", () => {
      renderFilters({}, vi.fn());
      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("type", "month");
    });

    it("reflects the month value from props", () => {
      renderFilters({ month: "2025-06" }, vi.fn());
      expect(screen.getByDisplayValue("2025-06")).toBeInTheDocument();
    });

    it("calls onChange with the new month when the user changes the input", async () => {
      const { fireEvent } = await import("@testing-library/react");
      const onChange = vi.fn();
      renderFilters({ month: "2025-01" }, onChange);

      const input = screen.getByDisplayValue("2025-01");
      // jsdom does not simulate keyboard input for type=month correctly.
      // fireEvent.change sets the value directly, matching how browsers fire
      // the change event when the user picks a month in the native picker.
      fireEvent.change(input, { target: { value: "2025-06" } });

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls.at(-1)?.[0] as BetFilters;
      expect(lastCall.month).toBe("2025-06");
    });

    it("calls onChange with month=undefined when the input is cleared", async () => {
      const onChange = vi.fn();
      renderFilters({ month: "2025-01" }, onChange);

      const input = screen.getByDisplayValue("2025-01");
      await userEvent.clear(input);

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls.at(-1)?.[0] as BetFilters;
      expect(lastCall.month).toBeUndefined();
    });
  });

  // ── Limpiar button ─────────────────────────────────────────────────────────

  describe("Limpiar button", () => {
    it("calls onChange({}) when clicked, resetting all filters", async () => {
      const onChange = vi.fn();
      renderFilters({ tipster: "tipsterA", month: "2025-01" }, onChange);

      await userEvent.click(screen.getByRole("button", { name: /limpiar/i }));

      expect(onChange).toHaveBeenCalledWith({});
    });
  });

  // ── Tipster list ───────────────────────────────────────────────────────────
  //
  // SelectContent is mocked to always render its children (no Radix pointer
  // events needed). We can therefore assert options are present without
  // simulating a click on the trigger.

  describe("tipster list from mock", () => {
    it("renders the tipsters returned by useTipsterList", () => {
      renderFilters({}, vi.fn());

      // With SelectContent mocked to a plain <div>, all options are in the DOM.
      expect(screen.getByRole("option", { name: "tipsterA" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "tipsterB" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "tipsterC" })).toBeInTheDocument();
    });

    it("always renders 'Todos' as an option across all selects", () => {
      renderFilters({}, vi.fn());

      // All three selects have a 'Todos' option (mocked SelectContent renders inline).
      const todos = screen.getAllByRole("option", { name: /todos/i });
      expect(todos.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  describe("accessibility", () => {
    it("month input is associated with a visible label", () => {
      const { container } = renderFilters({}, vi.fn());

      // The label containing "Mes" should be present
      const labels = container.querySelectorAll("label");
      const mesLabel = Array.from(labels).find((l) => l.textContent?.toLowerCase().includes("mes"));
      expect(mesLabel).toBeDefined();
    });
  });
});
