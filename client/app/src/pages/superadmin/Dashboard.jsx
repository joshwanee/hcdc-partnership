import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import api from "../../api";
import { motion } from "framer-motion";
import { HiDotsHorizontal } from "react-icons/hi";
import EditPartnershipModal from "../../components/modals/EditPartnershipModal";
import EditButton from "../../components/buttons/EditButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import PartnershipListBox from "../../components/PartnershipListBox";


import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    colleges: 0,
    departments: 0,
    partnerships: 0,
    users: 0,
  });

  // NEW: Store ALL partnerships
  const [allPartnerships, setAllPartnerships] = useState([]);

  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { darkMode } = useOutletContext();

  const strokeColor = darkMode ? "#3b82f6" : "#ef4444";
  const textColor = darkMode ? "#ffffff" : "#374151";
  const barColor = darkMode ? "#3b82f6" : "#ef4444";

  const [growth, setGrowth] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [topColleges, setTopColleges] = useState([]);
  const [latest, setLatest] = useState([]);

  const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308"];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

    const handleEdit = (p) => {
    setSelectedPartnership(p);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    await api.delete(`/partnerships/${id}/`);
    loadLatest(); // or any refresh function
  };

  const loadLatest = async () => {
    const res = await api.get("/partnerships/");
    const latestThree = res.data
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    setLatest(latestThree);
  };

  useEffect(() => {
    const fetchData = async () => {

      const [colleges, departments, partnershipsRes, users] = await Promise.all([
        api.get("colleges/"),
        api.get("departments/"),
        api.get("partnerships/"),
        api.get("users/"),
      ]);

      // Store partnerships (ALL)
      setAllPartnerships(partnershipsRes.data);

      setStats({
        colleges: colleges.data.length,
        departments: departments.data.length,
        partnerships: partnershipsRes.data.length,
        users: users.data.length,
      });

      api.get("partnerships/growth/").then((res) => setGrowth(res.data));

      const roleCount = {};
      users.data.forEach((user) => {
        roleCount[user.role] = (roleCount[user.role] || 0) + 1;
      });
      setUserRoles(
        Object.entries(roleCount).map(([role, count]) => ({ role, count }))
      );

      const collegeCount = {};
      partnershipsRes.data.forEach((p) => {
        const dept = departments.data.find((d) => d.id === p.department);
        if (!dept) return;

        const college = colleges.data.find((c) => c.id === dept.college);
        if (!college) return;

        collegeCount[college.code] = (collegeCount[college.code] || 0) + 1;
      });

      const sorted = Object.entries(collegeCount)
        .map(([college, count]) => ({ college, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopColleges(sorted);

      const latestThree = [...partnershipsRes.data]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

      setLatest(latestThree);
    };

    fetchData();
  }, []);

  const refreshDashboard = async () => {
  try {
    const [colleges, departments, partnershipsRes, users] = await Promise.all([
      api.get("colleges/"),
      api.get("departments/"),
      api.get("partnerships/"),
      api.get("users/"),
    ]);

    // 1. Store ALL partnerships
    setAllPartnerships(partnershipsRes.data);

    // 2. Update stats
    setStats({
      colleges: colleges.data.length,
      departments: departments.data.length,
      partnerships: partnershipsRes.data.length,
      users: users.data.length,
    });

    // 3. Growth chart
    const growthRes = await api.get("partnerships/growth/");
    setGrowth(growthRes.data);

    // 4. Users by role
    const roleCount = {};
    users.data.forEach((user) => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    setUserRoles(
      Object.entries(roleCount).map(([role, count]) => ({ role, count }))
    );

    // 5. Top colleges
    const collegeCount = {};
    partnershipsRes.data.forEach((p) => {
      const dept = departments.data.find((d) => d.id === p.department);
      if (!dept) return;
      const college = colleges.data.find((c) => c.id === dept.college);
      if (!college) return;

      collegeCount[college.code] = (collegeCount[college.code] || 0) + 1;
    });

    const sorted = Object.entries(collegeCount)
      .map(([college, count]) => ({ college, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopColleges(sorted);

    // 6. Latest 3
    const latestThree = [...partnershipsRes.data]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    setLatest(latestThree);
  } catch (err) {
    console.error("Error refreshing dashboard:", err);
  }
};

    useEffect(() => {
      refreshDashboard();
    }, []);

  // --- ENDING SOON (THIS MONTH) ---
  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  const endingSoon = allPartnerships.filter((p) => {
    if (!p.date_ended) return false;
    const end = new Date(p.date_ended);
    return end >= now && end <= next30Days;
  });

  // --- EXPIRED (ALL, THEN LIMIT TO 5) ---
  const expired = allPartnerships
    .filter((p) => p.date_ended && new Date(p.date_ended) < now)
    .sort((a, b) => new Date(b.date_ended) - new Date(a.date_ended));

  const lastFiveExpired = expired.slice(0, 5);

  return (
    <div className="p-6 space-y-8">

      {/* 🔥 TOP STATS */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {Object.entries(stats).map(([key, value], index) => (
          <div
            key={index}
            className="bg-red-100 dark:bg-blue-900 shadow-lg rounded-xl p-6 text-center transition-all"
          >
            <h3 className="text-red-700 dark:text-blue-200 text-lg font-semibold capitalize">
              {key}
            </h3>
            <p className="text-4xl font-bold mt-2 text-red-800 dark:text-blue-100">
              {value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* 📈 Growth Line Chart */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
      >
        <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-blue-200">
          📈 Growth of Partnerships Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growth}>
            <XAxis tick={{ fill: textColor }} dataKey="month" />
            <YAxis tick={{ fill: textColor }} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#1f2937" : "#fff",
                color: textColor,
              }}
              labelStyle={{ color: textColor }}
              itemStyle={{ color: textColor }}
            />
            <Line type="monotone" dataKey="count" stroke={strokeColor} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 🧮 Users & Top Colleges */}
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
          <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-blue-200">
            🧮 Users by Role
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={userRoles} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={110} label>
                {userRoles.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Colleges */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-blue-200">
            🏛️ Top 5 Colleges With Most Partnerships
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topColleges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="college" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill={barColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
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

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
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

      {/* 🆕 Latest Partnerships */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-full"
      >
        <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-blue-200">
          🆕 Latest Partnerships Added
        </h2>

        {latest.length === 0 ? (
          <p className="opacity-70 dark:text-gray-300">No partnerships available.</p>
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
                className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
                          rounded-xl p-5 shadow hover:shadow-lg transition cursor-pointer"
              >
                {/* Three Dots Menu */}
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
                                border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-20"
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
                  <img
                    src={p.logo}
                    className="w-16 h-16 object-cover rounded-full border dark:border-gray-600"
                    alt={p.title}
                  />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{p.title}</p>

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

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Added on:{" "}
                  <span className="font-medium">{new Date(p.created_at).toLocaleDateString()}</span>
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
          onUpdated={refreshDashboard} // ✅ updated
        />
      )}
    </div>
  );
};

export default Dashboard;
