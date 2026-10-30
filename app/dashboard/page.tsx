
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logoutUser } from "@/app/actions/auth";
import TransactionForm from "./transaction-form";
import Link from "next/link";
import DeleteTransactionButton from "./delete-transaction-button";
import DeleteAllTransactionsButton from "./delete-all-transactions-button";
import CharacterBanner from "./character-banner";
import CharacterSelector from "./character-selector";

export const instant = false;

import {
  Prisma,
  TransactionType,
} from "@/generated/prisma/client";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildPageUrl(
  page: number,
  filters: {
    q: string;
    type: string;
    from: string;
    to: string;
  }
) {
  const searchParams = new URLSearchParams();

  if (filters.q) searchParams.set("q", filters.q);
  if (filters.type) searchParams.set("type", filters.type);
  if (filters.from) searchParams.set("from", filters.from);
  if (filters.to) searchParams.set("to", filters.to);

  searchParams.set("page", String(page));

  return `/dashboard?${searchParams.toString()}`;
}

type DashboardSearchParams = {
  q?: string | string[];
  type?: string | string[];
  from?: string | string[];
  to?: string | string[];
  page?: string | string[];
};

type DashboardPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  const rawPage = Array.isArray(params.page)
    ? params.page[0]
    : params.page;

  const requestedPage = Number(rawPage ?? "1");

  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const pageSize = 10;

  const q = (
    Array.isArray(params.q) ? params.q[0] : params.q
  )?.trim().slice(0, 100) ?? "";

  const rawType = Array.isArray(params.type)
    ? params.type[0]
    : params.type;

  const type: TransactionType | "" =
    rawType === "INCOME" || rawType === "EXPENSE"
      ? rawType
      : "";

  const rawFrom = Array.isArray(params.from)
    ? params.from[0]
    : params.from;

  const rawTo = Array.isArray(params.to)
    ? params.to[0]
    : params.to;

  function isValidDateOnly(
    value: string | undefined
  ): value is string {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }

  const from = isValidDateOnly(rawFrom) ? rawFrom : "";
  const to = isValidDateOnly(rawTo) ? rawTo : "";

  const dateFilter: {
    gte?: Date;
    lt?: Date;
  } = {};

  if (from) {
    dateFilter.gte = new Date(`${from}T00:00:00.000Z`);
  }

  if (to) {
    const endDate = new Date(`${to}T00:00:00.000Z`);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    dateFilter.lt = endDate;
  }

  const where: Prisma.TransactionWhereInput = {
    userId: user.id,

    ...(type ? { type } : {}),

    ...(q
      ? {
          OR: [
            { category: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),

    ...(Object.keys(dateFilter).length > 0
      ? { transactionDate: dateFilter }
      : {}),
  };

  const totalTransactions = await prisma.transaction.count({
    where,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalTransactions / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [
      { transactionDate: "desc" },
      { createdAt: "desc" },
    ],
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: TransactionType.INCOME,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const totalIncome = Number(incomeResult._sum.amount ?? 0);
  const totalExpense = Number(expenseResult._sum.amount ?? 0);
  const balance = totalIncome - totalExpense;

  return (
    <main className="min-h-screen overflow-hidden bg-[#070910] text-slate-100">
      {/* Background anime-inspired */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-700/10 blur-[120px]" />
        <div className="absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/40 bg-red-950/50 text-xl font-black text-red-400 shadow-lg shadow-red-950/30">
              呪
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                Cursed Finance
              </p>

              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Buku Tabungan
                <span className="text-red-400"> Digital.</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CharacterSelector />

            <Link
              href="/dashboard/rekap"
              className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/20"
            >
              Rekap Bulanan
            </Link>

            <form action={logoutUser}>
              <button
                type="submit"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
              >
                Logout ↗
              </button>
            </form>
          </div>
        </header>

        {/* Character banner */}
        <CharacterBanner username={user.username} />

        {/* Financial summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#271018] to-[#11111a] p-6 shadow-lg shadow-red-950/10">
            <div className="absolute -right-5 -top-8 text-8xl font-black text-red-400/[0.07]">
              呪
            </div>
            <p className="text-sm font-medium text-slate-400">
              Saldo Bersih
            </p>
            <p className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {formatRupiah(balance)}
            </p>
            <p className="mt-4 text-xs text-red-300">
              Total pemasukan − pengeluaran
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950/50 to-[#0d1318] p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-400">
                Total Pemasukan
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-lg text-emerald-300">
                ↗
              </span>
            </div>
            <p className="mt-3 break-words text-2xl font-bold text-emerald-300 sm:text-3xl">
              {formatRupiah(totalIncome)}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Akumulasi seluruh pemasukan
            </p>
          </div>

          <div className="rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-950/40 to-[#151017] p-6 sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-400">
                Total Pengeluaran
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/10 text-lg text-rose-300">
                ↘
              </span>
            </div>
            <p className="mt-3 break-words text-2xl font-bold text-rose-300 sm:text-3xl">
              {formatRupiah(totalExpense)}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Akumulasi seluruh pengeluaran
            </p>
          </div>
        </section>

        {/* Add transaction */}
        <section className="rounded-2xl border border-white/10 bg-[#10131d]/90 p-4 sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              Take control
            </p>
            <h2 className="mt-1 text-xl font-bold">Catat Transaksi</h2>
            <p className="mt-1 text-sm text-slate-400">
              Catat pemasukan atau pengeluaran barumu.
            </p>
          </div>
          <TransactionForm />
        </section>

        {/* Transaction history */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                Transaction records
              </p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                Riwayat Transaksi
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Pantau dan kelola setiap pergerakan uangmu.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/transactions/export?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  ...(type ? { type } : {}),
                  ...(from ? { from } : {}),
                  ...(to ? { to } : {}),
                }).toString()}`}
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
              >
                ↓ Ekspor CSV
              </Link>
              <DeleteAllTransactionsButton />
            </div>
          </div>

          {/* Filters */}
          <form
            method="GET"
            action="/dashboard"
            className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#10131d]/90 p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="lg:col-span-2">
              <label htmlFor="q" className="mb-2 block text-sm font-medium text-slate-300">
                Cari transaksi
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Contoh: makan, gaji..."
                className="w-full rounded-xl border border-white/10 bg-[#090c14] p-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/60 focus:ring-2 focus:ring-red-400/10"
              />
            </div>

            <div>
              <label htmlFor="type" className="mb-2 block text-sm font-medium text-slate-300">
                Jenis transaksi
              </label>
              <select
                id="type"
                name="type"
                defaultValue={type}
                className="w-full rounded-xl border border-white/10 bg-[#090c14] p-3 text-sm text-white outline-none focus:border-red-400/60"
              >
                <option value="">Semua jenis</option>
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
              </select>
            </div>

            <div>
              <label htmlFor="from" className="mb-2 block text-sm font-medium text-slate-300">
                Dari tanggal
              </label>
              <input
                id="from"
                name="from"
                type="date"
                defaultValue={from}
                className="w-full min-w-0 rounded-xl border border-white/10 bg-[#090c14] p-3 text-sm text-white outline-none focus:border-red-400/60"
              />
            </div>

            <div>
              <label htmlFor="to" className="mb-2 block text-sm font-medium text-slate-300">
                Sampai tanggal
              </label>
              <input
                id="to"
                name="to"
                type="date"
                defaultValue={to}
                className="w-full min-w-0 rounded-xl border border-white/10 bg-[#090c14] p-3 text-sm text-white outline-none focus:border-red-400/60"
              />
            </div>

            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5">
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Terapkan Filter
              </button>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
              >
                Reset
              </Link>
            </div>
          </form>

          {/* Transactions table */}
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#10131d]/70 px-5 py-12 text-center">
              <p className="text-3xl">呪</p>
              <p className="mt-3 font-medium text-slate-200">
                {q || type || from || to
                  ? "Transaksi tidak ditemukan"
                  : "Belum ada transaksi"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {q || type || from || to
                  ? "Coba ubah filter pencarianmu."
                  : "Yuk, catat transaksi pertamamu!"}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10131d]/90">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-4">Tanggal</th>
                      <th className="px-4 py-4">Jenis</th>
                      <th className="px-4 py-4">Kategori</th>
                      <th className="px-4 py-4">Keterangan</th>
                      <th className="px-4 py-4 text-right">Nominal</th>
                      <th className="px-4 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                          {transaction.transactionDate.toISOString().slice(0, 10)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                              transaction.type === TransactionType.INCOME
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-rose-400/20 bg-rose-400/10 text-rose-300"
                            }`}
                          >
                            {transaction.type === TransactionType.INCOME ? "↗ Masuk" : "↘ Keluar"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {transaction.category}
                        </td>
                        <td className="max-w-xs break-words px-4 py-4 text-slate-400">
                          {transaction.description || "-"}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-4 text-right font-semibold ${
                            transaction.type === TransactionType.INCOME
                              ? "text-emerald-300"
                              : "text-rose-300"
                          }`}
                        >
                          {transaction.type === TransactionType.INCOME ? "+" : "-"}
                          {formatRupiah(Number(transaction.amount))}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/transactions/${transaction.id}/edit`}
                              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-violet-200"
                            >
                              Edit
                            </Link>
                            <DeleteTransactionButton id={transaction.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalTransactions > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Menampilkan{" "}
                {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, totalTransactions)}{" "}
                dari {totalTransactions} transaksi
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildPageUrl(currentPage - 1, { q, type, from, to })}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
                  >
                    ← Sebelumnya
                  </Link>
                ) : (
                  <span className="rounded-xl border border-white/5 px-4 py-2 text-sm text-slate-600">
                    ← Sebelumnya
                  </span>
                )}

                <span className="px-2 text-sm text-slate-400">
                  {currentPage} / {totalPages}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={buildPageUrl(currentPage + 1, { q, type, from, to })}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    Berikutnya →
                  </Link>
                ) : (
                  <span className="rounded-xl border border-white/5 px-4 py-2 text-sm text-slate-600">
                    Berikutnya →
                  </span>
                )}
              </div>
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
