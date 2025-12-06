import { useState } from "react";
import ViewingSection from "./ViewingSection";
import { Sun, Moon } from "lucide-react";
import Login from "./Login"; // <— using your Login.jsx

export default function PublicViewPage() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-slate-900 ${darkMode ? "dark" : ""}`}>
      {/* NAVBAR */}
      <nav className="w-full sticky top-0 z-50 flex items-center justify-between px-6 py-4 shadow-sm bg-[#af0b00] dark:bg-blue-900 backdrop-blur-sm bg-opacity-95">
        <div className="text-xl font-bold text-white">Holy Cross of Davao College</div>
        <div className="flex items-center gap-4">
          
          {/* THEME TOGGLE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full 
                      bg-white text-yellow-600 
                      dark:bg-gray-900 dark:text-blue-300
                      border border-gray-300 dark:border-gray-600
                      shadow-md hover:shadow-lg 
                      transition-all"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* LOGIN BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 
                      font-semibold rounded-lg 
                      bg-white text-red-700 
                      dark:bg-gray-900 dark:text-blue-300
                      border border-gray-300 dark:border-gray-600
                      shadow-md hover:shadow-lg hover:scale-105 
                      transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h12.5A2.5 2.5 0 0121 14.5v4a2.5 2.5 0 01-2.5 2.5H7m0-11V7a2 2 0 012-2h8a2 2 0 012 2v2m0 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v4"
              />
            </svg>
            Login
          </button>
        </div>
      </nav>

      {/* MODAL WITH IMPORTED LOGIN COMPONENT */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md">
            
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-50 bg-white dark:bg-gray-700 
                         text-gray-700 dark:text-gray-300 
                         px-3 py-1 rounded-full shadow hover:shadow-lg"
            >
              ✖
            </button>

            {/* LOGIN COMPONENT */}
            {open && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <Login onClose={() => setOpen(false)} />
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEWING SECTION */}
      <div className="flex-1">
        <ViewingSection />
      </div>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 flex-shrink-0 bg-[#af0b00] dark:bg-blue-900">
        <p className="text-sm text-white dark:text-gray-300">© 2025 My Website. All rights reserved.</p>
      </footer>
    </div>
  );
}
