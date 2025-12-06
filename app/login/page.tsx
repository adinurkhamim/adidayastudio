"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const form = new FormData(e.target as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    // langsung ke Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    setLoading(false);

    if (error) {
        setErrorMsg("Incorrect email or password.");
        return;
    }

    router.push("/admin");
    }


  return (
    <div className="w-full flex items-center justify-center px-4 py-4">

      {/* AUTH CARD (refactored, no import) */}
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-3xl p-12 shadow-[0_0_60px_rgba(255,255,255,0.04)]">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-sm font-light text-white text-center">Sign in to</h1>

          <div className="mt-2 flex items-center gap-3">
            <Image
              src="/logo-adidaya-red.svg"
              alt="Adidaya Logo"
              width={24}
              height={24}
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
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          
          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase text-gray-400">Email</label>
            <input
              name="email"
              type="email"
              placeholder="email@adidayastudio.id"
              className="w-full rounded-full border border-white/10 bg-black px-6 py-4 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none text-sm"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-xs tracking-widest uppercase text-gray-400">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-full border border-white/10 bg-black px-6 py-4 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-[46px] text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* ERROR */}
          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-red-600 py-4 font-semibold text-white text-sm transition hover:bg-white hover:text-red-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Forgot password?{" "}
          <a
            href="/forgot"
            className="text-red-500 hover:underline underline-offset-2"
          >
            Reset here
          </a>
        </p>

      </div>
    </div>
  );
}
