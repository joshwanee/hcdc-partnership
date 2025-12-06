import { Link } from "react-router-dom";

const CollegeAdminSidebar = ({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) => {
  const links = [
    { name: "Dashboard", path: "/college/dashboard" },
    { name: "Departments", path: "/college/departments" },
    { name: "Partnerships", path: "/college/partnerships" },
    // { name: "Users", path: "/college/users" },
  ];

  return (
    <div
      className={`fixed bg-gray-100 dark:bg-gray-900 w-64 h-screen 
      overflow-y-auto shadow z-40 transform transition-transform duration-300
      ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} 
      lg:translate-x-0 lg:static`}
    >
      {/* Header */}
      <div className="p-4 pt-8 flex justify-between border-b border-gray-300 lg:pt-7">
        <div className="text-xl font-bold dark:text-gray-100">College Admin</div>
        <button className="lg:hidden dark:text-gray-100" onClick={() => setSidebarOpen(false)}>
          X
        </button>
      </div>

      {/* Links */}
      <div className="p-4 space-y-2">
        {links.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className="block p-2 text-xl dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Dark mode toggle */}
      <div className="p-4">
        {darkMode ? (
          <button className="p-2 bg-black text-white rounded" onClick={() => setDarkMode(false)}>
            ☀️
          </button>
        ) : (
          <button className="p-2 bg-black text-white rounded" onClick={() => setDarkMode(true)}>
            🌙
          </button>
        )}
      </div>
    </div>
  );
};

export default CollegeAdminSidebar;
