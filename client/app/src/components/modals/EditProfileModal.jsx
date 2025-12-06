import { useState, useEffect } from "react";
import api from "../../api";
import Portal from "./Portal";

const EditProfileModal = ({ onClose }) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------- LOAD USER ----------------
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/users/${userId}/`);
        setUsername(res.data.username);
        setEmail(res.data.email);
      } catch {
        setError("Failed to load profile.");
      }
    };
    load();
  }, [userId]);

  // ---------------- PASSWORD VALIDATION ----------------
  const isPasswordEntered = newPassword.trim().length > 0;

  let passwordError = "";

  if (isPasswordEntered) {
    if (newPassword.length < 8) {
      passwordError = "Password must be at least 8 characters.";
    } else if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      passwordError = "Password must contain both letters and numbers.";
    } else if (confirm && newPassword !== confirm) {
      passwordError = "Passwords do not match.";
    }
  }

  const isSaveDisabled = Boolean(passwordError);

  // ---------------- HANDLE SAVE ----------------
  const handleSave = async () => {
    if (isSaveDisabled) return;

    setError("");
    setLoading(true);

    try {
      const payload = { username, email };
      if (isPasswordEntered) payload.password = newPassword;

      await api.patch(`/users/${userId}/`, payload);

      alert("Profile updated successfully!");
      onClose();
    } catch (err) {
      if (err.response?.data) {
        let messages = [];

        for (const field in err.response.data) {
          const val = err.response.data[field];
          messages.push(...(Array.isArray(val) ? val : [val]));
        }

        setError(messages.join(" "));
      } else {
        setError("Failed to update profile.");
      }
    }

    setLoading(false);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex justify-center items-center">

        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* MODAL */}
        <div
          className="
            edit-profile-modal
            relative z-50 w-96 p-6 rounded-xl
            bg-white dark:bg-black text-black dark:text-white
            shadow-xl
          "
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

          {error && <p className="text-red-500 mb-3">{error}</p>}

          {/* USERNAME */}
          <label className="text-sm">Username</label>
          <input
            type="text"
            className="w-full p-2 mt-1 rounded bg-gray-100 dark:bg-gray-800"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* EMAIL */}
          <label className="text-sm mt-3 block">Email</label>
          <input
            type="email"
            className="w-full p-2 mt-1 rounded bg-gray-100 dark:bg-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <label className="text-sm mt-3 block">New Password (optional)</label>
          <input
            type="password"
            className="w-full p-2 mt-1 rounded bg-gray-100 dark:bg-gray-800"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {/* CONFIRM */}
          <label className="text-sm mt-3 block">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 mt-1 rounded bg-gray-100 dark:bg-gray-800"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {/* 1 MESSAGE ONLY (step-by-step) */}
          {passwordError && (
            <p className="text-red-500 text-sm mt-2">{passwordError}</p>
          )}

          {/* FOOTER */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 bg-gray-400 rounded"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSaveDisabled || loading}
              className={`
                px-4 py-2 rounded text-white
                ${isSaveDisabled || loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"}
              `}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default EditProfileModal;
