"use client";

export const Pagination = ({
  currentPage,
  totalCount,
  limit,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 1;

  const goToPage = (page, newLimit = limit) => {
    if (page < 1 || page > totalPages) return;

    const offset = (page - 1) * newLimit;
    onPageChange(page, newLimit, offset);
  };

  const start = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;

  const end = totalCount === 0 ? 0 : Math.min(currentPage * limit, totalCount);

  const buildPageNumbers = () => {
    const pages = [];
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);

      if (left > 2) pages.push("dots-left");

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < totalPages - 1) pages.push("dots-right");

      pages.push(totalPages);
    }
    return pages;
  };

  const pages = buildPageNumbers();

  return (
    <div className="mt-0 mb-5 flex w-full flex-col items-center justify-between bg-white px-4 sm:flex-row">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Showing {start} to {end} of {totalCount} entries
        </div>
      </div>

      <div className="flex items-center border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1 || totalPages === 0}
          className={`px-3 py-1 text-sm transition ${
            currentPage === 1 ? "text-gray-400" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Previous
        </button>

        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              type="button"
              key={`page-${p}`}
              onClick={() => goToPage(p)}
              className={`px-3 py-2 text-sm transition ${
                p === currentPage
                  ? "bg-[#405287] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">
              ...
            </span>
          )
        )}

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-3 py-1 text-sm transition ${
            currentPage >= totalPages ? "text-gray-400" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
