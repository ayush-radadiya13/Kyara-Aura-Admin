"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SEARCH_INPUT_WIDTH = "w-[455px]";

export function SearchInput({
  placeholder = "",
  value: controlledValue,
  onSearchAction,
  className = "",
  debounce = 0,
}) {
  const [value, setValue] = useState(controlledValue ?? "");
  const debounceRef = useRef(null);
  const lastControlledValueRef = useRef(controlledValue);

  useEffect(() => {
    if (
      controlledValue !== undefined &&
      controlledValue !== lastControlledValueRef.current
    ) {
      lastControlledValueRef.current = controlledValue;
      const timeoutId = setTimeout(() => setValue(controlledValue), 0);

      return () => clearTimeout(timeoutId);
    }
  }, [controlledValue]);

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
    <div className={cn("flex items-center gap-2", className)}>
      <span className="shrink-0 text-sm text-gray-700">Search:</span>

      <div className={cn("relative shrink-0", SEARCH_INPUT_WIDTH)}>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") triggerSearch();
          }}
          className="h-[35px] w-full rounded-none bg-white pl-2 pr-7 text-sm"
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
