import { HiDotsHorizontal } from "react-icons/hi";
import { useState, useEffect } from "react";

import DeleteButton from "../buttons/DeleteButton";
import EditButton from "../buttons/EditButton";

const GridCard = ({ item, onClick, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (
        !e.target.closest(".three-dots") &&
        !e.target.closest(".dropdown-menu")
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  return (
    <div
      className=" relative cursor-pointer w-full h-48 bg-white text-black border border-black 
      dark:bg-black dark:text-white dark:border-white rounded-xl p-4 flex flex-col items-center 
      justify-center gap-2 transition shadow-sm 
      hover:shadow-[0_0_15px_3px_rgba(255,0,0,0.35)] 
      dark:hover:shadow-[0_0_15px_3px_rgba(0,122,255,0.55)] "
    >
      {/* DOTS BUTTON */}
      <button
        className="three-dots absolute top-2 right-2 p-1 rounded 
        hover:bg-red-500 hover:text-white 
        dark:hover:bg-blue-500 dark:hover:text-black"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
      >
        <HiDotsHorizontal size={22} className="dark:text-white" />
      </button>

      {/* DROPDOWN MENU */}
      {menuOpen && (
        <div
          className="
            dropdown-menu absolute top-10 right-2
            border border-black dark:border-white    /* ✔ border color */
            rounded-md
            z-20 w-40
            flex flex-col gap-2                      /* ✔ spacing */
            p-1                                      /* ✔ padding */
          "
          onClick={(e) => e.stopPropagation()}
        >

          {/* EDIT BUTTON */}
          <EditButton label="Edit" onClick={() => onEdit(item)} />

          {/* DELETE BUTTON */}
          <DeleteButton label="Delete" onClick={() => onDelete(item.id)} />

        </div>


      )}

      {/* CARD CONTENT */}
      <div onClick={() => onClick(item)}>
        <img
          src={item.logo}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-full mx-auto"
        />
        <p className="text-center font-semibold mt-2">{item.name}</p>
        {item.code && (
          <p className="text-center text-sm opacity-70">{item.code}</p>
        )}
      </div>
    </div>
  );
};

export default GridCard;
