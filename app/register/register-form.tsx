"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { registerUser } from "@/app/actions/auth";

const initialState = {};

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070910] px-4 py-8 text-white sm:px-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-red-700/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d101b]/90 shadow-2xl shadow-black/50 lg:min-h-[650px] lg:grid-cols-2">
        {/* Character panel */}
        <section className="relative min-h-[260px] overflow-hidden sm:min-h-[340px] lg:min-h-full">
          <Image
            src="/images/characters/gojo.jpg"
            alt="Ilustrasi karakter Sukuna"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#070910] via-[#070910]/40 to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:via-[#070910]/10 lg:to-[#0d101b]" />

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:bottom-8 lg:p-10">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-black/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
              Start Your Journey
            </span>

            <h1 className="max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Build Your
              <span className="block text-red-500">
                Financial Domain.
              </span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-300 sm:text-base">
              Mulai perjalanan mengatur keuanganmu. Catat setiap
              pemasukan, kendalikan pengeluaran, dan wujudkan target
              tabunganmu selangkah demi selangkah.
            </p>

            <div className="mt-6 hidden items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-gray-400 sm:flex">
              <span className="h-px w-10 bg-red-500" />
              Buku Tabungan Digital
            </div>
          </div>
        </section>

        {/* Register panel */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-xl font-black text-red-400 shadow-lg shadow-red-950/20">
                B
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
                Create Your Account
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Buat Akun
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Satu langkah awal untuk menguasai keuanganmu.
              </p>
            </div>

            <form action={formAction} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  minLength={3}
                  maxLength={50}
                  autoComplete="username"
                  required
                  placeholder="Buat username"
                  className="w-full rounded-xl border border-white/10 bg-[#080b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 hover:border-white/20 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10"
                />

                {state.fieldErrors?.username?.map((error) => (
                  <p key={error} className="mt-2 text-xs text-red-400">
                    {error}
                  </p>
                ))}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                  placeholder="Buat password minimal 8 karakter"
                  className="w-full rounded-xl border border-white/10 bg-[#080b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 hover:border-white/20 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10"
                />

                {state.fieldErrors?.password?.map((error) => (
                  <p key={error} className="mt-2 text-xs text-red-400">
                    {error}
                  </p>
                ))}
              </div>

              {state.error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="group relative w-full overflow-hidden rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500 hover:shadow-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#0d101b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Memproses..." : "Buat Akun Sekarang"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-600">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-sm text-gray-400">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-red-400 underline-offset-4 transition hover:text-red-300 hover:underline"
              >
                Login sekarang
              </Link>
            </p>

            <p className="mt-10 text-center text-[11px] uppercase tracking-[0.18em] text-gray-600">
              Your money. Your strategy. Your domain.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}