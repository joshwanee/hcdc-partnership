import { Link } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) => {

  // Get stored role
  const role = localStorage.getItem("role");

  // Define links based on role
  const LINKS = {
    SUPERADMIN: [
      { name: "Dashboard", path: "/superadmin/dashboard" },
      { name: "Colleges", path: "/superadmin/colleges" },
      { name: "Departments", path: "/superadmin/departments" },
      { name: "Partnerships", path: "/superadmin/partnerships" },
      { name: "Users", path: "/superadmin/users" },
      { name: "Viewing Section", path: "/superadmin/viewing-section" },
    ],

    COLLEGE_ADMIN: [
      { name: "Dashboard", path: "/college/dashboard" },
      { name: "Departments", path: "/college/departments" },
      { name: "Partnerships", path: "/college/partnerships" },
      { name: "Viewing Section", path: "/college/viewing-section" },
    ],

    DEPARTMENT_ADMIN: [
      { name: "Dashboard", path: "/department/dashboard" },
      { name: "Partnerships", path: "/department/partnerships" },
      { name: "Viewing Section", path: "/department/viewing-section" },
    ],
  };

  // pick links for current role
  const links = LINKS[role] || [];

  return (
    <div
      className={`
        fixed top-0 w-64 h-screen z-40 overflow-y-auto shadow-xl
        transform transition-transform duration-300 rounded-r-[50px]

        /* Light Mode */
        bg-white text-black border-r-4 border-red-600

        /* Dark Mode */
        dark:bg-black dark:text-white dark:border-blue-500

        ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
        lg:translate-x-0 lg:static
      `}
    >
      {/* HEADER */}
      <div className="p-4 pt-[25px] flex justify-between items-center border-b-2 border-red-600 dark:border-blue-500">
        
        <div className="text-3xl text-red-500 font-extrabold w-full text-center dark:text-blue-500">
          HCDC
          {/* {role?.replace("_", " ") || "Menu"} */}
        </div>

        <button
          className="lg:hidden text-black dark:text-white"
          onClick={() => setSidebarOpen(false)}
        >
          ✖
        </button>
      </div>

      {/* LINKS */}
      <div className="p-4 space-y-2">
        {links.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className="
              block px-4 py-3 text-lg font-medium rounded-lg 
              transition-all duration-200

              hover:bg-red-100 hover:text-red-700 hover:shadow-[0_0_8px_rgba(255,0,0,0.25)]
              dark:hover:bg-blue-900/40 
              dark:hover:text-blue-300 
              dark:hover:shadow-[0_0_10px_rgba(0,122,255,0.35)]
            "
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* DARK MODE TOGGLE */}
      <div className="p-4 border-t border-gray-300 dark:border-[#1a1a1a]">
        {darkMode ? (
          <button
            className="w-full p-2 rounded-md bg-[#111111] text-white hover:bg-[#1F1F1F] transition"
            onClick={() => {
              setDarkMode(false);
              document.documentElement.classList.remove("dark");
            }}
          >
            ☀️ Light Mode
          </button>
        ) : (
          <button
            className="w-full p-2 rounded-md bg-black text-white hover:bg-[#222222] transition"
            onClick={() => {
              setDarkMode(true);
              document.documentElement.classList.add("dark");
            }}
          >
            🌙 Dark Mode
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
