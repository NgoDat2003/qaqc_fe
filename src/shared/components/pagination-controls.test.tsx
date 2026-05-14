import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaginationControls } from "./pagination-controls";

// ─── Scenario coverage ────────────────────────────────────────────────────────
// #1  totalPages=0  → null
// #2  totalPages=1  → null
// #3  totalPages=7  → no ellipsis
// #4  totalPages=8  → ellipsis khi ở trang 1
// #5  Trang 1       → Prev disabled
// #6  Trang cuối    → Next disabled
// #7  Trang 5/12   → ellipsis 2 phía
// #15 Click số trang → onPageChange(n)

describe("PaginationControls", () => {
  describe("render conditions", () => {
    it("renders null when totalPages=0", () => {
      const { container } = render(
        <PaginationControls page={1} totalPages={0} total={0} onPageChange={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders null when totalPages=1", () => {
      const { container } = render(
        <PaginationControls page={1} totalPages={1} total={5} onPageChange={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders when totalPages=2", () => {
      render(<PaginationControls page={1} totalPages={2} total={25} onPageChange={() => {}} />);
      expect(screen.getByLabelText("Trang trước")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang sau")).toBeInTheDocument();
    });

    it("shows total record count", () => {
      render(<PaginationControls page={1} totalPages={3} total={42} onPageChange={() => {}} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  describe("disabled states (scenarios #5, #6)", () => {
    it("disables Prev on page 1", () => {
      render(<PaginationControls page={1} totalPages={5} total={90} onPageChange={() => {}} />);
      expect(screen.getByLabelText("Trang trước")).toBeDisabled();
    });

    it("enables Prev on page 2", () => {
      render(<PaginationControls page={2} totalPages={5} total={90} onPageChange={() => {}} />);
      expect(screen.getByLabelText("Trang trước")).not.toBeDisabled();
    });

    it("disables Next on last page", () => {
      render(<PaginationControls page={5} totalPages={5} total={90} onPageChange={() => {}} />);
      expect(screen.getByLabelText("Trang sau")).toBeDisabled();
    });

    it("enables Next when not on last page", () => {
      render(<PaginationControls page={3} totalPages={5} total={90} onPageChange={() => {}} />);
      expect(screen.getByLabelText("Trang sau")).not.toBeDisabled();
    });
  });

  describe("page range — ellipsis logic (scenarios #3, #4, #7)", () => {
    it("shows all pages when totalPages=7 — no ellipsis", () => {
      render(<PaginationControls page={4} totalPages={7} total={140} onPageChange={() => {}} />);
      for (let i = 1; i <= 7; i++) {
        expect(screen.getByLabelText(`Trang ${i}`)).toBeInTheDocument();
      }
    });

    it("shows ellipsis when totalPages=8 and on page 1", () => {
      render(<PaginationControls page={1} totalPages={8} total={160} onPageChange={() => {}} />);
      // Pages 1,2,3 visible; ellipsis; page 8
      expect(screen.getByLabelText("Trang 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang 3")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang 8")).toBeInTheDocument();
      expect(screen.queryByLabelText("Trang 5")).not.toBeInTheDocument();
    });

    it("shows two ellipsis at page 7 of 12", () => {
      render(<PaginationControls page={7} totalPages={12} total={240} onPageChange={() => {}} />);
      // Should show: 1 … 5 6 7 8 9 … 12
      expect(screen.getByLabelText("Trang 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang 5")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang 7")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang 9")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang 12")).toBeInTheDocument();
      expect(screen.queryByLabelText("Trang 4")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Trang 10")).not.toBeInTheDocument();
    });

    it("no left ellipsis when current is near start", () => {
      render(<PaginationControls page={3} totalPages={12} total={240} onPageChange={() => {}} />);
      // Should show: 1 2 3 4 5 … 12
      expect(screen.getByLabelText("Trang 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang 5")).toBeInTheDocument();
      expect(screen.getByLabelText("Trang 12")).toBeInTheDocument();
      expect(screen.queryByLabelText("Trang 6")).not.toBeInTheDocument();
    });
  });

  describe("user interactions (scenarios #5, #6, #15)", () => {
    it("clicking Prev calls onPageChange with page-1", async () => {
      const onPageChange = vi.fn();
      render(<PaginationControls page={3} totalPages={10} total={200} onPageChange={onPageChange} />);
      await userEvent.click(screen.getByLabelText("Trang trước"));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("clicking Next calls onPageChange with page+1", async () => {
      const onPageChange = vi.fn();
      render(<PaginationControls page={3} totalPages={10} total={200} onPageChange={onPageChange} />);
      await userEvent.click(screen.getByLabelText("Trang sau"));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it("clicking page number calls onPageChange with correct page", async () => {
      const onPageChange = vi.fn();
      render(<PaginationControls page={1} totalPages={5} total={100} onPageChange={onPageChange} />);
      await userEvent.click(screen.getByLabelText("Trang 4"));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it("disabled Prev does NOT call onPageChange", async () => {
      const onPageChange = vi.fn();
      render(<PaginationControls page={1} totalPages={5} total={100} onPageChange={onPageChange} />);
      await userEvent.click(screen.getByLabelText("Trang trước"));
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it("disabled Next does NOT call onPageChange", async () => {
      const onPageChange = vi.fn();
      render(<PaginationControls page={5} totalPages={5} total={100} onPageChange={onPageChange} />);
      await userEvent.click(screen.getByLabelText("Trang sau"));
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it("active page button has aria-current=page", () => {
      render(<PaginationControls page={3} totalPages={5} total={100} onPageChange={() => {}} />);
      expect(screen.getByLabelText("Trang 3")).toHaveAttribute("aria-current", "page");
      expect(screen.getByLabelText("Trang 2")).not.toHaveAttribute("aria-current");
    });
  });
});
