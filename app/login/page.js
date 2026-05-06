"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthGuard} from "../../hooks/use-auth-guard";
import { loginService} from "../../services/auth-service";
import { useAuthStore} from "../../store/auth-store";
import { loginSchema} from "../../validations/auth-validation";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { isHydrated } = useAuthGuard();
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
        response?.data?.admin || response?.data?.user || response?.admin || response?.user || null;
      if (!token) throw new Error("Access token not found");
      setAuth({ user, token });
      toast.success("Login successful");
      router.replace("/dashboard");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8f5f3] via-white to-[#efe6e0] p-4">
      <Card className="panel-shadow w-full max-w-md rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9" {...form.register("email")} />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full"
              )}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
