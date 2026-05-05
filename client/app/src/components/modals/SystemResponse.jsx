import { useEffect, useState } from "react";

const SystemResponse = ({ message, type = "success", onClose }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFading(true), 1500);
    const closeTimer = setTimeout(onClose, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className={`
        /* Positioning & Responsiveness */
        fixed z-[9999] top-5 left-1/2 -translate-x-1/2 
        sm:top-10 sm:right-5 sm:left-auto sm:translate-x-0
        
        /* Sizing & Layout */
        flex items-center w-[90%] max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-md
        
        /* Animation */
        transition-all duration-500 ease-in-out
        ${isFading ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}
        
        /* Light/Dark Mode Theming */
        ${
          isSuccess
            ? "bg-green-50/90 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-100"
            : "bg-red-50/90 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-100"
        }
      `}
    >
      {/* Icon Container */}
      <div
        className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg 
          ${
            isSuccess
              ? "bg-green-200 text-green-700 dark:bg-green-500 dark:text-white"
              : "bg-red-200 text-red-700 dark:bg-red-500 dark:text-white"
          }`}
      >
        {isSuccess ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      {/* Message Text */}
      <div className="ms-3 text-sm font-bold tracking-tight">
        {message}
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="ms-auto -mx-1.5 p-1.5 inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <span className="sr-only">Close</span>
        <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default SystemResponse;