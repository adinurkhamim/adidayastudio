"use client";

import { useState } from "react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target as HTMLFormElement);
    const email = form.get("email") as string;

    await fetch("/api/auth/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSent(true);
  }

  return (
    <div className="w-full flex items-center justify-center px-4 py-4">

      {/* AUTH CARD (refactored) */}
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-3xl p-12 shadow-[0_0_60px_rgba(255,255,255,0.04)]">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3">
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

          <h1 className="mt-10 text-xl font-semibold text-white text-center">
            Forgot your password?
          </h1>
          <p className="text-gray-400 text-sm text-center mt-2">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        {/* SUCCESS STATE */}
        {sent ? (
          <div className="text-center text-gray-300">
            <p className="mb-6">
              We’ve sent a password reset link to your email.
            </p>
            <a
              href="/login"
              className="text-red-500 hover:underline underline-offset-2"
            >
              Back to login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* EMAIL FIELD */}
            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest uppercase text-gray-400">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="email@adidayastudio.id"
                className="w-full rounded-full border border-white/10 bg-black px-6 py-4 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none text-sm"
                required
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-red-600 py-4 font-semibold text-white text-sm transition hover:bg-white hover:text-red-600 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>

            {/* BACK LINK */}
            <p className="mt-4 text-center text-sm text-gray-500">
              Remember it?{" "}
              <a
                href="/login"
                className="text-red-500 hover:underline underline-offset-2"
              >
                Back to login
              </a>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
