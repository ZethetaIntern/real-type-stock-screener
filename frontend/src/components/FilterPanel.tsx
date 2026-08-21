"use client";

import { useState } from "react";

interface FilterPanelProps {
  onFilterChange: (filters: {
    search: string;
    sectors: string[];
    minVolume: number;
  }) => void;
}

const sectors = ["Energy", "IT", "Banking", "Telecom", "FMCG", "Construction", "Pharma", "Metals", "Infrastructure"];

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [minVolume, setMinVolume] = useState(0);

  const handleSectorToggle = (sector: string) => {
    const newSectors = selectedSectors.includes(sector)
      ? selectedSectors.filter((s) => s !== sector)
      : [...selectedSectors, sector];
    setSelectedSectors(newSectors);
    onFilterChange({ search, sectors: newSectors, minVolume });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, sectors: selectedSectors, minVolume });
  };

  const handleVolumeChange = (value: number) => {
    setMinVolume(value);
    onFilterChange({ search, sectors: selectedSectors, minVolume: value });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Search</label>
        <input
          type="text"
          placeholder="Search symbol or name..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Min Volume</label>
        <input
          type="number"
          placeholder="0"
          value={minVolume || ""}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Sectors</label>
        <div className="flex flex-wrap gap-2">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => handleSectorToggle(sector)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedSectors.includes(sector)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}