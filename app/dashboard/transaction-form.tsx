
"use client";

import { useActionState } from "react";
import {
  createTransaction,
  type TransactionState,
} from "@/app/actions/transactions";

const initialState: TransactionState = {};

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#090c14] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-red-400/60 focus:ring-2 focus:ring-red-400/10";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-300";

function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;

  return (
    <ul className="mt-2 space-y-1" aria-live="polite">
      {errors.map((error, index) => (
        <li
          key={`${error}-${index}`}
          className="flex items-start gap-2 text-xs leading-5 text-rose-300"
        >
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TransactionForm() {
  const [state, formAction, isPending] = useActionState(
    createTransaction,
    initialState
  );

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#10131d]/95 p-5 shadow-xl shadow-black/20 sm:p-7">
      {/* Dekorasi tema kutukan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 select-none text-[150px] font-black leading-none text-red-500/[0.045]"
      >
        呪
      </div>

      <div className="relative">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-400/25 bg-red-500/10 text-xl text-red-300">
            +
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Cursed Finance
            </p>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              Tambah Transaksi
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Catat uang masuk dan keluar agar keuanganmu tetap terkendali.
            </p>
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="type" className={labelClass}>
                Jenis transaksi
              </label>
              <select
                id="type"
                name="type"
                required
                defaultValue="INCOME"
                className={inputClass}
                aria-invalid={Boolean(state.fieldErrors?.type?.length)}
                aria-describedby={
                  state.fieldErrors?.type?.length ? "type-errors" : undefined
                }
              >
                <option value="INCOME">↗ Pemasukan</option>
                <option value="EXPENSE">↘ Pengeluaran</option>
              </select>
              <div id="type-errors">
                <FieldErrors errors={state.fieldErrors?.type} />
              </div>
            </div>

            <div>
              <label htmlFor="amount" className={labelClass}>
                Nominal transaksi (Rp)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                max="9999999999999.99"
                step="0.01"
                required
                placeholder="Contoh: 50000"
                className={inputClass}
                aria-invalid={Boolean(state.fieldErrors?.amount?.length)}
                aria-describedby={
                  state.fieldErrors?.amount?.length ? "amount-errors" : undefined
                }
              />
              <div id="amount-errors">
                <FieldErrors errors={state.fieldErrors?.amount} />
              </div>
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>
                Kategori
              </label>
              <input
                id="category"
                name="category"
                type="text"
                maxLength={100}
                required
                placeholder="Contoh: Makan, Gaji, Transportasi"
                className={inputClass}
                aria-invalid={Boolean(state.fieldErrors?.category?.length)}
                aria-describedby={
                  state.fieldErrors?.category?.length
                    ? "category-errors"
                    : undefined
                }
              />
              <div id="category-errors">
                <FieldErrors errors={state.fieldErrors?.category} />
              </div>
            </div>

            <div>
              <label htmlFor="transactionDate" className={labelClass}>
                Tanggal transaksi
              </label>
              <input
                id="transactionDate"
                name="transactionDate"
                type="date"
                defaultValue={getToday()}
                required
                className={inputClass}
                aria-invalid={Boolean(
                  state.fieldErrors?.transactionDate?.length
                )}
                aria-describedby={
                  state.fieldErrors?.transactionDate?.length
                    ? "date-errors"
                    : undefined
                }
              />
              <div id="date-errors">
                <FieldErrors errors={state.fieldErrors?.transactionDate} />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Keterangan{" "}
              <span className="font-normal text-slate-500">(opsional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={1000}
              rows={3}
              placeholder="Contoh: Belanja kebutuhan bulanan..."
              className={`${inputClass} resize-y`}
              aria-invalid={Boolean(
                state.fieldErrors?.description?.length
              )}
              aria-describedby={
                state.fieldErrors?.description?.length
                  ? "description-errors"
                  : undefined
              }
            />
            <div id="description-errors">
              <FieldErrors errors={state.fieldErrors?.description} />
            </div>
          </div>

          {state.error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200"
            >
              <span className="font-bold">!</span>
              <p>{state.error}</p>
            </div>
          )}

          {state.success && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200"
            >
              <span className="font-bold">✓</span>
              <p>{state.success}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Pastikan jenis, nominal, dan tanggal transaksi sudah benar.
            </p>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-gradient-to-r from-red-700 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:from-red-600 hover:to-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10131d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isPending ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  />
                  Menyimpan...
                </>
              ) : (
                <>
                  <span aria-hidden="true">＋</span>
                  Simpan Transaksi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
