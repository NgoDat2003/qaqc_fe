"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import { useLogin } from "../hooks/use-login";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
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
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => router.push("/dashboard"),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-xs text-danger leading-tight">
            {(error as Error)?.message || "Email hoặc mật khẩu không đúng."}
          </p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-foreground/70">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all disabled:opacity-50"
            disabled={isPending}
          />
        </div>
        {errors.email && (
          <p className="text-[10px] font-medium text-danger">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-semibold text-foreground/70">
            Mật khẩu
          </label>
          <a href="#" className="text-[10px] font-medium text-primary hover:underline">
            Quên mật khẩu?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            {...register("password")}
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all disabled:opacity-50"
            disabled={isPending}
          />
        </div>
        {errors.password && (
          <p className="text-[10px] font-medium text-danger">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 mt-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          "Đăng nhập"
        )}
      </button>
    </form>
  );
}
