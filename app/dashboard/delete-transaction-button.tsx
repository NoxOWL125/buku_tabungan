"use client";

import { deleteTransaction } from "@/app/actions/transactions";

export default function DeleteTransactionButton({
  id,
}: {
  id: number;
}) {
  return (
    <form
      action={deleteTransaction}
      onSubmit={(event) => {
        if (!window.confirm("Yakin ingin menghapus transaksi ini?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />

      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Hapus
      </button>
    </form>
  );
}