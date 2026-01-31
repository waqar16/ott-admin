import { BiX } from "react-icons/bi";
import React from "react";
type TagInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export default function TagInput({
  label,
  values,
  onChange,
  placeholder = "Type and press Enter",
}: TagInputProps) {
  const [input, setInput] = React.useState("");

  const addTag = () => {
    const value = input.trim();
    if (!value || values.includes(value)) return;

    onChange([...values, value]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  return (
    <div>
      <label className="block text-sm text-gray-300 ">{label}</label>

      <div className="flex flex-wrap gap-2 mb-3">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-red-300"
            >
              <BiX size={14} />
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTag()}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
      />
    </div>
  );
}