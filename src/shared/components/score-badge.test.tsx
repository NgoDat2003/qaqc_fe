import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScoreBadge } from "./score-badge";

// ---------------------------------------------------------------------------
// ScoreBadge — Unit tests
// Pure component: score → label + color class
// ---------------------------------------------------------------------------

describe("ScoreBadge — threshold labels", () => {
  it("score = 100 → hiển thị '100.0%' và label 'Excellent'", () => {
    render(<ScoreBadge score={100} />);
    expect(screen.getByText("100.0%")).toBeInTheDocument();
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("score = 95 (biên dưới Excellent) → label 'Excellent'", () => {
    render(<ScoreBadge score={95} />);
    expect(screen.getByText("95.0%")).toBeInTheDocument();
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("score = 94.9 (vừa dưới ngưỡng Excellent) → label 'Good'", () => {
    render(<ScoreBadge score={94.9} />);
    expect(screen.getByText("94.9%")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("score = 85 (biên dưới Good) → label 'Good'", () => {
    render(<ScoreBadge score={85} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("score = 84.9 (vừa dưới ngưỡng Good) → label 'Pass'", () => {
    render(<ScoreBadge score={84.9} />);
    expect(screen.getByText("Pass")).toBeInTheDocument();
  });

  it("score = 70 (biên dưới Pass) → label 'Pass'", () => {
    render(<ScoreBadge score={70} />);
    expect(screen.getByText("Pass")).toBeInTheDocument();
  });

  it("score = 69.9 (vừa dưới ngưỡng Pass) → label 'Fail'", () => {
    render(<ScoreBadge score={69.9} />);
    expect(screen.getByText("Fail")).toBeInTheDocument();
  });

  it("score = 1 (biên dưới Fail) → label 'Fail'", () => {
    render(<ScoreBadge score={1} />);
    expect(screen.getByText("Fail")).toBeInTheDocument();
  });

  it("score = 0 → label 'Critical'", () => {
    render(<ScoreBadge score={0} />);
    expect(screen.getByText("0.0%")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });
});

describe("ScoreBadge — color classes theo threshold", () => {
  it("score ≥ 95 → badge có class text-score-excellent", () => {
    const { container } = render(<ScoreBadge score={95} />);
    expect(container.firstChild).toHaveClass("text-score-excellent");
  });

  it("score 85–94 → badge có class text-score-good", () => {
    const { container } = render(<ScoreBadge score={90} />);
    expect(container.firstChild).toHaveClass("text-score-good");
  });

  it("score 70–84 → badge có class text-score-pass", () => {
    const { container } = render(<ScoreBadge score={75} />);
    expect(container.firstChild).toHaveClass("text-score-pass");
  });

  it("score 1–69 → badge có class text-score-fail", () => {
    const { container } = render(<ScoreBadge score={50} />);
    expect(container.firstChild).toHaveClass("text-score-fail");
  });

  it("score = 0 → badge có class text-score-alarm", () => {
    const { container } = render(<ScoreBadge score={0} />);
    expect(container.firstChild).toHaveClass("text-score-alarm");
  });
});

describe("ScoreBadge — prop showText", () => {
  it("showText không truyền (default=true) → hiển thị label", () => {
    render(<ScoreBadge score={90} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("showText=true → hiển thị label", () => {
    render(<ScoreBadge score={90} showText={true} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("showText=false → KHÔNG hiển thị label, chỉ hiển thị số", () => {
    render(<ScoreBadge score={90} showText={false} />);
    expect(screen.queryByText("Good")).not.toBeInTheDocument();
    expect(screen.getByText("90.0%")).toBeInTheDocument();
  });

  it("showText=false với score=0 → KHÔNG hiển thị 'Critical'", () => {
    render(<ScoreBadge score={0} showText={false} />);
    expect(screen.queryByText("Critical")).not.toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });
});

describe("ScoreBadge — format số", () => {
  it("số nguyên → hiển thị 1 chữ số thập phân", () => {
    render(<ScoreBadge score={85} />);
    expect(screen.getByText("85.0%")).toBeInTheDocument();
  });

  it("số thập phân → hiển thị 1 chữ số thập phân (làm tròn)", () => {
    render(<ScoreBadge score={87.56} />);
    expect(screen.getByText("87.6%")).toBeInTheDocument();
  });
});

describe("ScoreBadge — integer boundary labels", () => {
  it("score = 94 (integer dưới 95) → label 'Good'", () => {
    render(<ScoreBadge score={94} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("score = 84 (integer dưới 85) → label 'Pass'", () => {
    render(<ScoreBadge score={84} />);
    expect(screen.getByText("Pass")).toBeInTheDocument();
  });

  it("score = 69 (integer dưới 70) → label 'Fail'", () => {
    render(<ScoreBadge score={69} />);
    expect(screen.getByText("Fail")).toBeInTheDocument();
  });
});

describe("ScoreBadge — className prop", () => {
  it("className được apply vào element gốc", () => {
    const { container } = render(
      <ScoreBadge score={80} className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass("my-custom-class");
  });

  it("className không override style mặc định", () => {
    const { container } = render(
      <ScoreBadge score={80} className="my-custom-class" />
    );
    // vẫn có class gốc inline-flex
    expect(container.firstChild).toHaveClass("inline-flex");
    expect(container.firstChild).toHaveClass("my-custom-class");
  });
});
