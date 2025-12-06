import { useEffect, useState } from "react";
import api from "../../api";

import GridCard from "../../components/ui/GridCard";
import AddPartnershipModal from "../../components/modals/AddPartnershipModal";
import EditPartnershipModal from "../../components/modals/EditPartnershipModal";
import AddButton from "../../components/buttons/AddButton";

const DepartmentPartnerships = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const departmentId = user?.department;

  const [partnerships, setPartnerships] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadPartnerships = async () => {
    try {
      const res = await api.get(`/partnerships/?department=${departmentId}`);
      setPartnerships(res.data);
    } catch (err) {
      console.error("Failed to load partnerships", err);
    }
  };

  useEffect(() => {
    loadPartnerships();
  }, []);

  const handleEdit = (partner) => {
    setSelected(partner);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete partnership?")) return;

    try {
      await api.delete(`/partnerships/${id}/`);
      loadPartnerships();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="p-6 dark:text-white">

      <div className="flex justify-between items-center mb-4 mt-8">
        <h2 className="text-xl font-bold dark:text-white">Your Partnerships</h2>

        <AddButton
              label="Add Department"
              onClick={() => setShowAddModal(true)}
        />
      </div>

      {/* PARTNERSHIP GRID */}
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

      {/* MODALS */}
      {showAddModal && (
        <AddPartnershipModal
          departmentId={departmentId}
          departments={[{ id: departmentId }]} // locked to this department
          onClose={() => setShowAddModal(false)}
          onAdded={loadPartnerships}
        />
      )}

      {showEditModal && (
        <EditPartnershipModal
          partnership={selected}
          onClose={() => setShowEditModal(false)}
          onUpdated={loadPartnerships}
        />
      )}
    </div>
  );
};

export default DepartmentPartnerships;
