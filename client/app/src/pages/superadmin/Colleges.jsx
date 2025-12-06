import { useEffect, useState } from "react";
import api from "../../api";
import { HiDotsHorizontal } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import GridCard from "../../components/ui/GridCard";

import EditCollegeModal from "../../components/modals/EditModalColleges";
import AddCollegeModal from "../../components/modals/AddCollegeModal";
import AddButton from "../../components/buttons/AddButton";

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadColleges = () => {
    api.get("colleges/").then((res) => setColleges(res.data));
  };

  useEffect(() => {
    loadColleges();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen) {
        const isOutsideButton = !event.target.closest(".three-dots");
        const isOutsideMenu = !event.target.closest(".dropdown-menu");
        if (isOutsideButton && isOutsideMenu) {
          setMenuOpen(null);
        }
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [menuOpen]);

  const handleCollegeClick = (college) => {
    navigate(`/superadmin/departments/${college.id}`, {
      state: { collegeName: college.name },
    });
  };

  const openEdit = (college) => {
    setSelectedCollege(college);
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleDelete = async (collegeId) => {
    if (!window.confirm("Delete this college?")) return;

    try {
      await api.delete(`colleges/${collegeId}/`);
      setColleges((prev) => prev.filter((c) => c.id !== collegeId));
      loadColleges();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="p-6 dark:text-white">
            {/* PAGE HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Colleges</h2>

                {/* ADD BUTTON */}
                <AddButton label="Add College" onClick={() => setShowAddModal(true)} />
              </div>

            {/* GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {colleges.map((college) => (
          <GridCard
            key={college.id}
            item={college}
            onClick={(c) =>
              navigate(`/superadmin/departments/${c.id}`, {
                state: { collegeName: c.name },
              })
            }
            onEdit={(c) => {
              setSelectedCollege(c);
              setShowEditModal(true);
            }}
            onDelete={(id) => handleDelete(id)}
          />
        ))}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditCollegeModal
          college={selectedCollege}
          onClose={() => setShowEditModal(false)}
          onUpdated={loadColleges}
        />
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <AddCollegeModal
          onClose={() => setShowAddModal(false)}
          onAdded={loadColleges}
        />
      )}
    </div>
  );
};

export default Colleges;
