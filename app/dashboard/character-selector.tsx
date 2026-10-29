
"use client";

import { useEffect, useState } from "react";

const characters = [
  { id: "sukuna", name: "Ryomen Sukuna" },
  { id: "gojo", name: "Satoru Gojo" },
  { id: "itadori", name: "Yuji Itadori" },
];

export default function CharacterSelector() {
  const [selected, setSelected] = useState("sukuna");

  useEffect(() => {
    const saved = localStorage.getItem("buku-tabungan-character");

    if (characters.some((character) => character.id === saved)) {
      setSelected(saved!);
    }
  }, []);

  function handleChange(value: string) {
    setSelected(value);
    localStorage.setItem("buku-tabungan-character", value);

    window.dispatchEvent(
        new CustomEvent("character-change", {
        detail: value,
        })
    );
    }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-[#15121d] px-3 py-2">
      <span className="hidden text-xs text-slate-400 sm:inline">
        Karakter
      </span>

      <select
        value={selected}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Pilih karakter dashboard"
        className="max-w-[145px] cursor-pointer bg-transparent text-sm text-white outline-none focus:text-red-300"
      >
        {characters.map((character) => (
          <option
            key={character.id}
            value={character.id}
            className="bg-[#15121d] text-white"
          >
            {character.name}
          </option>
        ))}
      </select>
    </div>
  );
}
