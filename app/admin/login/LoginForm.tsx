"use client";

import { useActionState } from "react";
import { loginAction } from "./action";

export default function LoginForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState(
    async (
      prev: { error: string } | null,
      fd: FormData
    ) => {
      fd.set("from", from);           // attach destination
      return loginAction(prev, fd);
    },
    null
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">

      {/* Dot grid */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span
              className="text-[#0D0D0D] font-bold text-2xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              V
            </span>
          </div>
          <h1
            className="text-white text-2xl font-bold tracking-widest"
            style={{ fontFamily: "Georgia, serif" }}
          >
            VARDAAN
          </h1>
          <p className="text-[#B0B0B0] text-sm mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.06] border border-white/[0.10] rounded-2xl p-7 backdrop-blur-sm">
          <h2 className="text-white font-bold text-lg mb-1">Sign in</h2>
          <p className="text-[#B0B0B0] text-sm mb-6">
            Enter your credentials to access the admin panel.
          </p>

          <form action={formAction} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-[#B0B0B0] uppercase tracking-wide mb-1.5">
                Username
              </label>
              <input
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#B0B0B0] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.07] border border-white/[0.12] text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
              />
            </div>

            {/* Error */}
            {state?.error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 text-xs font-medium leading-relaxed">
                  {state.error}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-xl bg-white text-[#0D0D0D] font-bold text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#B0B0B0]/30 text-xs mt-6">
          Vardaan Properties · Admin Access Only
        </p>
      </div>
    </div>
  );
}