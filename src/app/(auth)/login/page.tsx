import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="h-screen flex overflow-hidden">

      {/* ── Left Panel: Dark + Abstract Visual ── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[48%] bg-[#0F172A] relative overflow-hidden flex-col">

        {/* Abstract visual — large glowing orbs */}
        <div className="absolute inset-0">
          {/* Primary orb — amber, top right */}
          <div className="absolute top-[-10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-primary/25 blur-[120px]" />
          {/* Secondary orb — amber darker, bottom left */}
          <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full bg-primary/15 blur-[100px]" />
          {/* Accent orb — small, center */}
          <div className="absolute top-[40%] left-[30%] w-[200px] h-[200px] rounded-full bg-amber-300/10 blur-[60px]" />
        </div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full  p-10 lg:p-14">

          {/* Logo — top */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-primary/40">
              QO
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight">QualityOps</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Nền tảng QA/QC</div>
            </div>
          </div>

          {/* Tagline — center */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              F&B Quality Management
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
              Chuẩn hóa<br />
              chất lượng.<br />
              <span className="text-primary">Kiểm soát</span><br />
              toàn diện.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Số hóa quy trình kiểm định chất lượng chuỗi F&B — từ xây dựng checklist đến audit thực địa và xử lý action plan.
            </p>
          </div>

          {/* Copyright — bottom */}
          <div>
            <p className="text-[11px] text-slate-600">
              © 2026 QualityOps · F&B Audit Platform · All rights reserved
            </p>
          </div>

        </div>
      </div>

      {/* ── Right Panel: Clean form ── */}
      <div className="flex-1 flex flex-col justify-center bg-slate-100 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto px-8 py-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 md:hidden">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              QO
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">QualityOps</div>
              <div className="text-[10px] text-muted-foreground">Nền tảng QA/QC</div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              Chào mừng trở lại!
            </h2>
            <p className="text-sm text-muted-foreground">
              Đăng nhập vào tài khoản của bạn để tiếp tục.
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          <p className="text-center text-xs text-muted-foreground/60 mt-8">
            Chưa có tài khoản?{" "}
            <span className="text-muted-foreground/50">Liên hệ quản trị viên.</span>
          </p>

        </div>
      </div>

    </div>
  );
}
