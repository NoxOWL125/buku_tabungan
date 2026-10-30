export const instant = false;

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(amount);
}

type SearchParams = {
  month?: string | string[];
  year?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function MonthlyReportPage({
  searchParams,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const now = new Date();

  const rawMonth = Array.isArray(params.month)
    ? params.month[0]
    : params.month;

  const rawYear = Array.isArray(params.year)
    ? params.year[0]
    : params.year;

  const parsedMonth = Number(rawMonth);
  const parsedYear = Number(rawYear);

  const month =
    Number.isInteger(parsedMonth) &&
    parsedMonth >= 1 &&
    parsedMonth <= 12
      ? parsedMonth
      : now.getMonth() + 1;

  const year =
    Number.isInteger(parsedYear) &&
    parsedYear >= 2000 &&
    parsedYear <= 2100
      ? parsedYear
      : now.getFullYear();

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const where = {
    userId: user.id,
    transactionDate: {
      gte: startDate,
      lt: endDate,
    },
  };

  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        ...where,
        type: "INCOME",
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.transaction.aggregate({
      where: {
        ...where,
        type: "EXPENSE",
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const income = Number(incomeResult._sum.amount ?? 0);
  const expense = Number(expenseResult._sum.amount ?? 0);
  const difference = income - expense;

  const maxAmount = Math.max(income, expense, 1);
  const incomeWidth = (income / maxAmount) * 100;
  const expenseWidth = (expense / maxAmount) * 100;

  const currentYear = now.getFullYear();

  const years = Array.from(
    { length: 11 },
    (_, index) => currentYear - 5 + index
  );

  if (!years.includes(year)) {
    years.push(year);
    years.sort((a, b) => a - b);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070910] text-slate-100">
      {/* Background dark merah-ungu */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-700/10 blur-[120px]" />
        <div className="absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-950/40 text-xl font-black text-violet-300">
              呪
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
                Cursed Finance
              </p>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Rekap Keuangan
                <span className="text-red-400"> Bulanan.</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Ringkasan finansialmu dalam satu tampilan.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
          >
            ← Kembali ke Dashboard
          </Link>
        </header>

        {/* Filter bulan dan tahun */}
        <section className="rounded-2xl border border-white/10 bg-[#10131d]/90 p-4 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              Report configuration
            </p>
            <h2 className="mt-1 text-lg font-bold">
              Pilih Periode Laporan
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Tentukan bulan dan tahun yang ingin kamu periksa.
            </p>
          </div>

          <form
            method="GET"
            action="/dashboard/rekap"
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
          >
            <div>
              <label
                htmlFor="month"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Bulan
              </label>
              <select
                id="month"
                name="month"
                defaultValue={String(month)}
                className="w-full rounded-xl border border-white/10 bg-[#090c14] p-3 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10"
              >
                {months.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="year"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Tahun
              </label>
              <select
                id="year"
                name="year"
                defaultValue={String(year)}
                className="w-full rounded-xl border border-white/10 bg-[#090c14] p-3 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10"
              >
                {years.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            >
              Tampilkan Rekap
            </button>

            <Link
              href={`/dashboard/rekap/pdf?month=${month}&year=${year}`}
              className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-center text-sm font-medium text-red-300 transition hover:border-red-300/60 hover:bg-red-500/20"
            >
              ↓ Unduh PDF
            </Link>
          </form>
        </section>

        {/* Ringkasan keuangan */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950/50 to-[#0d1318] p-5 sm:p-6">
            <div className="absolute -right-3 -top-5 text-7xl font-black text-emerald-300/[0.06]">
              ↗
            </div>
            <p className="text-sm font-medium text-slate-400">
              Total Pemasukan
            </p>
            <h2 className="mt-3 break-words text-2xl font-bold text-emerald-300">
              {formatRupiah(income)}
            </h2>
            <p className="mt-4 text-xs text-slate-500">
              {incomeResult._count._all} transaksi pemasukan
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-950/40 to-[#151017] p-5 sm:p-6">
            <div className="absolute -right-3 -top-5 text-7xl font-black text-rose-300/[0.06]">
              ↘
            </div>
            <p className="text-sm font-medium text-slate-400">
              Total Pengeluaran
            </p>
            <h2 className="mt-3 break-words text-2xl font-bold text-rose-300">
              {formatRupiah(expense)}
            </h2>
            <p className="mt-4 text-xs text-slate-500">
              {expenseResult._count._all} transaksi pengeluaran
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-950/50 to-[#11111b] p-5 sm:p-6 sm:col-span-2 xl:col-span-1">
            <div className="absolute -right-3 -top-5 text-7xl font-black text-violet-300/[0.06]">
              呪
            </div>
            <p className="text-sm font-medium text-slate-400">
              Selisih Bulanan
            </p>
            <h2
              className={`mt-3 break-words text-2xl font-bold ${
                difference >= 0 ? "text-violet-300" : "text-rose-300"
              }`}
            >
              {formatRupiah(difference)}
            </h2>
            <p className="mt-4 text-xs text-slate-500">
              Pemasukan dikurangi pengeluaran
            </p>
          </div>
        </section>

        {/* Perbandingan keuangan */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#10131d]/90 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              Financial analysis
            </p>
            <h2 className="mt-1 text-xl font-bold">
              Perbandingan Keuangan
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Periode laporan: {months[month - 1]} {year}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-emerald-300">
                  Pemasukan
                </span>
                <span className="font-semibold text-slate-200">
                  {formatRupiah(income)}
                </span>
              </div>
              <div
                className="h-4 overflow-hidden rounded-full border border-emerald-400/10 bg-black/40"
                role="progressbar"
                aria-label="Perbandingan pemasukan"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={incomeWidth}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-300 transition-all duration-700"
                  style={{ width: `${incomeWidth}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-rose-300">
                  Pengeluaran
                </span>
                <span className="font-semibold text-slate-200">
                  {formatRupiah(expense)}
                </span>
              </div>
              <div
                className="h-4 overflow-hidden rounded-full border border-rose-400/10 bg-black/40"
                role="progressbar"
                aria-label="Perbandingan pengeluaran"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={expenseWidth}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-700 to-rose-400 transition-all duration-700"
                  style={{ width: `${expenseWidth}%` }}
                />
              </div>
            </div>
          </div>

          {income === 0 && expense === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-5 text-center">
              <p className="text-2xl text-violet-300">呪</p>
              <p className="mt-2 text-sm font-medium text-slate-300">
                Belum ada transaksi pada bulan ini.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Coba pilih periode lain atau catat transaksi baru dari dashboard.
              </p>
            </div>
          )}
        </section>

        <footer className="border-t border-white/10 pt-5 text-center">
          <p className="text-xs tracking-wide text-slate-600">
            BUKU TABUNGAN DIGITAL · OWN YOUR FINANCIAL DOMAIN
          </p>
        </footer>
      </div>
    </main>
  );
}
