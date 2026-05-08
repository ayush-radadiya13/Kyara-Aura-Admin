"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

export function SearchInput({
  placeholder = "",
  onSearchAction,
  className = "",
  debounce = 0,
}) {
  const [value, setValue] = useState("");
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);

    if (debounce > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchAction(val);
      }, debounce);
    }
  };

  const triggerSearch = () => {
    onSearchAction(value);
  };

  const clearSearch = () => {
    setValue("");
    onSearchAction("");
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-700">Search:</span>

      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") triggerSearch();
          }}
          className="h-8 w-[min(100%,360px)] max-w-[360px] rounded-none bg-white pl-2 pr-7 text-sm"
        />

        {value && (
          <X
            onClick={clearSearch}
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            size={14}
          />
        )}
      </div>
    </div>
  );
}
