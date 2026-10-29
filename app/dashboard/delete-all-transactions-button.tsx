
"use client";

import { deleteAllTransactions } from "@/app/actions/transactions";

export default function DeleteAllTransactionsButton() {
  return (
    <form
      action={deleteAllTransactions}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Yakin ingin menghapus SEMUA transaksi akunmu? Tindakan ini tidak dapat dibatalkan."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Hapus Semua
      </button>
    </form>
  );
}
