
"use client";

import { useEffect, useState } from "react";

const characters = {
  sukuna: {
    name: "Ryomen Sukuna",
    image: "/images/characters/sukuna.jpg",
    theme: "King of Curses",
  },
  gojo: {
    name: "Satoru Gojo",
    image: "/images/characters/gojo.jpg",
    theme: "Limitless",
  },
  itadori: {
    name: "Yuji Itadori",
    image: "/images/characters/itadori.jpeg",
    theme: "Cursed Energy",
  },
} as const;

type CharacterId = keyof typeof characters;

function isCharacterId(value: string): value is CharacterId {
  return value in characters;
}

export default function CharacterBanner({
  username,
}: {
  username: string;
}) {
  const [selected, setSelected] = useState<CharacterId>("sukuna");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("buku-tabungan-character");

      if (saved && isCharacterId(saved)) {
        setSelected(saved);
      }
    } catch {
      // Gunakan Sukuna jika localStorage tidak tersedia.
    }

    const handleCharacterChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (isCharacterId(customEvent.detail)) {
        setSelected(customEvent.detail);
      }
    };

    window.addEventListener(
      "character-change",
      handleCharacterChange
    );

    return () => {
      window.removeEventListener(
        "character-change",
        handleCharacterChange
      );
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("buku-tabungan-character", selected);
    } catch {
      // Banner tetap berfungsi meskipun penyimpanan tidak tersedia.
    }
  }, [selected]);

  const character = characters[selected];

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-red-500/25 bg-[#11111b]">
      {/* Gambar karakter sebagai background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `url("${character.image}")`,
        }}
      />

      {/* Overlay supaya teks tetap terbaca */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#100d17] via-[#100d17]/75 to-[#100d17]/10"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#090b13]/75 via-transparent to-black/10"
      />

      {/* Aksen merah */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-1 w-2/3 bg-gradient-to-r from-red-500 via-red-400/50 to-transparent"
      />

      <div className="relative flex min-h-[300px] items-center p-5 sm:min-h-[340px] sm:p-8">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
            {character.theme}
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white sm:text-4xl">
            Halo, {username}!
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
            Kendalikan keuanganmu, catat setiap transaksi, dan bangun
            masa depan finansialmu selangkah demi selangkah.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-black/30 px-3 py-1.5 text-xs text-red-200 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]" />
            Financial Domain: Active
          </div>
        </div>
      </div>
    </section>
  );
}
