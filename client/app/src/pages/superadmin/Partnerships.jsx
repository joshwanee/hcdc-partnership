import { useEffect, useState } from "react";
import api from "../../api";
import { useLocation } from "react-router-dom";

import EditPartnershipModal from "../../components/modals/EditPartnershipModal";
import AddPartnershipModal from "../../components/modals/AddPartnershipModal";
import AddButton from "../../components/buttons/AddButton";
import GridCard from "../../components/ui/GridCard";
import DataTable from "../../components/ui/DataTable";

const Partnerships = () => {
  const [partnerships, setPartnerships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);

  const [selectedPartnership, setSelectedPartnership] = useState(null);

  const location = useLocation();
  const { departmentId, departmentName } = location.state || {};

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ⭐ NEW FILTER STATES
  const [selectedCollege, setSelectedCollege] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");

  // ⭐ Fetch partnerships, colleges, departments
  const loadPartnerships = async () => {
    setLoading(true);

    try {
      const partnerRes = await api.get("partnerships/");
      const deptRes = await api.get("departments/");
      const collegeRes = await api.get("colleges/");

      setDepartments(deptRes.data);
      setColleges(collegeRes.data);

      const deptMap = {};
      deptRes.data.forEach((d) => (deptMap[d.id] = d.name));

      // MODE 2 — from department grid navigation
      if (departmentId) {
        setPartnerships(partnerRes.data);
        setLoading(false);
        return;
      }

      // MODE 1 — full table view
      const enriched = partnerRes.data.map((p) => ({
        ...p,
        department_name: deptMap[p.department] || "Unknown",
      }));

      setPartnerships(enriched);
    } catch (err) {
      console.error("Failed to load partnerships", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPartnerships();
  }, [departmentId]);

  const openEdit = (partner) => {
    setSelectedPartnership(partner);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this partnership?")) return;

    try {
      await api.delete(`partnerships/${id}/`);
      loadPartnerships();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ⭐ FILTERING LOGIC
  let filtered = [...partnerships];

  // 1️⃣ College filter
  if (selectedCollege !== "ALL") {
    const deptIdsUnderCollege = departments
      .filter((d) => d.college === Number(selectedCollege))
      .map((d) => d.id);

    filtered = filtered.filter((p) => deptIdsUnderCollege.includes(p.department));
  }

  // 2️⃣ Department filter
  if (selectedDept !== "ALL" && selectedCollege !== "ALL") {
    filtered = filtered.filter((p) => p.department === Number(selectedDept));
  }

  function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

  const isMobile = useIsMobile();

  return (
    <div className="p-6 dark:text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="lg:text-2xl text-xl font-bold dark:text-white">
          {departmentId
            ? `${departmentName}`
            : "Partnerships"}
        </h2>

        <AddButton
          label="Add Partnership"
          onClick={() => setShowAddModal(true)}
        />
      </div>

      {/* ⭐ FILTER CONTROLS (Only in superadmin table view) */}
      {!departmentId && (
        <div className="flex flex-wrap items-center gap-3 justify-end mb-4">

          {/* COLLEGE DROPDOWN */}
          <select
            value={selectedCollege}
            onChange={(e) => {
              setSelectedCollege(e.target.value);
              setSelectedDept("ALL"); // reset dept when college changes
            }}
            className="
              p-2 border rounded 
              bg-white dark:bg-black 
              dark:text-white 
              border-gray-300 dark:border-gray-600
              text-sm
            "
          >
            <option value="ALL">All Colleges</option>

            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {isMobile ? c.code : c.name}
              </option>
            ))}
          </select>

          {/* DEPARTMENT DROPDOWN */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            disabled={selectedCollege === "ALL"}
            className={`
              p-2 border rounded 
              bg-white dark:bg-black 
              dark:text-white 
              border-gray-300 dark:border-gray-600
              text-sm
              ${selectedCollege === "ALL" ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <option value="ALL">All Departments</option>

            {departments
              .filter((d) => d.college === Number(selectedCollege))
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {isMobile ? d.code : d.name}
                </option>
              ))}
          </select>
        </div>
      )}


      {/* ⭐ MODE 1: DATATABLE */}
      {!departmentId && (
        <DataTable
          columns={[
            { header: "Title", accessor: "title" },
            { header: "Description", accessor: "description" },
            { header: "Status", accessor: "status" },
            { header: "Date Started", accessor: "date_started" },
            { header: "Date Ended", accessor: "date_ended" },
          ]}
          data={filtered}
          loading={loading}
          onEdit={(row) => openEdit(row)}
          onDelete={(id) => handleDelete(id)}
        />
      )}

      {/* ⭐ MODE 2: GRID VIEW */}
      {departmentId && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
          {filtered
            .filter((p) => p.department === departmentId)
            .map((partner) => (
              <GridCard
                key={partner.id}
                item={{
                  ...partner,
                  name: partner.title,
                  code: partner.status,
                }}
                onClick={() => {}}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
        </div>
      )}

      {/* MODALS */}
      {showEditModal && (
        <EditPartnershipModal
          partnership={selectedPartnership}
          onClose={() => setShowEditModal(false)}
          onUpdated={loadPartnerships}
        />
      )}

      {showAddModal && (
        <AddPartnershipModal
          departmentId={departmentId || null}
          departments={departments}
          onClose={() => setShowAddModal(false)}
          onAdded={loadPartnerships}
        />
      )}
    </div>
  );
};

export default Partnerships;
