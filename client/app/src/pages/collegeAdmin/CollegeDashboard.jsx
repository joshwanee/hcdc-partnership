import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api";
import { motion, useInView } from "framer-motion";
import { HiDotsHorizontal } from "react-icons/hi";

import EditPartnershipModal from "../../components/modals/EditPartnershipModal";
import ImageWithFallback from "../../components/ImageWithFallback";
import EditButton from "../../components/buttons/EditButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import PartnershipListBox from "../../components/PartnershipListBox";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid,
} from "recharts";

const CollegeAdminDashboard = () => {
  // reading darkMode from outlet context like your other dashboards
  const { darkMode } = useOutletContext();

  

  // stats
  const [stats, setStats] = useState({
    departments: 0,
    partnerships: 0,
    active_partnerships: 0,
    users: 0,
  });

  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [collegePartners, setCollegePartners] = useState([]);

  const [growth, setGrowth] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [topDepartments, setTopDepartments] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  // theme colors
  const strokeColor = darkMode ? "#3b82f6" : "#ef4444";
  const textColor = darkMode ? "#e2e8f0" : "#374151";
  const barColor = darkMode ? "#3b82f6" : "#ef4444";
  const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

  // framer motion variant
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  // get current user & college id
  const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
  const collegeId = storedUser?.college;

  // TRACK VISIBILITY
  const growthRef = useRef(null);
  const isInView = useInView(growthRef, { once: false, amount: 0.3 });
  const [chartKey, setChartKey] = useState(0);

  const handleEdit = (p) => {
  setSelectedPartnership(p);
  setShowEditModal(true);
};

const handleDelete = async (id) => {
  await api.delete(`/partnerships/${id}/`);
  loadLatest(); // or any refresh function
};

  // When the chart enters the screen → update key → animation restarts
  useEffect(() => {
    if (isInView) {
      setChartKey((prev) => prev + 1);
    }
  }, [isInView]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!collegeId) {
        console.error("College ID missing for College Admin!");
        setLoading(false);
        return;
      }

      try {
        // Fetch departments for this college
        const [deptRes, partnerRes, usersRes, growthRes] = await Promise.all([
          api.get(`departments/?college=${collegeId}`),
          api.get("partnerships/"),
          api.get("users/"),
          api.get("partnerships/growth/"), // get_queryset will ensure it's college-scoped for this user
        ]);

        const departments = Array.isArray(deptRes.data) ? deptRes.data : [];
        const partnerships = Array.isArray(partnerRes.data) ? partnerRes.data : [];
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const growthData = Array.isArray(growthRes.data) ? growthRes.data : [];

        // Filter partnerships to those that belong to departments under this college
        const deptIds = departments.map((d) => d.id);
        const collegePartners = partnerships.filter((p) => deptIds.includes(p.department));

        // Stats
        const activeCount = collegePartners.filter((p) => (p.status || "").toLowerCase() === "active").length;
        setStats({
          departments: departments.length,
          partnerships: collegePartners.length,
          active_partnerships: activeCount,
          users: users.filter((u) => {
            // try to filter users that belong to this college - check both user.college and user.department
            if (u.college) return u.college === collegeId;
            if (u.department) {
              const deptMatch = departments.find((d) => d.id === u.department);
              return !!deptMatch;
            }
            return false;
          }).length,
        });

        // Growth: backend should already return only college's growth if get_queryset is set for college admin
        // But as a fallback, if growthRes includes non-college data, we will try to use it directly.
        setGrowth(growthData);

        // Users by role (filtered to college)
        const roleCount = {};
        users.forEach((u) => {
          const belongsToCollege = (() => {
            if (u.college) return u.college === collegeId;
            if (u.department) return deptIds.includes(u.department);
            return false;
          })();
          if (!belongsToCollege) return;
          roleCount[u.role] = (roleCount[u.role] || 0) + 1;
        });
        setUserRoles(Object.entries(roleCount).map(([role, count]) => ({ role, count })));

        // Top departments by partnerships (count partnerships per dept and map to department name)
        const deptCountMap = {};
        collegePartners.forEach((p) => {
          deptCountMap[p.department] = (deptCountMap[p.department] || 0) + 1;
        });
        const deptRank = Object.entries(deptCountMap)
          .map(([deptId, count]) => {
            const dept = departments.find((d) => d.id === Number(deptId) || deptId === d.id);
            return { id: dept?.id ?? deptId, department: dept?.name ?? `Dept ${deptId}`, count };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopDepartments(deptRank);

        // Latest 3 partnerships for this college
        const latestThree = [...collegePartners]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setLatest(latestThree);
        setCollegePartners(collegePartners);

      } catch (err) {
        console.error("Error fetching college dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeId]);

  const loadLatest = async () => {
  try {
    const res = await api.get("partnerships/");
    const departments = topDepartments.map((d) => d.id);

    // Filter partnerships belonging to the college (same as fetchAll logic)
    const collegePartners = res.data.filter((p) =>
      departments.includes(p.department)
    );

    const latestThree = [...collegePartners]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    setLatest(latestThree);
  } catch (error) {
    console.error("Failed to reload latest partnerships", error);
  }
};

const refreshDashboard = async () => {
  try {
    const [deptRes, partnerRes, usersRes, growthRes] = await Promise.all([
      api.get(`departments/?college=${collegeId}`),
      api.get("partnerships/"),
      api.get("users/"),
      api.get("partnerships/growth/"),
    ]);

    const departments = deptRes.data || [];
    const partnerships = partnerRes.data || [];
    const users = usersRes.data || [];
    const growthData = growthRes.data || [];

    const deptIds = departments.map(d => d.id);
    const collegePartners = partnerships.filter(p => deptIds.includes(p.department));

    // update everything
    setCollegePartners(collegePartners);

    const activeCount = collegePartners.filter((p) => p.status === "active").length;

    setStats({
      departments: departments.length,
      partnerships: collegePartners.length,
      active_partnerships: activeCount,
      users: users.filter((u) =>
        (u.college && u.college === collegeId) ||
        (u.department && deptIds.includes(u.department))
      ).length,
    });

    setGrowth(growthData);

    const roleCount = {};
    users.forEach((u) => {
      if ((u.college === collegeId) || deptIds.includes(u.department)) {
        roleCount[u.role] = (roleCount[u.role] || 0) + 1;
      }
    });
    setUserRoles(Object.entries(roleCount).map(([role, count]) => ({ role, count })));

    const deptCountMap = {};
    collegePartners.forEach((p) => {
      deptCountMap[p.department] = (deptCountMap[p.department] || 0) + 1;
    });

    const deptRank = Object.entries(deptCountMap)
      .map(([deptId, count]) => {
        const dept = departments.find((d) => d.id === Number(deptId));
        return { id: dept?.id, department: dept?.name, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopDepartments(deptRank);

    const latestThree = [...collegePartners]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    setLatest(latestThree);
    
  } catch (errors) {
    console.error("Error refreshing dashboard", errors);
  }
};

useEffect(() => {
  if (collegeId) refreshDashboard();
}, [collegeId]);


    // CURRENT DATE
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // ENDING THIS MONTH (College only)
    const endingSoon = collegePartners.filter((p) => {
      if (!p.date_ended) return false;
      const end = new Date(p.date_ended);
      return end >= startOfMonth && end <= endOfMonth;
    });

    // EXPIRED — SORTED — LAST 5 (College only)
    const expired = collegePartners
      .filter((p) => p.date_ended && new Date(p.date_ended) < now)
      .sort((a, b) => new Date(b.date_ended) - new Date(a.date_ended));

    const lastFiveExpired = expired.slice(0, 5);


  if (loading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 font-medium mt-10">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-red-700 dark:text-blue-200">
        College Admin Dashboard
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Overview for your college — shows departments, partnerships and recent activity.
      </p>

      {/* TOP STATS */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-red-100 dark:bg-blue-900 shadow-lg rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-blue-200 text-lg font-semibold">Departments</p>
          <p className="text-4xl font-bold mt-2 text-red-800 dark:text-blue-100">{stats.departments}</p>
        </div>

        <div className="bg-red-100 dark:bg-blue-900 shadow-lg rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-blue-200 text-lg font-semibold">Partnerships</p>
          <p className="text-4xl font-bold mt-2 text-red-800 dark:text-blue-100">{stats.partnerships}</p>
        </div>

        <div className="bg-red-100 dark:bg-blue-900 shadow-lg rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-blue-200 text-lg font-semibold">Active Partnerships</p>
          <p className="text-4xl font-bold mt-2 text-green-600  dark:text-green-400">{stats.active_partnerships}</p>
        </div>

        <div className="bg-red-100 dark:bg-blue-900 shadow-lg rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-blue-200 text-lg font-semibold">Users</p>
          <p className="text-4xl font-bold mt-2 text-red-800 dark:text-blue-100">{stats.users}</p>
        </div>
      </motion.div>

      {/* Growth Chart */}
      <motion.div
        ref={growthRef}
        variants={fadeInUp}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
      >
        <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-blue-200">📈 Growth of Partnerships Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growth}>
            <XAxis dataKey="month" tick={{ fill: textColor }} />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip
              contentStyle={{ backgroundColor: darkMode ? "#0f172a" : "#fff", borderColor: darkMode ? "#334155" : "#e2e8f0" }}
              itemStyle={{ color: textColor }}
              labelStyle={{ color: textColor }}
            />
            <Line type="monotone" dataKey="count" stroke={strokeColor} strokeWidth={3} dot={{ r: 3 }} animationDuration={900} animationEasing="ease-out" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Users & Top Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-blue-200">🧮 Users by Role</h2>
          {userRoles.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No users found for this college.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={userRoles} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={110} label>
                  {userRoles.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top Departments */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-blue-200">🏛️ Top Departments</h2>
          {topDepartments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No partnership data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDepartments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" tick={{ fill: textColor }} />
                <YAxis allowDecimals={false} tick={{ fill: textColor }} />
                <Tooltip />
                <Bar dataKey="count" fill={barColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* ENDING THIS MONTH */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.6 }}
        >
          <PartnershipListBox
            title="⏳ Partnerships Ending This Month"
            items={endingSoon}
            color="yellow"
            emptyMessage="No partnerships ending this month."
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>

        {/* EXPIRED LAST 5 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.6 }}
        >
          <PartnershipListBox
            title="❌ Recently Expired Partnerships"
            items={lastFiveExpired}
            color="red"
            emptyMessage="No expired partnerships."
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      </div>

      {/* Latest Partnerships (full width cards like superadmin) */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-full"
      >
        <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-blue-200">
          🆕 Latest Partnerships
        </h2>

        {latest.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent partnerships.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">

            {latest.map((p, index) => (
              <motion.div
                key={p.id}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative bg-white dark:bg-gray-900 border border-gray-200 
                          dark:border-gray-700 rounded-xl p-5 shadow hover:shadow-lg 
                          transition cursor-pointer"
              >
                {/* Three-Dots Menu */}
                <button
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === p.id ? null : p.id);
                  }}
                >
                  <HiDotsHorizontal size={20} className="text-gray-700 dark:text-gray-300" />
                </button>

                {menuOpen === p.id && (
                  <div
                    className="absolute top-10 right-3 w-28 bg-white dark:bg-gray-800 
                              border border-gray-200 dark:border-gray-600 rounded-md 
                              shadow-lg z-20"
                  >
                    <EditButton
                      onClick={() => {
                        setSelectedPartnership(p);
                        setShowEditModal(true);
                        setMenuOpen(null);
                      }}
                    />
                    <DeleteButton
                      onClick={async () => {
                        if (window.confirm("Delete this partnership?")) {
                          await api.delete(`/partnerships/${p.id}/`);
                          loadLatest();
                        }
                      }}
                    />
                  </div>
                )}

                {/* Card Content */}
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={p.logo}
                    className="w-16 h-16 object-cover rounded-full border dark:border-gray-600"
                    alt={p.title}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{p.title}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        p.status === "active"
                          ? "bg-green-200 text-green-700 dark:bg-green-600 dark:text-white"
                          : "bg-red-200 text-red-700 dark:bg-red-700 dark:text-white"
                      }`}
                    >
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-tight line-clamp-2">
                  {p.description}
                </p>

                <p className="text-xs mt-3 text-gray-500 dark:text-gray-400">
                  Added on:{" "}
                  <span className="font-medium">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditPartnershipModal
          partnership={selectedPartnership}
          onClose={() => setShowEditModal(false)}
          onUpdated={refreshDashboard}
        />
      )}

    </div>
  );
};

export default CollegeAdminDashboard;
