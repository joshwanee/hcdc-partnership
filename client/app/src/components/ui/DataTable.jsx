import { useState, useEffect } from "react";
import IconEditButton from "../buttons/IconEditButton";
import IconDeleteButton from "../buttons/IconDeleteButton";

/**
 * Responsive Breakpoints:
 * sm (<640px): ONLY first column visible, others stacked under it.
 * md (≥640px & <1024px): Show first 2 columns, rest stacked.
 * lg (≥1024px): Show full table normally.
 */
const DataTable = ({ columns = [], data = [], loading = false, onEdit, onDelete, pageSize = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [screen, setScreen] = useState({
    sm: window.innerWidth < 640,
    md: window.innerWidth >= 640 && window.innerWidth < 1024,
    lg: window.innerWidth >= 1024,
  });

  useEffect(() => {
    const handleResize = () =>
      setScreen({
        sm: window.innerWidth < 640,
        md: window.innerWidth >= 640 && window.innerWidth < 1024,
        lg: window.innerWidth >= 1024,
      });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl shadow-md border border-gray-300 dark:border-gray-700">
        <table className="w-full border-collapse">

          {/* ===== TABLE HEADER (hide on mobile) ===== */}
          {!screen.sm && (
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                {columns.map((col, index) => {
                  // md: show only first 2 columns
                  if (screen.md && index > 1) return null;

                  return (
                    <th
                      key={index}
                      className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {col.header}
                    </th>
                  );
                })}

                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
          )}

          <tbody className="bg-white dark:bg-black">

            {/* ===== LOADING SKELETON ===== */}
            {loading &&
              [...Array(Math.min(pageSize, 5))].map((_, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-gray-700 animate-pulse">
                  <td colSpan={columns.length + 1} className="px-4 py-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                  </td>
                </tr>
              ))}

            {/* ===== EMPTY MESSAGE ===== */}
            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No records found.
                </td>
              </tr>
            )}

            {/* ===== ROWS ===== */}
            {!loading &&
              currentData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="
                    border-t border-gray-200 dark:border-gray-700
                    hover:bg-gray-100 dark:hover:bg-gray-900 transition
                  "
                >
                  {/* ALWAYS VISIBLE FIRST COLUMN */}
                  <td className="px-4 py-3 align-top max-w-[200px]">
                    <span className="font-semibold truncate block">
                      {row[columns[0].accessor]}
                    </span>

                    {/* 🔥 STACKED DETAILS for sm + md */}
                    {(screen.sm || screen.md) && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">

                        {columns.slice(screen.md ? 2 : 1).map((col, idx) => (
                          <div key={idx} className="truncate">
                            <span className="font-semibold">{col.header}: </span>
                            {row[col.accessor] || "—"}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* ===== DESKTOP & TABLET VISIBLE COLUMNS ===== */}
                  {!screen.sm &&
                    columns.map((col, index) => {
                      if (index === 0) return null; // first handled already

                      // md: show only first 2 columns (0 + 1)
                      if (screen.md && index > 1) return null;

                      return (
                        <td
                          key={index}
                          className="px-4 py-3 text-gray-800 dark:text-gray-200 truncate max-w-[220px]"
                        >
                          {row[col.accessor]}
                        </td>
                      );
                    })}

                  {/* ACTIONS */}
                  <td className="px-4 py-3 flex items-center justify-center gap-3">
                    <IconEditButton onClick={() => onEdit(row)} />
                    <IconDeleteButton onClick={() => onDelete(row.id)} />
                  </td>
                </tr>
              ))}

          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION CONTROLS ===== */}
      {!loading && data.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-gray-700 dark:text-gray-300">
              {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
