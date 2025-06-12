"use client";
import React from "react";

export default function CustomPagination({
  page,
  pages,
  rowsPerPage,
  handleChangeRowsPerPage,
  setPage,
  children,
}) {
  const isFirst = page === 1;
  const isLast = page === pages || pages === 0;

  return (
    <>
      <div className="w-full bg-[#EDEBEB] border-t border-[#DADADA] flex justify-end items-center px-10 py-4 fixed bottom-0 left-0 z-10">
        <span className="text-sm text-default-600 mr-3">Items per page:</span>
        <select
          value={rowsPerPage}
          onChange={handleChangeRowsPerPage} // Pass the event directly
          className="py-2 px-4 rounded bg-transparent text-sm text-default-600 mr-10 border border-[#EDEBEB] focus:ring-2 focus:ring-[#FC9D25] focus:outline-none min-w-[60px]"
          style={{ fontSize: "1rem" }}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={150}>150</option>
          <option value={250}>250</option>
        </select>
        <div className="ml-4 flex items-center bg-white rounded-2xl shadow-sm px-3 py-1 min-w-[110px]">
          <button
            onClick={() => setPage(page - 1)}
            disabled={isFirst}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
              isFirst
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-500"
            }`}
            aria-label="Previous page"
            type="button"
          >
            &lt;
          </button>
          <span className="w-8 h-8 flex items-center justify-center font-medium text-gray-800 select-none text-base">
            {page}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={isLast}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
              isLast
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-500"
            }`}
            aria-label="Next page"
            type="button"
          >
            &gt;
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
