
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";

const months = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember",
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const params = request.nextUrl.searchParams;
  const rawMonth = params.get("month");
  const rawYear = params.get("year");

  const parsedMonth = Number(rawMonth);
  const parsedYear = Number(rawYear);

  if (
    !rawMonth ||
    !rawYear ||
    !Number.isInteger(parsedMonth) ||
    parsedMonth < 1 ||
    parsedMonth > 12 ||
    !Number.isInteger(parsedYear) ||
    parsedYear < 2000 ||
    parsedYear > 2100
  ) {
    return NextResponse.json(
      { message: "Bulan atau tahun tidak valid." },
      { status: 400 }
    );
  }

  const startDate = new Date(
    Date.UTC(parsedYear, parsedMonth - 1, 1)
  );
  const endDate = new Date(
    Date.UTC(parsedYear, parsedMonth, 1)
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      transactionDate: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: [
      { transactionDate: "asc" },
      { createdAt: "asc" },
    ],
  });

  const income = transactions
    .filter((item) => item.type === "INCOME")
    .reduce((total, item) => total + Number(item.amount), 0);

  const expense = transactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((total, item) => total + Number(item.amount), 0);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 20;

  function addPageIfNeeded(requiredHeight = 10) {
    if (y + requiredHeight > pageHeight - 15) {
      doc.addPage();
      y = 20;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("LAPORAN KEUANGAN", margin, y);

  y += 9;
  doc.setFontSize(12);
  doc.text(
    `${months[parsedMonth - 1]} ${parsedYear}`,
    margin,
    y
  );

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(`Total transaksi: ${transactions.length}`, margin, y);
  y += 7;
  doc.text(`Pemasukan: ${formatRupiah(income)}`, margin, y);
  y += 7;
  doc.text(`Pengeluaran: ${formatRupiah(expense)}`, margin, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text(
    `Selisih: ${formatRupiah(income - expense)}`,
    margin,
    y
  );

  y += 12;

  const columns = [
    { title: "Tanggal", x: margin, width: 27 },
    { title: "Jenis", x: 42, width: 25 },
    { title: "Kategori", x: 68, width: 30 },
    { title: "Deskripsi", x: 99, width: 48 },
    { title: "Nominal (Rp)", x: 148, width: 48 },
  ];

  function drawTableHeader() {
    doc.setFillColor(235, 239, 245);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    for (const column of columns) {
      doc.text(column.title, column.x, y);
    }

    y += 9;
    doc.setFont("helvetica", "normal");
  }

  drawTableHeader();

  for (const item of transactions) {
    const date = item.transactionDate.toISOString().slice(0, 10);
    const type =
      item.type === "INCOME" ? "Masuk" : "Keluar";
    const category = doc.splitTextToSize(
      item.category,
      columns[2].width
    );
    const description = doc.splitTextToSize(
      item.description || "-",
      columns[3].width
    );
    const amount = doc.splitTextToSize(
      formatRupiah(Number(item.amount)),
      columns[4].width
    );

    const lineCount = Math.max(
      1,
      category.length,
      description.length,
      amount.length
    );
    const rowHeight = lineCount * 4 + 3;

    addPageIfNeeded(rowHeight + 4);

    // Ulangi header tabel pada halaman baru.
    if (y === 20) {
      drawTableHeader();
    }

    doc.setFontSize(8);
    doc.text(date, columns[0].x, y);
    doc.text(type, columns[1].x, y);
    doc.text(category, columns[2].x, y);
    doc.text(description, columns[3].x, y);
    doc.text(amount, columns[4].x, y);

    y += rowHeight;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y - 1, pageWidth - margin, y - 1);
  }

  if (transactions.length === 0) {
    doc.setFontSize(10);
    doc.text(
      "Belum ada transaksi pada periode ini.",
      margin,
      y + 3
    );
  }

  const pdf = doc.output("arraybuffer");

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        `attachment; filename="laporan-${parsedYear}-${String(parsedMonth).padStart(2, "0")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
