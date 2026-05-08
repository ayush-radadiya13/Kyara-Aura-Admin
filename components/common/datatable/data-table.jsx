"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className="whitespace-normal break-words border border-gray-200 px-4 py-2 align-middle"
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
