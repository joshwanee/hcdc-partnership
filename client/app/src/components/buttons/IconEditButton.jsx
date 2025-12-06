const IconEditButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Edit"
      className="
        icon-edit-btn
        relative w-9 h-9 rounded-lg cursor-pointer
        flex items-center justify-center
        bg-[#5d5d74] dark:bg-[#6d6d90]
        shadow-md transition-all duration-300
        overflow-hidden
      "
    >
      {/* Glow Effect */}
      <span
        className="
          edit-glow absolute w-[200%] h-[200%]
          bg-[#6a6a92] dark:bg-[#7a7aac]
          rounded-full blur-md
          scale-0 transition-all duration-300 z-[1]
        "
      ></span>

      {/* Larger Pencil Icon */}
      <svg
        className="
          edit-icon z-[3] w-[18px] h-[18px] 
          fill-white transition-all duration-200 origin-bottom
        "
        viewBox="0 0 24 24"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
      </svg>

      {/* Underline */}
      <span
        className="
          edit-underline absolute bottom-[4px]
          w-5 h-[2px] bg-white rounded
          scale-x-0 origin-left
          transition-transform duration-[550ms] ease-out z-[2]
        "
      ></span>

      <style>{`
        .icon-edit-btn:hover .edit-glow {
          transform: scale(1);
        }
        .icon-edit-btn:hover .edit-icon {
          transform: rotate(-15deg) translateX(3px);
        }
        .icon-edit-btn:hover .edit-underline {
          transform: scaleX(1);
        }
      `}</style>
    </button>
  );
};

export default IconEditButton;
