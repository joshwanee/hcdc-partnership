import { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import GridCard from "../../components/ui/GridCard";

import EditDepartmentModal from "../../components/modals/EditDepartmentModal";
import AddDepartmentModal from "../../components/modals/AddDepartmentModal";
import AddButton from "../../components/buttons/AddButton";

const CollegeDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const navigate = useNavigate();

  // 🔥 Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const collegeId = user?.college;

  // 🔥 Load college name for header
  const [collegeName, setCollegeName] = useState("");

  const loadCollege = async () => {
    try {
      const res = await api.get(`colleges/${collegeId}/`);
      setCollegeName(res.data.name);
    } catch (err) {
      console.error("Failed to load college name", err);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await api.get(`departments/?college=${collegeId}`);
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  useEffect(() => {
    loadCollege();
    loadDepartments();
  }, []);

  const openEdit = (dept) => {
    setSelectedDepartment(dept);
    setShowEditModal(true);
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm("Delete this department?")) return;

    try {
      await api.delete(`departments/${deptId}/`);
      loadDepartments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="p-6 dark:text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">
          Departments in <span className="text-blue-600 dark:text-blue-400">{collegeName}</span>
        </h2>

        <AddButton
              label="Add Department"
              onClick={() => setShowAddModal(true)}
            />
      </div>

      {/* GRID VIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
        {departments.map((dept) => (
          <GridCard
            key={dept.id}
            item={{
              id: dept.id,
              name: dept.name,
              logo: dept.logo,
              code: dept.code
            }}
            onClick={() =>
              navigate("/college/partnerships", {
                state: { departmentId: dept.id, departmentName: dept.name },
              })
            }
            onEdit={() => openEdit(dept)}
            onDelete={() => handleDelete(dept.id)}
          />
        ))}
      </div>

      {/* MODALS */}
      {showEditModal && (
        <EditDepartmentModal
          department={selectedDepartment}
          onClose={() => setShowEditModal(false)}
          onUpdated={loadDepartments}
        />
      )}

      {showAddModal && (
        <AddDepartmentModal
          collegeId={collegeId}
          colleges={[]} // not needed for college admin
          onClose={() => setShowAddModal(false)}
          onAdded={loadDepartments}
        />
      )}
    </div>
  );
};

export default CollegeDepartments;
