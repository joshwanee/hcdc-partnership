import { useState, useEffect } from "react";
import ProfileDropdown from "./modals/ProfileDropdown";
import api from "../api";

// React icon library (lucide)
import { User, ChevronDown, Sun, Moon } from "lucide-react";

const Navbar = ({ setSidebarOpen, darkMode, setDarkMode }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [headerTitle, setHeaderTitle] = useState("SYSTEM ADMINISTRATOR");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const loadRoleInfo = async () => {
      if (!user) return;

      if (user.role === "SUPERADMIN") {
        setHeaderTitle("SUPER ADMIN PANEL");
        return;
      }

      if (user.role === "COLLEGE_ADMIN" && user.college) {
        try {
          const res = await api.get(`colleges/${user.college}/`);
          setHeaderTitle(
            (res.data.code || res.data.name || "COLLEGE").toUpperCase()
          );
        } catch {
          setHeaderTitle("COLLEGE ADMIN");
        }
        return;
      }

      if (user.role === "DEPARTMENT_ADMIN" && user.department) {
        try {
          const res = await api.get(`departments/${user.department}/`);
          setHeaderTitle(
            (res.data.code || res.data.name || "DEPARTMENT").toUpperCase()
          );
        } catch {
          setHeaderTitle("DEPARTMENT ADMIN");
        }
        return;
      }

      setHeaderTitle("DASHBOARD");
    };

    loadRoleInfo();
  }, []);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 h-[78px]
          bg-white dark:bg-black
          flex justify-between items-center p-4 z-30
          border-b-2 border-red-600 dark:border-blue-500
          lg:ml-64
        `}
      >
        {/* Mobile Menu Button */}
        <button
          className="p-2 text-2xl lg:hidden text-black dark:text-white"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <h1 className="text-xl font-bold text-black dark:text-white">
          {headerTitle}
        </h1>

        <div className="flex items-center">
          {/* Theme Toggle (moved from Sidebar) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full 
                        bg-white text-yellow-600 
                        dark:bg-gray-900 dark:text-blue-300
                        border border-gray-300 dark:border-gray-600
                        shadow-md hover:shadow-lg 
                        transition-all mr-3"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile Button (User icon + arrow) */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={(e) => {
              e.stopPropagation(); // VERY IMPORTANT
              setOpenMenu((prev) => !prev); // toggle open/close
            }}
          >
            <div
              className="
                w-10 h-10 flex items-center justify-center rounded-full
                bg-gray-300 dark:bg-gray-700 
                border border-gray-500 dark:border-gray-400
              "
            >
              <User size={20} className="text-black dark:text-white" />
            </div>

            <ChevronDown
              size={22}
              className={`
                text-black dark:text-white
                transition-transform duration-300
                ${openMenu ? "rotate-180" : "rotate-0"}
              `}
            />
          </div>
        </div>

      </header>

      {/* Dropdown */}
      {openMenu && <ProfileDropdown onClose={() => setOpenMenu(false)} />}
    </>
  );
};

export default Navbar;
