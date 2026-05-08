"use client";

export function SortHeader({ label, sortKey, current, order, onSort }) {
  const isActive = current === sortKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey, isActive && order === "asc" ? "desc" : "asc")}
      className="w-full text-left leading-snug break-words whitespace-normal"
    >
      {label}
      {isActive && (
        <span className="ml-1 text-xs">{order === "asc" ? "▲" : "▼"}</span>
      )}
    </button>
  );
}
