import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { removeToken, removeUserRole } from "../utils/auth";

const DepartmentAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
      try {
      const stored = localStorage.getItem("darkMode");
  
      if (stored === null || stored === "undefined") {
        return true; // default dark mode
      }
  
      return JSON.parse(stored); // parse only if valid
    } catch (e) {
      return true; // fallback to dark on parse error
    }
    });
  
    useEffect(() => {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

  return (
    <div
      className={`flex h-screen bg-gray-100 ${darkMode ? "dark" : ""} dark:bg-gray-900`}
    >
      {/* Reusable Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div
        className={`
          fixed top-0 left-0 right-0 h-[78px]
          ${darkMode ? "bg-black" : "bg-white"}
          z-0
        `}
      ></div>

      <div className="flex-1 flex flex-col h-screen">
        
        <Navbar setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 overflow-y-auto p-15 dark:bg-gray-900">

          <Outlet context={{darkMode}}/>
        </div>

      </div>
    </div>
  );
};

export default DepartmentAdminLayout;
