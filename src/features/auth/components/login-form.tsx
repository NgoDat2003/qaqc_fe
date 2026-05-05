"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import { useLogin } from "../hooks/use-login";

const loginSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, "Mật khẩu là bắt buộc").min(6, "Mật khẩu ít nhất 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => {
        router.push("/dashboard");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 font-medium leading-tight">
            {(error as any)?.message || "Sai email hoặc mật khẩu. Vui lòng thử lại."}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1"
        >
          Email Address
        </label>
        <div className="relative group">
          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="admin@qualityops.io"
            className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all duration-200"
            disabled={isPending}
          />
        </div>
        {errors.email && (
          <p role="alert" className="text-[10px] font-bold text-red-500 ml-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label
            htmlFor="password"
            className="text-[11px] font-bold text-slate-400 uppercase tracking-wider"
          >
            Password
          </label>
          <a
            href="#"
            className="text-[10px] font-bold text-amber-500/80 hover:text-amber-500 transition-colors"
          >
            Forgot Password?
          </a>
        </div>
        <input
          {...register("password")}
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all duration-200"
          disabled={isPending}
        />
        {errors.password && (
          <p role="alert" className="text-[10px] font-bold text-red-500 ml-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="group relative w-full h-11 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#020617] font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-center gap-2">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <span>Đăng nhập</span>
          )}
        </div>
        {/* Shine effect */}
        <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out pointer-events-none" />
      </button>
    </form>
  );
}
