import { removeToken, removeUserRole } from "../../utils/auth";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";

const ProfileDropdown = ({ onClose }) => {
  const [openEditModal, setOpenEditModal] = useState(false);

  const logout = () => {
    removeToken();
    removeUserRole();
    window.location.href = "/landing";
  };

  return (
    <>
      {/* FULLSCREEN OVERLAY – closes when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}  // clicking outside closes
      >
        {/* DROPDOWN BOX */}
        <div
          onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
          className="
            absolute top-[80px] right-4
            bg-white dark:bg-black
            border border-gray-300 dark:border-gray-700
            rounded-lg shadow-xl
            w-44 p-2
          "
        >
          <button
            className="
              w-full text-left px-3 py-2 rounded
              hover:bg-gray-200 dark:hover:bg-gray-700
              text-black dark:text-white
            "
            onClick={() => setOpenEditModal(true)}
          >
            Edit Profile
          </button>

          <button
            className="
              w-full text-left px-3 py-2 rounded
              text-red-600 dark:text-red-400
              hover:bg-red-100 dark:hover:bg-red-900
            "
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {openEditModal && (
        <EditProfileModal onClose={() => setOpenEditModal(false)} />
      )}
    </>
  );
};

export default ProfileDropdown;
