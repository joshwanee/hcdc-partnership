const EditButton = ({ label = "Edit", onClick }) => {
   return (
    <button
      onClick={onClick}
      className="
        relative w-full h-9 cursor-pointer flex items-center
        border border-blue-500 bg-blue-500 rounded-md group
        overflow-hidden transition-all duration-300
      "
    >
      {/* LABEL */}
      <span
        className="
          text-white font-semibold ml-6 text-xs
          group-hover:translate-x-10
          transition-all duration-300
        "
      >
        {label}
      </span>

      {/* ICON AREA */}
      <span
        className="
          absolute right-0 h-full w-9 rounded-md bg-blue-500 
          flex items-center justify-center
          group-hover:w-full group-hover:translate-x-0
          transition-all duration-300
        "
      >
        <svg
          className="w-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
        </svg>
      </span>
    </button>
  );
};

export default EditButton;
