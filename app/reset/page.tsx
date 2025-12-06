"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ============================================================
     PARSE HASH FROM SUPABASE (#access_token=...)
  ============================================================ */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.location.hash.substring(1);
    const hash = new URLSearchParams(raw);

    const at = hash.get("access_token");
    const rt = hash.get("refresh_token");
    const em = hash.get("email");

    if (at) setAccessToken(at);
    if (rt) setRefreshToken(rt);
    if (em) setEmail(em);
  }, []);

  /* ============================================================
     HANDLE RESET PASSWORD
  ============================================================ */
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.target as HTMLFormElement);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    if (!accessToken || !refreshToken) {
      setLoading(false);
      setError("Invalid or expired reset link.");
      return;
    }

    // 1) Supabase SET SESSION -> HARUS pakai access_token + refresh_token
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      setLoading(false);
      setError(sessionError.message || "Failed to restore session.");
      return;
    }

    // 2) UPDATE PASSWORD
    const { error: pwError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (pwError) {
      setError(pwError.message);
      return;
    }

    // 3) Sukses → kembali ke login
    window.location.href = "/login?reset=success";
  }

  /* ============================================================
     INVALID TOKEN HANDLING UI
  ============================================================ */
  if (!accessToken) {
    return (
      <div className="w-full flex-col flex items-center justify-center text-white px-4 py-">
        <p>Invalid or expired reset link.</p>
      </div>
    );
  }

  /* ============================================================
     PAGE UI
  ============================================================ */
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-3xl p-12 shadow-[0_0_60px_rgba(255,255,255,0.04)]">
        
        {/* HEADER */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-adidaya-red.svg"
              alt="Adidaya Logo"
              width={26}
              height={26}
            />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-light tracking-widest text-white">
                ADIDAYA
              </span>
              <span className="text-xl font-bold tracking-widest text-gray-400">
                STUDIO
              </span>
            </div>
          </div>

          <h1 className="mt-8 text-2xl font-semibold text-white text-center">
            Reset Your Password
          </h1>

          {email && (
            <p className="text-gray-400 text-sm mt-2">
              For <span className="text-white">{email}</span>
            </p>
          )}
        </div>

        {/* FORM */}
        <form onSubmit={handleReset} className="flex flex-col gap-6">
          
          <div className="relative">
            <input
              name="password"
              type={showPass1 ? "text" : "password"}
              placeholder="New password"
              className="w-full rounded-full border border-white/10 bg-black px-6 py-4 text-white placeholder-gray-500 text-sm focus:border-red-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass1(!showPass1)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPass1 ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              name="confirm"
              type={showPass2 ? "text" : "password"}
              placeholder="Confirm password"
              className="w-full rounded-full border border-white/10 bg-black px-6 py-4 text-white placeholder-gray-500 text-sm focus:border-red-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass2(!showPass2)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPass2 ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-red-600 py-4 font-semibold text-white text-sm transition hover:bg-white hover:text-red-600 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
