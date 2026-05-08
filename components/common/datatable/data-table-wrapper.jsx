"use client";

import { useMemo } from "react";
import { DatatableLoader } from "@/components/common/datatable-loader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_PAGE_LIMIT } from "@/lib/constants";
import DataTable from "./data-table";
import { Pagination } from "./data-table-pagination";
import { SearchInput } from "./search-input";

export function DataTableWrapper({
  title,
  addLabel = "Add New",
  onAddAction,
  onSearchAction,

  offset = 0,
  limit = DEFAULT_PAGE_LIMIT,
  total = 0,

  search,
  sortAttr,
  sort,
  onPageChangeAction,
  onSortChangeAction,
  onDeleteAction,
  onEditAction,
  selectedIds,
  onSelectedIdsChange,
  data,
  isLoading,
  getColumns,
}) {
  const pageLimit = limit;
  const currentPage = pageLimit > 0 ? Math.floor(offset / pageLimit) + 1 : 1;

  const columns = useMemo(
    () =>
      getColumns(
        sortAttr,
        sort,
        onSortChangeAction,
        onDeleteAction,
        onEditAction
      ),
    [
      sortAttr,
      sort,
      onSortChangeAction,
      onDeleteAction,
      onEditAction,
      getColumns,
    ]
  );

  const showToolbar = Boolean(title || onAddAction);

  return (
    <div className="flex flex-col bg-white">
      {showToolbar && (
        <>
          <div className="mt-4 px-6">
            <div className="flex items-center justify-between">
              {title ? <h2 className="text-xl font-semibold">{title}</h2> : <span />}
              {onAddAction && <Button onClick={onAddAction}>{addLabel}</Button>}
            </div>
          </div>
          <div className="mt-4">
            <hr />
          </div>
        </>
      )}

      <div className="mt-4 flex items-center justify-between px-5">
        <div className="flex items-center">
          <SearchInput
            className="w-[360px]"
            debounce={550}
            onSearchAction={onSearchAction}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>

          <Select
            value={String(pageLimit)}
            onValueChange={(val) => {
              const newLimit = Number(val);
              onPageChangeAction?.(0, newLimit);
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={limit} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-gray-600">entries</span>
        </div>
      </div>

      <div className="p-4">
        <div className="relative bg-white">
          <DatatableLoader isLoading={isLoading} />

          <DataTable
            key={`${offset}-${search}-${sortAttr}-${sort}`}
            columns={columns}
            data={data}
            selectedIds={selectedIds}
            onSelectedIdsChange={onSelectedIdsChange}
          />
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalCount={total}
        limit={pageLimit}
        onPageChange={(page, newLimit, newOffset) => {
          onPageChangeAction?.(newOffset, newLimit);
        }}
      />
    </div>
  );
}
