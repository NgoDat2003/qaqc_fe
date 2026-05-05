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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {error && (
        <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-semibold leading-tight">
            {(error as any)?.message || "The email or password you entered is incorrect."}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-xs font-bold text-slate-700 ml-1"
        >
          Email Address
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          placeholder="name@company.com"
          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200"
          disabled={isPending}
        />
        {errors.email && (
          <p role="alert" className="text-[10px] font-bold text-red-600 ml-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label
            htmlFor="password"
            className="text-xs font-bold text-slate-700"
          >
            Password
          </label>
          <a
            href="#"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Forgot?
          </a>
        </div>
        <input
          {...register("password")}
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-200"
          disabled={isPending}
        />
        {errors.password && (
          <p role="alert" className="text-[10px] font-bold text-red-600 ml-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
}
