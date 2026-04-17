"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function MultiSelectCreator({ allCreators, formData, setFormData }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const toggleOpen = () => {
    if (buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
    setOpen((o) => !o);
  };

  const toggleGenre = (id: string) => {
    setFormData((prev) => {
      const exists = prev.creators.includes(id);
      return {
        ...prev,
        creators: exists
          ? prev.creators.filter((g: string) => g !== id)
          : [...prev.creators, id],
      };
    });
  };

  // ✅ Close on outside click
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Creators
        </label>

        {/* Button */}
        {allCreators.length > 0 ?<div
          ref={buttonRef}   
          onClick={toggleOpen}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-pointer border border-gray-600"
        >
          {formData.creators.length === 0 ? (
            <span className="text-gray-400">Select creators...</span>
          ) : (
            formData.creators.map((id) => {
              const g = allCreators.find((x) => x.id === id);
              return (
                <span
                  key={id}
                  className="bg-blue-600 px-2 py-1 text-xs rounded-md"
                >
                  {g?.name}
                </span>
              );
            })
          )}
        </div>:
        <div className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-not-allowed border border-gray-600">
        <span className="text-gray-400">No creators available</span>
        </div>}
      </div>

      {/* Dropdown (PORTAL) */}
      {open &&
        rect &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-neutral-950 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto minimal-scrollbar"
            style={{
              bottom:   8,
              left: rect.left,
              width: rect.width,
            }}
          >
            {allCreators.map((type) => {
              const isSelected = formData.creators.includes(type.id);

              return (
                <div
                  key={type.id}
                  onClick={() => toggleGenre(type.id)}
                  className="flex items-center px-4 py-2 text-white cursor-pointer hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="mr-3"
                  />
                  {type.name}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}