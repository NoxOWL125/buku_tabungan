# 💰 Buku Tabungan Digital

Aplikasi pencatatan keuangan pribadi berbasis web untuk membantu pengguna mengelola pemasukan, pengeluaran, dan memantau kondisi keuangan dengan lebih teratur.

Proyek ini dikembangkan sebagai sarana pembelajaran dan portofolio pengembangan web, dengan antarmuka **dark theme terinspirasi Jujutsu Kaisen** yang menggabungkan tampilan modern, aksen merah-ungu, dan karakter visual yang khas.

## ✨ Fitur Utama

- **Autentikasi pengguna** — registrasi, login, dan logout.
- **Manajemen transaksi** — menambahkan, melihat, mengedit, dan menghapus transaksi.
- **Kategori transaksi** — membedakan pemasukan dan pengeluaran.
- **Dashboard keuangan** — menampilkan ringkasan kondisi keuangan dan daftar transaksi.
- **Pencarian dan filter** — mencari transaksi berdasarkan kata kunci, jenis, dan rentang tanggal.
- **Pagination** — menampilkan daftar transaksi dalam beberapa halaman.
- **Rekap bulanan** — melihat total pemasukan, pengeluaran, dan selisih keuangan berdasarkan bulan dan tahun.
- **Ekspor laporan PDF** — menghasilkan laporan rekap bulanan.
- **Ekspor transaksi CSV** — mengekspor data transaksi untuk pengolahan lebih lanjut.
- **Hapus seluruh transaksi** — menghapus transaksi milik pengguna dengan konfirmasi.
- **Antarmuka responsif** — mendukung tampilan desktop dan perangkat mobile.
- **Personalisasi dashboard** — pilihan karakter Sukuna, Gojo, dan Itadori.

## 🛠️ Teknologi

| Teknologi | Penggunaan |
|---|---|
| Next.js | Framework aplikasi web |
| React | Pembangunan antarmuka |
| TypeScript | Penulisan kode bertipe |
| Tailwind CSS | Styling dan layout |
| Prisma ORM | Interaksi dengan database |
| MySQL | Penyimpanan data |
| bcryptjs | Hashing password |
| Zod | Validasi data |
| jsPDF | Pembuatan laporan PDF |

## 🎨 Desain Antarmuka

Aplikasi menggunakan tema gelap dengan aksen merah dan ungu, terinspirasi dari atmosfer anime *Jujutsu Kaisen*.

Halaman yang diselaraskan dengan tema ini meliputi:

- Dashboard
- Rekap keuangan bulanan
- Login
- Registrasi
- Edit transaksi

Desain mengutamakan konsistensi visual, keterbacaan informasi, dan kenyamanan penggunaan.

## 🚀 Menjalankan Proyek Secara Lokal

### 1. Persyaratan

Pastikan perangkat sudah memiliki:

- Node.js dan npm
- MySQL
- Git

### 2. Clone repository

```bash
git clone <URL_REPOSITORY>
cd <NAMA_FOLDER>
```

Ganti `<URL_REPOSITORY>` dengan URL repository GitHub milikmu dan `<NAMA_FOLDER>` dengan nama folder proyek.

### 3. Instal dependensi

```bash
npm install
```

### 4. Konfigurasi environment

Buat file `.env` di folder utama proyek dan isi konfigurasi koneksi database sesuai pengaturan MySQL lokalmu.

Contoh format:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/NAMA_DATABASE"
```

Sesuaikan `USER`, `PASSWORD`, `HOST`, `PORT`, dan `NAMA_DATABASE` dengan konfigurasi lokal. Jangan mengunggah file `.env` yang berisi kredensial asli ke GitHub.

### 5. Siapkan Prisma

Jalankan perintah berikut sesuai konfigurasi Prisma proyek:

```bash
npx prisma generate
npx prisma migrate dev
```

Pastikan database MySQL sudah tersedia dan konfigurasi Prisma yang digunakan proyek sudah benar. Jika proyek memakai migrasi yang telah tersedia di repository, periksa juga status migrasinya sebelum menjalankan aplikasi.

### 6. Jalankan aplikasi

```bash
npm run dev
```

Buka alamat berikut di browser:

```text
http://localhost:3000
```

## 📁 Gambaran Struktur Proyek

```text
app/
├── actions/
│   ├── auth.ts
│   └── transactions.ts
├── dashboard/
│   ├── rekap/
│   ├── transactions/
│   ├── character-banner.tsx
│   ├── character-selector.tsx
│   └── page.tsx
├── login/
├── register/
└── ...

lib/
├── auth.ts
└── prisma.ts

prisma/
public/
└── images/
    └── characters/

generated/
```

Struktur di atas merupakan gambaran bagian utama proyek. Susunan direktori sebenarnya dapat berbeda mengikuti versi dan konfigurasi aplikasi.

## 🔐 Catatan Keamanan

- Password disimpan dalam bentuk hash, bukan sebagai teks biasa.
- Akses transaksi dibatasi berdasarkan pengguna yang sedang login.
- Informasi koneksi database disimpan melalui environment variables.
- Jangan mengunggah kredensial, token sesi, atau rahasia aplikasi ke repository publik.

## 👨‍💻 Kredit dan Pengembangan

**Pengembang:** Nashrull

Proyek ini dikembangkan oleh Nashrull dengan bantuan **ChatGPT (OpenAI)** sebagai partner brainstorming, pendamping debugging, serta pendukung proses pengembangan dan penyempurnaan antarmuka.

Implementasi, pengujian, dan pengelolaan repository dilakukan sesuai proses pengembangan proyek.

## ⚖️ Catatan Aset Visual

Tema antarmuka terinspirasi dari *Jujutsu Kaisen*. Nama karakter dan aset visual terkait merupakan milik pemegang hak masing-masing. Proyek ini merupakan proyek pembelajaran dan portofolio independen, bukan aplikasi resmi atau produk yang berafiliasi dengan pemegang hak *Jujutsu Kaisen*.

## 📌 Status Proyek

Dikembangkan secara bertahap sebagai proyek pembelajaran pengembangan web full-stack, dengan fokus pada pengelolaan transaksi, autentikasi pengguna, laporan keuangan, dan konsistensi antarmuka.