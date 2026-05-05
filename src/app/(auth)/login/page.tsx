import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";
import {
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Smartphone,
  ChevronRight,
} from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#020617] selection:bg-amber-500/30">
      {/* ── Left Panel: Brand Experience ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-shrink-0 flex-col relative overflow-hidden border-r border-white/5">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/login-bg.png"
            alt="MayCha QualityOps Background"
            fill
            className="object-cover opacity-80"
            priority
          />
          {/* Fade bottom → dark */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
          {/* Fade right → nhưng dừng lại ở 70%, không fade hết sang màu đen → giữ ranh giới rõ */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#020617]" />
        </div>
        {/* Separator line rõ hơn — tạo ranh giới trái/phải */}
        <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          {/* Logo Section — TOP */}
          <div className="flex items-center gap-4 group cursor-default">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#020617] font-bold text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              Q
            </div>
            <div>
              <div className="font-bold text-white text-lg tracking-tight leading-none">
                Quality<span className="text-amber-500">Ops</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] leading-none mt-1.5 font-medium">
                Professional Audit Suite
              </div>
            </div>
          </div>

          {/* Value Proposition — CENTER (flex-1 + flex col + justify-center) */}
          <div className="flex-1 flex flex-col justify-center max-w-lg py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                v1.2 Production Ready
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Master your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                Quality Standards.
              </span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-md">
              Streamline multi-brand F&B operations with our advanced QA/QC workflow engine.
              Precision auditing, automated action plans, and real-time intelligence.
            </p>

            {/* Feature list in Bento-ish style */}
            <div className="grid grid-cols-1 gap-4">
              <FeatureItem
                icon={ClipboardList}
                title="Smart Checklists"
                desc="Weighted scoring and conditional logic."
              />
              <FeatureItem
                icon={Smartphone}
                title="Edge Execution"
                desc="Seamless mobile auditing for on-site QC."
              />
              <FeatureItem
                icon={ShieldCheck}
                title="Enterprise Security"
                desc="Advanced RBAC for complex organizations."
              />
            </div>
          </div>

          {/* Legal/Footer */}
          <div className="flex items-center gap-6 text-[11px] text-slate-500 font-medium">
            <span>&copy; 2026 QualityOps Suite</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <a href="#" className="hover:text-amber-500 transition-colors">Support</a>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Interaction ── */}
      <div className="flex-1 flex flex-col items-center justify-center relative py-12">
        {/* Subtle Background Glow for Form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Container cân bằng: mx-auto + padding đều 2 bên */}
        <div className="w-full max-w-[460px] mx-auto px-8 relative z-10">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#020617] font-bold text-2xl shadow-xl shadow-amber-500/20 mb-4">
              Q
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">QualityOps</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-slate-400 text-sm">
              Enter your secure credentials to manage operations.
            </p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <LoginForm />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500/60" />
              <span>Protected by Enterprise-grade encryption</span>
            </div>

            <button className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
              System Status: <span className="text-emerald-500 font-bold">Operational</span>
              <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group">
      <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
        <Icon className="h-5 w-5 text-amber-500" />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-100 mb-0.5">
          {title}
        </div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
    </div>
  );
}
