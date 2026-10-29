import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateTransaction } from "@/app/actions/transactions";

type EditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditTransactionPage({
  params,
  searchParams,
}: EditPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id: idParam } = await params;
  const { error } = await searchParams;
  const id = Number(idParam);

  if (!Number.isSafeInteger(id) || id <= 0) {
    redirect("/dashboard");
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070910] px-4 py-10 text-white sm:px-6 lg:py-14">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-red-700/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
              Financial Management
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Edit <span className="text-red-500">Transaksi</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
              Perbarui detail pemasukan atau pengeluaranmu dengan
              informasi yang benar.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Kembali
          </Link>
        </div>

        {/* Form layout */}
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.5fr]">
          {/* Information panel */}
          <aside className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d101b] p-6 shadow-xl shadow-black/20">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-red-600/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-2xl text-red-400">
                ✦
              </div>

              <h2 className="text-xl font-bold">
                Kendalikan Catatanmu
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Perubahan akan diterapkan pada transaksi yang sudah
                tersimpan. Pastikan nominal, kategori, dan tanggal
                sesuai dengan catatan keuanganmu.
              </p>

              <div className="my-6 h-px bg-white/10" />

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Transaksi saat ini
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-400">Kategori</p>
                <p className="mt-1 break-words font-semibold text-white">
                  {transaction.category}
                </p>

                <p className="mt-4 text-sm text-gray-400">Jenis</p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                    transaction.type === "INCOME"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/20 bg-red-500/10 text-red-400"
                  }`}
                >
                  {transaction.type === "INCOME"
                    ? "Pemasukan"
                    : "Pengeluaran"}
                </span>
              </div>

              <p className="mt-5 text-xs leading-relaxed text-gray-500">
                Tips: periksa kembali data sebelum menyimpan perubahan.
              </p>
            </div>
          </aside>

          {/* Edit form */}
          <section className="rounded-2xl border border-white/10 bg-[#0d101b]/95 p-5 shadow-2xl shadow-black/20 sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                Transaction Details
              </p>
              <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                Informasi Transaksi
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Sesuaikan kolom di bawah ini.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-relaxed text-red-300"
              >
                {error === "invalid"
                  ? "Data belum valid. Periksa kembali isianmu."
                  : "Transaksi gagal diubah. Silakan coba lagi."}
              </div>
            )}

            <form action={updateTransaction} className="space-y-5">
              <input type="hidden" name="id" value={transaction.id} />

              <div>
                <label
                  htmlFor="type"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Jenis Transaksi
                </label>

                <select
                  id="type"
                  name="type"
                  defaultValue={transaction.type}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080b13] px-4 py-3 text-sm text-white outline-none transition focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10"
                >
                  <option value="INCOME">Pemasukan</option>
                  <option value="EXPENSE">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Nominal (Rp)
                </label>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  max="9999999999999.99"
                  step="0.01"
                  defaultValue={transaction.amount.toString()}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Kategori
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  maxLength={100}
                  defaultValue={transaction.category}
                  required
                  placeholder="Contoh: Makanan, Transportasi"
                  className="w-full rounded-xl border border-white/10 bg-[#080b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="transactionDate"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Tanggal Transaksi
                </label>

                <input
                  id="transactionDate"
                  name="transactionDate"
                  type="date"
                  defaultValue={transaction.transactionDate.toISOString().slice(0, 10)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080b13] px-4 py-3 text-sm text-white outline-none transition focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Keterangan{" "}
                  <span className="font-normal text-gray-500">
                    (opsional)
                  </span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  maxLength={1000}
                  defaultValue={transaction.description ?? ""}
                  rows={4}
                  placeholder="Tambahkan keterangan jika diperlukan..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#080b13] px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#0d101b]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </section>
        </div>

        <footer className="mt-8 text-center text-[11px] uppercase tracking-[0.18em] text-gray-600">
          Your money. Your strategy. Your domain.
        </footer>
      </div>
    </main>
  );
}