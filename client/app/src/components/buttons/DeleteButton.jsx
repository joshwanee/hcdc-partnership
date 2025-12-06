import { useState } from "react";

const DeleteButton = ({ label = "Delete", onClick }) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="
        relative w-full h-9 cursor-pointer flex items-center
        bg-red-600 rounded-md shadow
        transition-all duration-200
        overflow-hidden
      "
    >
      {/* LABEL */}
      <span
        className="
          text-white font-semibold ml-8 text-xs
          transition-all duration-200
        "
      >
        {label}
      </span>

      {/* ICON AREA */}
      <span
        className="
          absolute right-0 h-full w-9 flex items-center justify-center
          border-l border-red-700
          transition-all duration-200
        "
      >

        {/* ANIMATED ICONS */}
        <div className="relative w-4 h-4">

          {/* TRASH ICON (hidden on hover) */}
          <svg
            className={`absolute inset-0 w-4 h-4 fill-white transition-all duration-200 
              ${hover ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
            viewBox="0 0 24 24"
          >
            <path d="M3 6h18" />
            <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>

          {/* X ICON (visible on hover) */}
          <svg
            className={`absolute inset-0 w-4 h-4 stroke-white stroke-2 transition-all duration-200 
              ${hover ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>

        </div>

      </span>

      {/* HOVER EFFECTS */}
      <style>
        {`
        button:hover span.ml-8 {
          color: transparent;
        }
        button:hover span.absolute {
          width: 100%;
          border-left: none;
          transform: translateX(0);
        }
        button:active svg {
          transform: scale(0.85);
        }
      `}
      </style>
    </button>
  );
};

export default DeleteButton;
