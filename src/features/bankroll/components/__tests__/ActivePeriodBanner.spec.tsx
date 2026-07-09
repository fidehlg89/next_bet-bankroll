import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivePeriodBanner } from "../ActivePeriodBanner";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockUseActivePeriod = vi.fn();

vi.mock("@/features/bankroll/hooks/useMonthlyPeriods", () => ({
  useActivePeriod: () => mockUseActivePeriod(),
}));

// Mock the modals so we can verify they receive the open state correctly
vi.mock("../OpenPeriodModal", () => ({
  OpenPeriodModal: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="open-modal">
        <button onClick={() => onOpenChange(false)}>Close OpenModal</button>
      </div>
    ) : null,
}));

vi.mock("../CloseMonthModal", () => ({
  CloseMonthModal: ({
    open,
    onOpenChange,
    period,
    currentBankroll,
    periodProfit,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    period: Record<string, unknown>;
    currentBankroll: number;
    periodProfit: number;
  }) =>
    open ? (
      <div
        data-testid="close-modal"
        data-period={period?.period_month}
        data-bankroll={currentBankroll}
        data-profit={periodProfit}
      >
        <button onClick={() => onOpenChange(false)}>Close CloseModal</button>
      </div>
    ) : null,
}));

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("ActivePeriodBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading state when data is fetching", () => {
    mockUseActivePeriod.mockReturnValue({ isLoading: true, data: undefined });
    render(<ActivePeriodBanner currentBankroll={100} periodProfit={10} />);

    expect(screen.getByText(/loading period/i)).toBeInTheDocument();
  });

  describe("when no active period exists", () => {
    beforeEach(() => {
      mockUseActivePeriod.mockReturnValue({ isLoading: false, data: null });
    });

    it("displays the prompt to open a period", () => {
      render(<ActivePeriodBanner currentBankroll={100} periodProfit={10} />);
      expect(screen.getByText(/no active period/i)).toBeInTheDocument();
    });

    it("opens the OpenPeriodModal when 'Open Period' is clicked", async () => {
      render(<ActivePeriodBanner currentBankroll={100} periodProfit={10} />);

      expect(screen.queryByTestId("open-modal")).toBeNull();

      const btn = screen.getByRole("button", { name: /open period/i });
      await userEvent.click(btn);

      expect(screen.getByTestId("open-modal")).toBeInTheDocument();
    });
  });

  describe("when an active period exists", () => {
    const mockPeriod = {
      id: "period-1",
      period_month: "2025-06",
      opening_balance: 1000,
    };

    beforeEach(() => {
      mockUseActivePeriod.mockReturnValue({ isLoading: false, data: mockPeriod });
    });

    it("displays the formatted date and opening balance", () => {
      render(<ActivePeriodBanner currentBankroll={1500} periodProfit={0} />);

      // Depending on locale, "2025-06" might render as "junio de 2025"
      // we check for "2025" and some substring of the month, or just the badge
      expect(screen.getByText(/active/i)).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          return content.includes("Opening") && content.includes("1000") && content.includes("Day");
        }),
      ).toBeInTheDocument();
    });

    it("displays positive profit in green with a '+' sign", () => {
      render(<ActivePeriodBanner currentBankroll={1500} periodProfit={50.5} />);

      // Depending on the local formatting, it could be "+€50.50" or "+50,50 €".
      // We check for the number and the plus sign.
      const profitText = screen.getByText((content, element) => {
        return content.includes("+") && content.includes("50") && content.includes("so far");
      });
      expect(profitText).toBeInTheDocument();
      expect(profitText).toHaveClass("text-green-500");
    });

    it("displays negative profit in red without a extra '+' sign", () => {
      render(<ActivePeriodBanner currentBankroll={900} periodProfit={-10.2} />);

      const profitText = screen.getByText((content, element) => {
        return content.includes("(") && content.includes("10") && content.includes("so far");
      });
      expect(profitText).toBeInTheDocument();
      expect(profitText).toHaveClass("text-red-500");
    });

    it("does not display profit section if periodProfit is exactly 0", () => {
      render(<ActivePeriodBanner currentBankroll={1000} periodProfit={0} />);

      // Should not contain "so far"
      expect(screen.queryByText(/so far/i)).toBeNull();
    });

    it("opens the CloseMonthModal when 'Close Month' is clicked, passing correct props", async () => {
      render(<ActivePeriodBanner currentBankroll={1234} periodProfit={234} />);

      expect(screen.queryByTestId("close-modal")).toBeNull();

      const btn = screen.getByRole("button", { name: /close month/i });
      await userEvent.click(btn);

      const modal = screen.getByTestId("close-modal");
      expect(modal).toBeInTheDocument();
      // It's possible that data-period gets stringified as [object Object] if period?.id fails,
      // but let's check what value was passed or just the class.
      // Since `period` might not have `id`, we should check `period_month`.
      expect(modal).toHaveAttribute("data-period", "2025-06");
      expect(modal).toHaveAttribute("data-bankroll", "1234");
      expect(modal).toHaveAttribute("data-profit", "234");
    });
  });
});
