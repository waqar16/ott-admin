import { API_BASE } from "@/lib/config";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

type Option2 = {
  id: string;
  title: string;
  poster_url: string;
};
type SearchableSingleSelectProps = {
  label?: string;
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
};
export default function SearchableSingleSelect({
  label,
  value,
  onChange,
  placeholder = "Select option...",
}: SearchableSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option2[]>([]);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  /* 🔁 Fetch options from API (debounced) */
  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE}api/v1/content/search-movies`,
          { params: { q: search } }
        );

        setOptions(
          res.data || []
        );
      } catch (err) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(timeout);
  }, [search, open]);

  const selectOption = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  /* ❌ Close on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => setOpen((p) => !p)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer border border-gray-600 flex justify-between items-center"
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.title : placeholder}
        </span>
        <span className="text-gray-400">▾</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 w-full mt-2 bg-neutral-950 rounded-lg shadow-lg border border-gray-700">
          {/* 🔍 Search */}
          <div className="p-2 border-b border-gray-700">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 outline-none"
            />
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto">
            {loading && (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Searching...
              </div>
            )}

            {!loading && options.length === 0 && (
              <div className="px-4 py-3 text-gray-400 text-sm">
                No results found
              </div>
            )}

            {!loading &&
              options.map((opt) => {
                const isSelected = opt.id === value;

                return (
                  <div
                    key={opt.id}
                    onClick={() => selectOption(opt.id)}
                    className={`my-[2px] flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 ${isSelected ? "bg-gray-700" : ""
                      }`}
                  >
                    <img className='w-12 h-auto rounded-sm ' src={`${opt.poster_url}`} />
                    <span className="text-white ml-2">{opt.title} </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}