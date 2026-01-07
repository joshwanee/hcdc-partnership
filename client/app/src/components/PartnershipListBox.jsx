import React, { useState } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import EditButton from "./buttons/EditButton";
import DeleteButton from "./buttons/DeleteButton";

const PartnershipListBox = ({
  title,
  items = [],
  emptyMessage = "No items to display.",
  color = "blue",
  onEdit,        // callback: (partnership) => void
  onDelete,      // callback: (id) => void
}) => {

  const [menuOpen, setMenuOpen] = useState(null);

  const colorClasses = {
    yellow: "bg-yellow-100 dark:bg-yellow-700",
    red: "bg-red-100 dark:bg-red-800",
    blue: "bg-blue-100 dark:bg-blue-800",
    green: "bg-green-100 dark:bg-green-800",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-full">
      <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-blue-200">{title}</h2>

      {items.length === 0 ? (
        <p className="opacity-70 dark:text-gray-300">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((p) => (
            <li
              key={p.id}
              className={`relative p-4 rounded-lg ${colorClasses[color]} 
                         flex flex-col border border-gray-300 dark:border-gray-700`}
            >
              {/* Three dots button */}
              <button
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-200 
                           dark:hover:bg-gray-700 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === p.id ? null : p.id);
                }}
              >
                <HiDotsHorizontal size={20} className="text-gray-700 dark:text-gray-200" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen === p.id && (
                <div
                  className="absolute top-10 right-2 w-28 bg-white dark:bg-gray-900 
                             border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-20"
                >
                  <EditButton
                    onClick={() => {
                      onEdit?.(p);
                      setMenuOpen(null);
                    }}
                  />

                  <DeleteButton
                    onClick={() => {
                      if (window.confirm("Delete this partnership?")) {
                        onDelete?.(p.id);
                        setMenuOpen(null);
                      }
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex flex-col gap-1 pr-8">
                <strong className="text-gray-900 dark:text-gray-100">{p.title}</strong>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Ended: {new Date(p.date_ended).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PartnershipListBox;
