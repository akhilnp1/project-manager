"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/services";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Layers, Eye, EyeOff, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, token, hydrate } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (token) router.replace("/dashboard/projects"); }, [token, router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.user, res.access_token);
      router.push("/dashboard/projects");
    } catch (err: any) {
      setServerError(err?.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-brand-600 text-white p-2 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-slate-900">ProjectFlow</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className={cn("input", errors.email && "border-red-400 focus:border-red-400 focus:ring-red-100")}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn("input pr-10", errors.password && "border-red-400 focus:border-red-400 focus:ring-red-100")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-2">Demo credentials</p>
            <div className="space-y-1 text-xs text-slate-500 font-mono">
              <div className="flex justify-between bg-slate-50 rounded px-2 py-1">
                <span>admin@example.com</span><span>admin123</span>
              </div>
              <div className="flex justify-between bg-slate-50 rounded px-2 py-1">
                <span>dev@example.com</span><span>dev123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
