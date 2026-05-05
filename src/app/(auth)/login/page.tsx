import { LoginForm } from "@/features/auth/components/login-form";
import {
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Smartphone,
} from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Brand (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 flex-col bg-[#0F172A] relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Glow blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-800/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              QO
            </div>
            <div>
              <div className="font-semibold text-white text-sm leading-none">
                QualityOps
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider leading-none mt-0.5">
                Audit Platform
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-auto mb-10">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
              F&B Quality Management
            </p>
            <h1 className="text-3xl font-semibold text-white leading-tight mb-4">
              Standardize quality.
              <br />
              Audit with confidence.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              End-to-end QA/QC workflow for multi-brand F&B operations — from
              checklist configuration to audit execution and corrective action.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 mb-10">
            <Feature
              icon={ClipboardList}
              title="Structured Audit Checklists"
              desc="Configurable criteria groups with weighted scoring (C/H/P/E)"
            />
            <Feature
              icon={Smartphone}
              title="Mobile-First Execution"
              desc="QC auditors complete checklists on-site from any device"
            />
            <Feature
              icon={ShieldCheck}
              title="Role-Based Access"
              desc="Six distinct roles — from Company Admin to Store Manager"
            />
            <Feature
              icon={BarChart3}
              title="Real-Time Reporting"
              desc="Dashboard and export for QA managers and executives"
            />
          </div>

          {/* Footer */}
          <div className="text-[11px] text-slate-600">
            QualityOps · F&B Audit Platform · v1.0
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo (only shows when left panel hidden) */}
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              QO
            </div>
            <span className="font-semibold text-foreground">QualityOps</span>
          </div>

          {/* Card */}
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Sign in
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your credentials to access the platform.
              </p>
            </div>
            <LoginForm />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Contact your system administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-7 w-7 rounded-md bg-indigo-600/15 flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-indigo-400" />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-200 leading-none mb-0.5">
          {title}
        </div>
        <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
