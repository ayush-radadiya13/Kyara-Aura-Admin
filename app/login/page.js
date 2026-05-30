"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthGuard } from "../../hooks/use-auth-guard";
import { loginService } from "../../services/auth-service";
import { useAuthStore } from "../../store/auth-store";
import { loginSchema } from "../../validations/auth-validation";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const { isHydrated } = useAuthGuard();
  const [passwordShow, setPasswordShow] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await loginService(values);
      const token =
        response?.data?.token ||
        response?.data?.access_token ||
        response?.token ||
        response?.access_token;
      const user =
        response?.data?.admin ||
        response?.data?.user ||
        response?.admin ||
        response?.user ||
        null;
      if (!token) throw new Error("Access token not found");
      setAuth({ user, token });
      toast.success("Login successful");
      window.location.replace("/dashboard");
    } catch (error) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Unable to login";
      toast.error(message);
    }
  });

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5f3]">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8f5f3] via-white to-[#efe6e0] p-4">
      <div className="w-full max-w-md">
        <div className="my-4 flex justify-center">
          <Image
            src="/assets/ka-logo.png"
            alt="Kyara Aura"
            width={260}
            height={260}
            priority
            className="h-auto w-52 object-contain"
          />
        </div>

        <div className="panel-shadow  border border-border/70 bg-card p-8">
          <p className="mb-7 text-center text-lg font-semibold text-foreground">
            Sign In
          </p>

          <form noValidate autoComplete="off" onSubmit={onSubmit}>
            <div className="grid grid-cols-12 gap-y-4">
              <div className="col-span-12">
                <label
                  htmlFor="signin-email"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  className={cn(
                    "h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors",
                    "placeholder:text-muted-foreground",
                    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
                    form.formState.errors.email &&
                      "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
                  )}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <div className="p-1 text-sm text-destructive" role="alert">
                    {form.formState.errors.email.message}
                  </div>
                )}
              </div>

              <div className="col-span-12 mb-2">
                <label
                  htmlFor="signin-password"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Password
                  <Link
                    href="/forgot-password"
                    className="float-right text-sm font-medium text-destructive hover:underline"
                  >
                    Forgot password?
                  </Link>
                </label>
                <div className="flex">
                  <input
                    id="signin-password"
                    type={passwordShow ? "text" : "password"}
                    className={cn(
                      "h-10 w-full rounded-l-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors",
                      "placeholder:text-muted-foreground",
                      "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
                      form.formState.errors.password &&
                        "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
                    )}
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    aria-label={
                      passwordShow ? "Hide password" : "Show password"
                    }
                    onClick={() => setPasswordShow((prev) => !prev)}
                    className="flex h-10 items-center justify-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                  >
                    {passwordShow ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <div className="p-1 text-sm text-destructive" role="alert">
                    {form.formState.errors.password.message}
                  </div>
                )}
              </div>

              <div className="col-span-12 mt-2 grid">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="text-center" />
        </div>
      </div>
    </div>
  );
}
