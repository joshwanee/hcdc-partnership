import { useEffect, useState, useRef } from "react";
import api from "../../api";

import { HiDotsHorizontal } from "react-icons/hi";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

import EditPartnershipModal from "../../components/modals/EditPartnershipModal";
import ImageWithFallback from "../../components/ImageWithFallback";
import PartnershipListBox from "../../components/PartnershipListBox";
import DeleteButton from "../../components/buttons/DeleteButton";
import EditButton from "../../components/buttons/EditButton";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Colors for pie/status
const STATUS_COLORS = {
  Active: "#22c55e",
  Inactive: "#ef4444",
};

const DepartmentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const departmentId = user?.department;
  const { darkMode } = useOutletContext();

  const strokeColor = darkMode ? "#3b82f6" : "#ef4444";
  const textColor = darkMode ? "#ffffff" : "#374151";
  const barColor = darkMode ? "#3b82f6" : "#ef4444";

  const [department, setDepartment] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [growth, setGrowth] = useState([]);

  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const normalize = (str) => str?.toString().trim().toLowerCase();
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const loadData = async () => {
    try {
      const deptRes = await api.get(`/departments/${departmentId}/`);
      setDepartment(deptRes.data);

      const partnerRes = await api.get("/partnerships/");
      const filtered = partnerRes.data.filter((p) => p.department === departmentId);
      setPartnerships(filtered);

      // Fetch growth (department-filtered)
      const g = await api.get(`/partnerships/growth/?department=${departmentId}`);
      setGrowth(g.data);
    } catch (error) {
      console.error("Failed to load department dashboard", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // close dropdown menus when clicking outside
    const handler = (e) => {
      if (!e.target.closest(".menu-btn") && !e.target.closest(".menu-dropdown")) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  if (loading) {
    return <div className="p-6 dark:text-white text-lg">Loading dashboard...</div>;
  }

  // SUMMARY
  const total = partnerships.length;
  const active = partnerships.filter((p) => normalize(p.status) === "active").length;
  const inactive = partnerships.filter((p) => normalize(p.status) === "inactive").length;

  // Pie Chart Data
  const pieData = [
    { name: "Active", value: active },
    { name: "Inactive", value: inactive },
  ];

  // Latest 3 partnerships
  const latestThree = [...partnerships]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  // ENDING SOON section
  const today = new Date();
  const soonLimit = new Date();
  soonLimit.setDate(today.getDate() + 30);

  const endingSoon = partnerships.filter((p) => {
    if (!p.date_ended) return false;
    const end = new Date(p.date_ended);
    return end >= today && end <= soonLimit;
  });

  const alreadyEnded = partnerships.filter((p) => {
    if (!p.date_ended) return false;
    const end = new Date(p.date_ended);
    return end < today;
  });

  const lastFiveExpired = [...alreadyEnded]
  .sort((a, b) => new Date(b.date_ended) - new Date(a.date_ended))
  .slice(0, 5);

  const handleEdit = (p) => {
  setSelectedPartnership(p);
  setShowEditModal(true);
};

const handleDelete = async (id) => {
  if (window.confirm("Delete this partnership?")) {
    await api.delete(`/partnerships/${id}/`);
    loadData(); // refresh dashboard
  }
};



  return (
  <div className="p-6 dark:text-white space-y-10">

    {/* HEADER */}
    <motion.h1
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      transition={{ duration: 0.6 }}
      className="text-2xl font-bold"
    >
      {department?.name}
    </motion.h1>

    {/* SUMMARY CARDS */}
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-2 md:grid-cols-3 gap-6"
    >
      <div className="p-6 rounded-xl shadow bg-white dark:bg-gray-800 border-l-4 border-red-600">
        <h3 className="text-sm uppercase opacity-70">Total Partnerships</h3>
        <p className="text-3xl font-bold mt-2">{total}</p>
      </div>

      <div className="p-6 rounded-xl shadow bg-white dark:bg-gray-800 border-l-4 border-green-600">
        <h3 className="text-sm uppercase opacity-70">Active</h3>
        <p className="text-3xl font-bold mt-2">{active}</p>
      </div>

      <div className="p-6 rounded-xl shadow bg-white dark:bg-gray-800 border-l-4 border-orange-500">
        <h3 className="text-sm uppercase opacity-70">Inactive</h3>
        <p className="text-3xl font-bold mt-2">{inactive}</p>
      </div>
    </motion.div>

    {/* GROWTH CHART */}
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
    >
      <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-blue-200">📈 Partnerships Growth Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={growth}>
          <XAxis tick={{ fill: textColor }} dataKey="month" />
          <YAxis tick={{ fill: textColor }} />
          <Tooltip />
          <Line type="monotone" stroke={strokeColor} dataKey="count" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>

    {/* PIE + LATEST + ENDING/EXPIRED */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* PIE CHART */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-full"
      >
        <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-blue-200">📊 Partnership Status Distribution</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              label
            >
              {pieData.map((entry, idx) => (
                <Cell key={idx} fill={STATUS_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* LATEST PARTNERSHIPS */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-full"
      >
        <h2 className="text-xl font-bold mb-4 text-red-700 dark:text-blue-200">🆕 Latest Partnerships</h2>

        {latestThree.length === 0 ? (
          <p className="opacity-70">No partnerships available.</p>
        ) : (
          <div className="space-y-4">
            {latestThree.map((p, index) => (
              <motion.div
                key={p.id}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative overflow-visible p-4 rounded-xl shadow bg-white dark:bg-gray-900 
                        border border-gray-300 dark:border-gray-700"
              >
                <button
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === p.id ? null : p.id);
                  }}
                >
                  <HiDotsHorizontal size={22} className="text-gray-700 dark:text-gray-200" />
                </button>

                {menuOpen === p.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10}}
                    transition={{ duration: 0.15 }}
                    className="menu-dropdown absolute top-10 right-2 bg-white dark:bg-gray-900 
                              border border-gray-300 dark:border-gray-700 rounded-md 
                              shadow-lg z-50 w-28"
                  >
                    <EditButton onClick={() => handleEdit(p)} />
                    <DeleteButton onClick={() => handleDelete(p.id)} />
                  </motion.div>
                )}

                <div className="flex items-center gap-3">
                  <ImageWithFallback src={p.logo} className="w-16 h-16 rounded-full border object-cover" alt={p.title} />
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        normalize(p.status) === "active"
                          ? "bg-green-200 text-green-700"
                          : "bg-red-200 text-red-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm mt-2 opacity-80">{p.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ENDING SOON + EXPIRED */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="grid lg:grid-cols-2 lg:col-span-2 gap-6"
      >
        <PartnershipListBox
          title="⏳ Partnerships Ending Soon"
          items={endingSoon}
          emptyMessage="No partnerships ending within 30 days."
          color="yellow"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <PartnershipListBox
          title="❌ Recently Expired Partnerships"
          items={lastFiveExpired}
          emptyMessage="No expired partnerships."
          color="red"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.div>
    </div>

    {/* EDIT MODAL */}
    {showEditModal && (
      <EditPartnershipModal
        partnership={selectedPartnership}
        onClose={() => setShowEditModal(false)}
        onUpdated={loadData}
      />
    )}
  </div>
);


};

export default DepartmentDashboard;
