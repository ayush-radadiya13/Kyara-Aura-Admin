"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DataTable({ columns, data, selectedIds, onSelectedIdsChange }) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const rowSelectionEnabled = Boolean(onSelectedIdsChange);

  useEffect(() => {
    if (!rowSelectionEnabled) return;
    const newSelection = {};
    (selectedIds || []).forEach((id) => {
      newSelection[id] = true;
    });
    setRowSelection(newSelection);
  }, [selectedIds, rowSelectionEnabled]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: rowSelectionEnabled
      ? (updater) => {
          const updatedSelection =
            typeof updater === "function" ? updater(rowSelection) : updater;
          setRowSelection(updatedSelection);
          const selected = Object.keys(updatedSelection).filter(
            (key) => updatedSelection[key]
          );
          onSelectedIdsChange(selected);
        }
      : undefined,
    enableRowSelection: rowSelectionEnabled,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row, index) => {
      if (row._id) return row._id.toString();
      if (row.id) return row.id.toString();
      return index.toString();
    },
  });

  const renderHeaderContent = (header) => {
    if (header.isPlaceholder) return null;

    const content = flexRender(header.column.columnDef.header, header.getContext());
    const canSort = header.column.getCanSort();
    const sortDirection = header.column.getIsSorted();

    if (!canSort) return content;

    return (
      <button
        type="button"
        className="flex w-full items-center gap-1 text-left font-semibold"
        onClick={header.column.getToggleSortingHandler()}
      >
        <span>{content}</span>
        <span className="text-muted-foreground">
          {sortDirection === "asc" ? (
            <ArrowUp className="size-3.5" aria-label="Sorted ascending" />
          ) : sortDirection === "desc" ? (
            <ArrowDown className="size-3.5" aria-label="Sorted descending" />
          ) : (
            <ArrowUpDown className="size-3.5" aria-label="Sort ascending or descending" />
          )}
        </span>
      </button>
    );
  };

  return (
    <Table className="w-full table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="whitespace-normal break-words border border-gray-200 bg-white px-4 py-2 text-sm font-semibold align-middle"
                style={{ width: header.column.columnDef.meta?.width }}
              >
                {renderHeaderContent(header)}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="text-black">
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className="whitespace-normal break-words border border-gray-200 px-4 py-2 align-middle text-black"
                style={{ width: cell.column.columnDef.meta?.width }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
