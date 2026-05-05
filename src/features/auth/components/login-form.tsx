"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import { useLogin } from "../hooks/use-login";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-danger/10 border border-danger/20 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-xs text-danger leading-tight">
            {(error as any)?.message || "Invalid credentials. Please try again."}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-xs font-medium text-muted-foreground"
        >
          Email address
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          placeholder="admin@maycha.com"
          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          disabled={isPending}
        />
        {errors.email && (
          <p className="text-[10px] font-medium text-danger">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-medium text-muted-foreground"
          >
            Password
          </label>
          <a
            href="#"
            className="text-[10px] font-medium text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <input
          {...register("password")}
          id="password"
          type="password"
          placeholder="••••••••"
          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          disabled={isPending}
        />
        {errors.password && (
          <p className="text-[10px] font-medium text-danger">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-10 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
