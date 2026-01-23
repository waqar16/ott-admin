import { API_BASE } from "@/lib/config";
import axios from "axios";
import { useEffect, useState } from "react";

type Option = {
  id: string;
  name: string;
};


type SingleSelectProps = {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
};
export default function SingleSelect({
  label,
  options,
  value,
  onChange,
}: SingleSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.id === value);

  const selectOption = (id: string) => {
    onChange(id);
    setOpen(false); // close after select
  };
  useEffect(() => {
    let fetch = async () => {
      let fetchUnattachedTrailers = await axios.get(`${API_BASE}/api/v1/content/frontend/search?q=the`)
    }
    fetch()
  }, [])
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      {/* Dropdown Button */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer border border-gray-600 flex justify-between items-center"
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.name : "Select option..."}
        </span>
        <span className="text-gray-400">▾</span>
      </div>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-20 w-full mt-2 bg-neutral-950 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.id === value;

            return (
              <div
                key={opt.id}
                onClick={() => selectOption(opt.id)}
                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 ${isSelected ? "bg-gray-700" : ""
                  }`}
              >

                {opt.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
