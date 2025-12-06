import { useEffect, useState } from "react";
import api from "../../api";
import { useParams, useNavigate } from "react-router-dom";

import EditDepartmentModal from "../../components/modals/EditDepartmentModal";
import AddDepartmentModal from "../../components/modals/AddDepartmentModal";

import AddButton from "../../components/buttons/AddButton";
import GridCard from "../../components/ui/GridCard";
import DataTable from "../../components/ui/DataTable";

const Departments = () => {
  const { collegeId } = useParams();
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // ⭐ NEW college filter state (superadmin view)
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState("ALL");

  // ⭐ Load Departments + Colleges
  const loadDepartments = async () => {
    setLoading(true);

    try {
      if (collegeId) {
        // MODE 2: Inside a specific college
        const res = await api.get(`departments/?college=${collegeId}`);
        setDepartments(res.data);
      } else {
        // MODE 1: Superadmin all departments
        const [deptRes, collegeRes] = await Promise.all([
          api.get("departments/"),
          api.get("colleges/"),
        ]);

        // Attach college name
        const collegeMap = {};
        collegeRes.data.forEach((c) => (collegeMap[c.id] = c.name));

        const enriched = deptRes.data.map((d) => ({
          ...d,
          college_name: collegeMap[d.college] || "Unknown",
        }));

        setDepartments(enriched);
        setColleges(collegeRes.data);
      }
    } catch (err) {
      console.error("Failed to load departments", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (collegeId) {
      api.get(`colleges/${collegeId}/`).then((res) => setCollege(res.data));
    }
    loadDepartments();
  }, [collegeId]);

  const handleDepartmentClick = (dept) => {
    navigate("/superadmin/partnerships", {
      state: { departmentId: dept.id, departmentName: dept.name },
    });
  };

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

  // ⭐ APPLY FILTERING (only in superadmin/table view)
  let filteredDepartments = [...departments];

  if (!collegeId && selectedCollegeFilter !== "ALL") {
    filteredDepartments = filteredDepartments.filter(
      (d) => d.college === Number(selectedCollegeFilter)
    );
  }

  return (
    <div className="p-6 dark:text-white">

      {/* PAGE TITLE + FILTER + ADD BUTTON */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold dark:text-white">
            {collegeId
              ? `Departments under ${college?.name || ""}`
              : "Departments"}
          </h2>

          {/* RIGHT-SIDE CONTROLS */}
          <div className="flex flex-col items-end gap-2">

            <AddButton
              label="Add Department"
              onClick={() => setShowAddModal(true)}
            />

            {/* ⭐ College Filter (only when NOT inside a college) */}
            {!collegeId && (
              <select
                value={selectedCollegeFilter}
                onChange={(e) => setSelectedCollegeFilter(e.target.value)}
                className="
                  p-2 border rounded
                  bg-white dark:bg-black
                  dark:text-white
                  border-gray-300 dark:border-gray-600
                "
              >
                <option value="ALL">All Colleges</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>


      {/* ⭐ MODE 1: DATATABLE VIEW (NOT inside a college) */}
      {!collegeId && (
        <DataTable
          columns={[
            { header: "Name", accessor: "name" },
            { header: "Code", accessor: "code" },
            { header: "College", accessor: "college_name" },
          ]}
          data={filteredDepartments}
          loading={loading}
          onEdit={(row) => openEdit(row)}
          onDelete={(id) => handleDelete(id)}
        />
      )}

      {/* ⭐ MODE 2: GRID VIEW (inside a college) */}
      {collegeId && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
          {departments.map((dept) => (
            <GridCard
              key={dept.id}
              item={dept}
              onClick={handleDepartmentClick}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

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
          colleges={colleges}
          onClose={() => setShowAddModal(false)}
          onAdded={loadDepartments}
        />
      )}
    </div>
  );
};

export default Departments;
