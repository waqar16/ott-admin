import React from "react";
export default function MultiSelect({ allGenre, formData, setFormData }) {
  const [open, setOpen] = React.useState(false);

  const toggleGenre = (id: string) => {
    setFormData((prev) => {
      const exists = prev.genres.includes(id);
      return {
        ...prev,
        genres: exists
          ? prev.genres.filter((g: string) => g !== id)
          : [...prev.genres, id],
      };
    });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Genre
      </label>

      {/* Dropdown Button */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-pointer border border-gray-600"
      >
        {formData.genres.length === 0 ? (
          <span className="text-gray-400">Select genres...</span>
        ) : (
          formData.genres.map((id) => {
            const g = allGenre.find((x) => x.id === id);
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
      </div>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-20 w-full mt-2 bg-neutral-950 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto">
          {allGenre.map((type: { id: string; name: string }) => {
            const isSelected = formData.genres.includes(type.id);

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
        </div>
      )}
    </div>
  );
}