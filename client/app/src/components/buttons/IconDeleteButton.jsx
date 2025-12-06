// components/ui/IconDeleteSmall.jsx
import React from "react";

const IconDeleteButton = ({ onClick, title = "Delete" }) => {
  return (
    <button
      onClick={onClick}
      aria-label={title}
      className="
        delete-button
        h-9 w-9 flex items-center justify-center
        hover:scale-[1.03] active:scale-[0.97]
      "
      style={{ padding: 0, background: "transparent" }}
    >
      <svg
        className="trash-svg"
        viewBox="0 0 512 512"
        width="32"   // smaller to fit table
        height="32"
        style={{
          overflow: "visible",
        }}
      >
        {/* Lid */}
        <g id="lid-group" style={{ transformOrigin: "256px 120px" }}>
          <rect
            x="128"
            y="80"
            width="256"
            height="40"
            rx="8"
            fill="#f87171"
          />
          <rect
            x="200"
            y="40"
            width="112"
            height="20"
            rx="6"
            fill="#ef4444"
          />
        </g>

        {/* Bin body */}
        <rect
          x="128"
          y="120"
          width="256"
          height="312"
          rx="20"
          fill="#ef4444"
        />
        <rect x="176" y="160" width="32" height="240" fill="white" />
        <rect x="240" y="160" width="32" height="240" fill="white" />
        <rect x="304" y="160" width="32" height="240" fill="white" />
      </svg>

      {/* Custom animation styles */}
      <style>{`
        .delete-button {
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .trash-svg {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        }

        .delete-button:hover .trash-svg {
          transform: scale(1.15) rotate(3deg);
        }

        .delete-button:active .trash-svg {
          transform: scale(0.92) rotate(-1deg);
        }

        #lid-group {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: 256px 120px;
        }

        .delete-button:hover #lid-group {
          transform: rotate(-28deg) translateY(4px);
        }

        .delete-button:active #lid-group {
          transform: rotate(-12deg) scale(0.98);
        }
      `}</style>
    </button>
  );
};

export default IconDeleteButton;
