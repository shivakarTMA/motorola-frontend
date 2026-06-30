import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const Pagination = ({
  page,
  totalPages,
  rowsPerPage,
  totalCount,
  currentDataLength,
  onPageChange,
}) => {
  if (totalCount <= rowsPerPage) {
    return null;
  }

  const start = currentDataLength === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end =
    currentDataLength === 0 ? 0 : (page - 1) * rowsPerPage + currentDataLength;

  // Compute page numbers
  let pagesToShow = [];
  if (totalPages <= 3) {
    pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (page === 1) {
    pagesToShow = [1, 2, 3];
  } else if (page === totalPages) {
    pagesToShow = [totalPages - 2, totalPages - 1, totalPages];
  } else {
    pagesToShow = [page - 1, page, page + 1];
  }

  return (
    <div className="flex justify-between items-center mt-4 gap-2 flex-wrap">
      {/* Showing Info */}
      <p className="text-gray-700 text-sm">
        Showing {start} to {end} of {totalCount} entries
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 border rounded disabled:opacity-50 text-sm"
        >
          <FaAngleLeft />
        </button>

        {/* Page Numbers */}
        {pagesToShow[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 border rounded text-sm"
            >
              1
            </button>
            <span className="px-2">...</span>
          </>
        )}

        {pagesToShow.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 border rounded transition ${
              page === p
                ? "bg-[var(--primarycolor)] text-white font-[500] text-sm"
                : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        {pagesToShow[pagesToShow.length - 1] < totalPages && (
          <>
            <span className="px-2">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 border rounded text-sm"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-2 border rounded disabled:opacity-50 text-sm"
        >
          <FaAngleRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
