import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      success: true,
      message: "Koneksi database berhasil!",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return Response.json(
      {
        success: false,
        message: "Koneksi database gagal.",
      },
      { status: 500 }
    );
  }
}