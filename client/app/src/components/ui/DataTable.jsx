import { useState, useEffect } from "react";
import IconEditButton from "../buttons/IconEditButton";
import IconDeleteButton from "../buttons/IconDeleteButton";

/**
 * Responsive Breakpoints:
 * sm (<640px): ONLY first column visible, others stacked under it.
 * md (≥640px & <1024px): Show first 2 columns, rest stacked.
 * lg (≥1024px): Show full table normally.
 */
const DataTable = ({ columns = [], data = [], loading = false, onEdit, onDelete }) => {
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

  return (
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
            [...Array(5)].map((_, i) => (
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
            data.map((row, rowIndex) => (
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
  );
};

export default DataTable;
