
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapeCsv(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  const params = request.nextUrl.searchParams;

  const q = params.get("q")?.trim() ?? "";
  const type = params.get("type") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  // Batasi pengambilan data hanya untuk pengguna yang login.
  const where: {
    userId: string;
    type?: "INCOME" | "EXPENSE";
    transactionDate?: {
      gte?: Date;
      lt?: Date;
    };
    OR?: Array<{
      description?: { contains: string };
      category?: { contains: string };
    }>;
  } = {
    userId: user.id,
  };

  if (type === "INCOME" || type === "EXPENSE") {
    where.type = type;
  }

  if (from || to) {
    where.transactionDate = {};

    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      const date = new Date(`${from}T00:00:00.000Z`);

      if (!Number.isNaN(date.getTime())) {
        where.transactionDate.gte = date;
      }
    }

    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      const date = new Date(`${to}T00:00:00.000Z`);

      if (!Number.isNaN(date.getTime())) {
        date.setUTCDate(date.getUTCDate() + 1);
        where.transactionDate.lt = date;
      }
    }
  }

  if (q) {
    where.OR = [
      { description: { contains: q } },
      { category: { contains: q } },
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { transactionDate: "desc" },
    select: {
      transactionDate: true,
      type: true,
      category: true,
      description: true,
      amount: true,
    },
  });

  const rows = [
    [
      "Tanggal",
      "Jenis Transaksi",
      "Kategori",
      "Deskripsi",
      "Nominal",
    ],
    ...transactions.map((item) => [
      item.transactionDate.toISOString().slice(0, 10),
      item.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
      item.category,
      item.description,
      Number(item.amount),
    ]),
  ];

  // BOM membantu Excel mengenali encoding UTF-8.
  const csv =
    "\uFEFF" +
    rows
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="laporan-transaksi.csv"',
      "Cache-Control": "no-store",
    },
  });
}
