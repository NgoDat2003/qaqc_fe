import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";
import { ShieldCheck, ChevronRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-indigo-100">
      {/* ── Left Panel: Visual Inspiration ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-slate-900">
        <Image
          src="/login-bg-v2.png"
          alt="Professional F&B Environment"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/80" />
        
        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-900 font-bold text-xl shadow-xl">
              Q
            </div>
            <span className="text-white font-bold text-xl tracking-tight">QualityOps</span>
          </div>

          {/* Core Message */}
          <div className="max-w-xl">
            <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
              Elevate your <br />
              <span className="text-amber-400">Operational Excellence.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              The professional audit suite designed for modern F&B brands. 
              Precision, transparency, and growth in every checklist.
            </p>
          </div>

          {/* Footer Info */}
          <div className="flex items-center gap-8 text-xs text-slate-400 font-medium tracking-wide">
            <span>&copy; 2026 QualityOps Suite</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Clean Interaction ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile Branding */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl">
              Q
            </div>
            <span className="text-slate-900 font-bold text-xl tracking-tight">QualityOps</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Sign In
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Access your workspace with your secure credentials.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
            <LoginForm />
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>Secure Session</span>
            </div>
            
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Facing issues? Contact your <br /> 
              <a href="mailto:support@qualityops.io" className="text-indigo-600 font-bold hover:underline">System Administrator</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
