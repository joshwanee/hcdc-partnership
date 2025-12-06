import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api";

import GridCard from "../../components/ui/GridCard";
import DataTable from "../../components/ui/DataTable";

import EditPartnershipModal from "../../components/modals/EditPartnershipModal";
import AddPartnershipModal from "../../components/modals/AddPartnershipModal";
import AddButton from "../../components/buttons/AddButton";

const CollegePartnerships = () => {
  const location = useLocation();
  const { departmentId, departmentName } = location.state || {};

  const [partnerships, setPartnerships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Logged-in college admin
  const user = JSON.parse(localStorage.getItem("user"));
  const collegeId = user?.college;

  const loadPartnerships = async () => {
    setLoading(true);
    try {
      // Load departments under this college
      const deptRes = await api.get(`departments/?college=${collegeId}`);
      setDepartments(deptRes.data);

      const deptIds = deptRes.data.map((d) => d.id);

      // Load partnerships
      const partnerRes = await api.get("partnerships/");

      let filtered = partnerRes.data.filter((p) =>
        deptIds.includes(p.department)
      );

      // If a department was clicked → filter more
      if (departmentId) {
        filtered = filtered.filter((p) => p.department === departmentId);
      }

      // Attach department name directly for DataTable
      const enriched = filtered.map((p) => ({
        ...p,
        department_name:
          deptRes.data.find((d) => d.id === p.department)?.name || "Unknown",
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

  const handleEdit = (partner) => {
    setSelectedPartnership(partner);
    setShowEditModal(true);
  };

  const handleDelete = async (partnerId) => {
    if (!window.confirm("Delete this partnership?")) return;

    try {
      await api.delete(`partnerships/${partnerId}/`);
      loadPartnerships();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="p-6 dark:text-white">

      {/* PAGE TITLE */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">
          {departmentId
            ? `Partnerships under ${departmentName}`
            : "All Partnerships Under Your College"}
        </h2>

        <AddButton
              label="Add Department"
              onClick={() => setShowAddModal(true)}
        />
      </div>

      {/* ============================
          MODE 1: TABLE VIEW (ALL)
      ============================= */}
      {!departmentId && (
        <DataTable
          columns={[
            { header: "Title", accessor: "title" },
            { header: "Description", accessor: "description" },
            { header: "Status", accessor: "status" },
            { header: "Department", accessor: "department_name" },
          ]}
          data={partnerships}
          loading={loading}
          onEdit={(row) => handleEdit(row)}
          onDelete={(id) => handleDelete(id)}
        />
      )}

      {/* ============================
          MODE 2: GRID VIEW (BY DEPARTMENT)
      ============================= */}
      {departmentId && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
          {partnerships.map((partner) => (
            <GridCard
              key={partner.id}
              item={{
                id: partner.id,
                name: partner.title,
                logo: partner.logo,
                code: partner.status,
              }}
              onClick={() => {}}
              onEdit={() => handleEdit(partner)}
              onDelete={() => handleDelete(partner.id)}
            />
          ))}
        </div>
      )}

      {/* ========== EDIT MODAL ========== */}
      {showEditModal && (
        <EditPartnershipModal
          partnership={selectedPartnership}
          onClose={() => setShowEditModal(false)}
          onUpdated={loadPartnerships}
        />
      )}

      {/* ========== ADD MODAL ========== */}
      {showAddModal && (
        <AddPartnershipModal
          departmentId={departmentId || null}
          departments={departmentId ? [] : departments}
          onClose={() => setShowAddModal(false)}
          onAdded={loadPartnerships}
        />
      )}
    </div>
  );
};

export default CollegePartnerships;
