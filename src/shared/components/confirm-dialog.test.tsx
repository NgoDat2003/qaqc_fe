import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";

// ---------------------------------------------------------------------------
// Mock Dialog và Button (base-ui internals) — chỉ test behavior của
// ConfirmDialog, không test shadcn/base-ui internals
// ---------------------------------------------------------------------------

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    open,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
    children: React.ReactNode;
  }) => (open ? <div role="dialog">{children}</div> : null),

  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-slot="dialog-content">{children}</div>
  ),

  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-slot="dialog-header">{children}</div>
  ),

  DialogTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h2 data-slot="dialog-title" className={className}>
      {children}
    </h2>
  ),

  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-slot="dialog-description">{children}</p>
  ),

  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-slot="dialog-footer">{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: "Xác nhận xóa",
  onConfirm: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ConfirmDialog — visibility theo prop open", () => {
  it("open=false → title KHÔNG visible", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Xác nhận xóa")).not.toBeInTheDocument();
  });

  it("open=true → title visible", () => {
    render(<ConfirmDialog {...defaultProps} open={true} />);
    expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
  });

  it("open=true → dialog role hiện ra", () => {
    render(<ConfirmDialog {...defaultProps} open={true} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("ConfirmDialog — description", () => {
  it("open=true, description truyền → description visible", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        description="Hành động này không thể hoàn tác."
      />
    );
    expect(
      screen.getByText("Hành động này không thể hoàn tác.")
    ).toBeInTheDocument();
  });

  it("description không truyền → không render description element", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(
      screen.queryByText("Hành động này không thể hoàn tác.")
    ).not.toBeInTheDocument();
  });
});

describe("ConfirmDialog — trạng thái buttons khi isLoading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("isLoading=false → nút 'Hủy' enabled", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={false} />);
    expect(screen.getByRole("button", { name: /hủy/i })).not.toBeDisabled();
  });

  it("isLoading=false → nút 'Xác nhận' enabled", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={false} />);
    expect(screen.getByRole("button", { name: /xác nhận/i })).not.toBeDisabled();
  });

  it("isLoading=true → nút 'Hủy' disabled", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    expect(screen.getByRole("button", { name: /hủy/i })).toBeDisabled();
  });

  it("isLoading=true → nút 'Xác nhận' disabled", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    expect(screen.getByRole("button", { name: /xác nhận/i })).toBeDisabled();
  });
});

describe("ConfirmDialog — click interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Click 'Hủy' → onOpenChange(false) được gọi", async () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: /hủy/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Click 'Xác nhận' → onConfirm được gọi", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: /xác nhận/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("isLoading=true → click 'Hủy' không gọi onOpenChange", async () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog {...defaultProps} isLoading={true} onOpenChange={onOpenChange} />
    );
    // Button bị disabled, userEvent sẽ không trigger click
    const cancelBtn = screen.getByRole("button", { name: /hủy/i });
    expect(cancelBtn).toBeDisabled();
    await userEvent.click(cancelBtn);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("ConfirmDialog — variant destructive", () => {
  it("variant='destructive' → confirm button có data-variant='destructive'", () => {
    render(<ConfirmDialog {...defaultProps} variant="destructive" />);
    const confirmBtn = screen.getByRole("button", { name: /xác nhận/i });
    expect(confirmBtn).toHaveAttribute("data-variant", "destructive");
  });

  it("variant='default' → confirm button có data-variant='default'", () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />);
    const confirmBtn = screen.getByRole("button", { name: /xác nhận/i });
    expect(confirmBtn).toHaveAttribute("data-variant", "default");
  });

  it("variant không truyền → mặc định là 'default'", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmBtn = screen.getByRole("button", { name: /xác nhận/i });
    expect(confirmBtn).toHaveAttribute("data-variant", "default");
  });
});

describe("ConfirmDialog — custom labels", () => {
  it("confirmLabel truyền → nút hiển thị đúng label", () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Xóa ngay" />);
    expect(screen.getByRole("button", { name: /xóa ngay/i })).toBeInTheDocument();
  });

  it("cancelLabel truyền → nút hủy hiển thị đúng label", () => {
    render(<ConfirmDialog {...defaultProps} cancelLabel="Quay lại" />);
    expect(screen.getByRole("button", { name: /quay lại/i })).toBeInTheDocument();
  });

  it("label mặc định → 'Hủy' và 'Xác nhận'", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: /hủy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /xác nhận/i })).toBeInTheDocument();
  });
});
