
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";


export async function deleteAllTransactions() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await prisma.transaction.deleteMany({
    where: {
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}


export type TransactionState = {
  success?: string;
  error?: string;
  fieldErrors?: {
    type?: string[];
    amount?: string[];
    category?: string[];
    description?: string[];
    transactionDate?: string[];
  };
};

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,13}(\.\d{1,2})?$/, "Nominal tidak valid.")
    .refine((value) => Number(value) > 0, {
      message: "Nominal harus lebih dari nol.",
    }),
  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib diisi.")
    .max(100, "Kategori maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .max(1000, "Keterangan maksimal 1000 karakter."),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Tanggal tidak valid."),
});

export async function createTransaction(
  _previousState: TransactionState,
  formData: FormData
): Promise<TransactionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Silakan login kembali." };
  }

  const validated = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    transactionDate: formData.get("transactionDate"),
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  try {
    await prisma.transaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        transactionDate: new Date(
          `${data.transactionDate}T00:00:00.000Z`
        ),
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Gagal menyimpan transaksi:", error);
    return {
      error: "Transaksi gagal disimpan. Silakan coba lagi.",
    };
  }

  revalidatePath("/dashboard");

  return { success: "Transaksi berhasil ditambahkan." };
}

export async function updateTransaction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));

  if (!Number.isSafeInteger(id) || id <= 0) {
    redirect("/dashboard");
  }

  const validated = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    transactionDate: formData.get("transactionDate"),
  });

  if (!validated.success) {
    redirect(`/dashboard/transactions/${id}/edit?error=invalid`);
  }

  const data = validated.data;

  try {
    const result = await prisma.transaction.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: {
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description || null,
        transactionDate: new Date(
          `${data.transactionDate}T00:00:00.000Z`,
        ),
      },
    });

    if (result.count === 0) {
      redirect("/dashboard");
    }
  } catch (error) {
    // RedirectException dari Next.js tidak boleh ditelan oleh catch.
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }

    console.error("Gagal mengubah transaksi:", error);
    redirect(`/dashboard/transactions/${id}/edit?error=failed`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteTransaction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));

  if (!Number.isSafeInteger(id) || id <= 0) {
    redirect("/dashboard");
  }

  await prisma.transaction.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}