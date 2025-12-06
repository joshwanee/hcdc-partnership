const AddButton = ({ label = "Add Item", onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        relative h-10 cursor-pointer flex items-center
        border border-green-500 bg-green-500 rounded-lg group
        overflow-hidden transition-all duration-300
        px-4 pr-12     /* gives space for long labels */
        min-w-[140px]  /* prevents shrinking */
      "
    >
      {/* LABEL */}
      <span
        className="
          text-white font-semibold whitespace-nowrap
          transition-all duration-300
          group-hover:translate-x-8
        "
      >
        {label}
      </span>

      {/* ICON WRAPPER */}
      <span
        className="
          absolute right-0 top-0 h-full w-10
          bg-green-500 rounded-lg flex items-center justify-center
          transition-all duration-300
          group-hover:w-full
        "
      >
        <svg
          className="w-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
    </button>
  );
};

export default AddButton;
