import { useEffect, useState } from "react";
import api from "../../api";

const EditCollegeModal = ({ onClose, onUpdated, college }) => {
  const [name, setName] = useState(college.name);
  const [code, setCode] = useState(college.code);
  const [logo, setLogo] = useState(null);

  const [adminId, setAdminId] = useState(college.admin);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!adminId) return;

      try {
        const res = await api.get(`/users/${adminId}/`);
        setAdminUsername(res.data.username);
        setAdminEmail(res.data.email);
      } catch (err) {
        console.error("Failed to fetch admin", err);
        setError("Failed to load admin details. Please check authentication.");
      }
    };
    fetchAdmin();
  }, [adminId]);

  // 🔥 Password Validation Handler
  const handlePasswordChange = (value) => {
    setAdminPassword(value);

    if (value && value.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
    } else if (value && (!/\d/.test(value) || !/[A-Za-z]/.test(value))) {
      setPasswordError("Password must contain letters and numbers.");
    } else if (value && !adminConfirmPassword) {
      setPasswordError("Please confirm your password.");
    } else if (value && value !== adminConfirmPassword) {
      setPasswordError("Passwords do not match!");
    } else {
      setPasswordError("");
    }
  };

  // 🔥 Confirm Password Handler
  const handleConfirmPasswordChange = (value) => {
    setAdminConfirmPassword(value);

    if (adminPassword && value !== adminPassword) {
      setPasswordError("Passwords do not match!");
    } else if (adminPassword && !value) {
      setPasswordError("Please confirm your password.");
    } else {
      setPasswordError("");
    }
  };

  // 🔥 Determine if submit should be disabled
  const isSubmitDisabled = () => {
    if (adminPassword && (passwordError || !adminConfirmPassword)) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUsernameError("");

    if (!name.trim() || !code.trim()) {
      setError("College name and code are required.");
      setLoading(false);
      return;
    }

    if (passwordError) {
      setError("Fix password errors before submitting.");
      setLoading(false);
      return;
    }

    // 🔥 Username Uniqueness Check (only on submit)
    if (adminUsername.trim()) {
      try {
        const res = await api.get(`/users/?username=${adminUsername.trim()}`);
        console.log("Username check response:", res.data);
        console.log("Current adminId:", adminId);
        
        const users = Array.isArray(res.data) ? res.data : [res.data];
        const existingUser = users.find(user => user.username === adminUsername.trim());
        if (existingUser && existingUser.id !== adminId) {
          setUsernameError("Username already exists.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Username check failed", err);
        setError("Failed to check username. Please try again.");
        setLoading(false);
        return;
      }
    }

    try {
      let updatedAdminId = adminId;

      if (adminUsername.trim() || adminEmail.trim()) {
        if (!adminUsername.trim() || !adminEmail.trim()) {
          setError("Username and email are required for admin.");
          setLoading(false);
          return;
        }

        if (adminPassword && adminPassword !== adminConfirmPassword) {
          setError("Passwords do not match!");
          setLoading(false);
          return;
        }

        if (!adminId && !adminPassword) {
          setError("Password is required for new admins.");
          setLoading(false);
          return;
        }

        const isUpdatingCredentials = adminId && (adminUsername.trim() !== "" || adminEmail.trim() !== "");
        if (isUpdatingCredentials && !adminPassword) {
          const confirmUpdate = window.confirm(
            "You're updating the admin's username or email without changing the password. This is allowed, but confirm to proceed."
          );
          if (!confirmUpdate) {
            setLoading(false);
            return;
          }
        }

        const adminData = {
          username: adminUsername.trim(),
          email: adminEmail.trim(),
          role: "COLLEGE_ADMIN",
        };

        if (adminPassword) adminData.password = adminPassword;

        console.log("Admin Data before PATCH:", adminData);

        if (adminId) {
          const resAdmin = await api.patch(`/users/${adminId}/`, adminData);
          updatedAdminId = resAdmin.data.id;
        } else {
          const resAdmin = await api.post(`/users/`, adminData);
          updatedAdminId = resAdmin.data.id;
        }

        await api.patch(`/users/${updatedAdminId}/`, { college: college.id });
      }

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("code", code.trim());
      formData.append("admin", updatedAdminId || "");

      if (logo) formData.append("logo", logo);

      const resCollege = await api.patch(`/colleges/${college.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdated(resCollege.data);
      onClose();

      setAdminPassword("");
      setAdminConfirmPassword("");
    } catch (error) {
      console.error("Update failed", error);
      // 🔥 Parse backend error response
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;
        let errorMessage = "Update failed.";
        if (typeof backendErrors === 'object') {
          const messages = [];
          for (const field in backendErrors) {
            if (Array.isArray(backendErrors[field])) {
              messages.push(...backendErrors[field]);
            } else {
              messages.push(backendErrors[field]);
            }
          }
          errorMessage = messages.join(' ');
        }
        setError(errorMessage);
      } else {
        setError("Update failed. Please check your authentication and try again.");
      }
    }

    setLoading(false);
  };

  return (
  <div
    className="
      fixed inset-0 
      bg-black/40 dark:bg-black/60 
      backdrop-blur-sm 
      flex justify-center items-center 
      z-50 p-4

      opacity-0 animate-fadeIn
    "
  >
    {/* MODAL CARD */}
    <div
      className="
        w-full max-w-3xl 
        bg-white dark:bg-[#1C1C1E] dark:text-white
        rounded-2xl shadow-2xl 
        p-6 max-h-[90vh] overflow-y-auto

        scale-95 opacity-0 animate-modalEnter
      "
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Edit College</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form 
        id="collegeForm" 
        onSubmit={handleSubmit} 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >

        {/* LEFT SIDE — College Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3">College Details</h3>

          {/* Metadata */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            <p><strong>ID:</strong> {college.id}</p>
            <p><strong>Created:</strong> {new Date(college.created_at).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(college.updated_at).toLocaleString()}</p>
          </div>

          {/* INPUT STYLE */}
          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">College Name *</span>
            <input
              type="text"
              className="
                w-full border p-2 rounded-lg mt-1
        
                bg-white text-black
                dark:bg-[#2C2C2E] dark:border-[#3A3A3C] dark:text-white
        
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">Code *</span>
            <input
              type="text"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:border-[#3A3A3C] dark:text-white
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">College Logo</span>
            <input
              type="file"
              accept="image/*"
              className="mt-2 text-sm"
              onChange={(e) => setLogo(e.target.files[0])}
            />
          </label>

          {/* CURRENT LOGO */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-1 dark:text-white">Current Logo:</p>
            <img
              src={college.logo}
              alt="College Logo"
              className="w-20 h-20 object-cover rounded-full border"
            />
          </div>
        </div>

        {/* RIGHT SIDE — Admin Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">College Admin</h3>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">Username</span>
            <input
              type="text"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:border-[#3A3A3C] dark:text-white
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
            />
            {usernameError && (
              <p className="text-red-500 text-xs mt-1">{usernameError}</p>
            )}
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">Email</span>
            <input
              type="email"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:border-[#3A3A3C] dark:text-white
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">
              New Password {adminId ? "(optional)" : "(required)"}
            </span>
            <input
              type="password"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:border-[#3A3A3C] dark:text-white
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={adminPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">Confirm Password</span>
            <input
              type="password"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:border-[#3A3A3C] dark:text-white
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={adminConfirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
          </label>

          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
        </div>
      </form>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          className="
            px-4 py-2 rounded-lg font-medium
            bg-gray-300 text-black
            dark:bg-[#3A3A3C] dark:text-white
            hover:bg-gray-400 dark:hover:bg-[#4A4A4D]
            transition
          "
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          form="collegeForm"
          disabled={loading || isSubmitDisabled()}
          className="
            px-4 py-2 rounded-lg font-medium text-white 
            bg-blue-600 hover:bg-blue-700 
            dark:bg-blue-700 dark:hover:bg-blue-600 
            disabled:opacity-50 transition
          "
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
);

};

export default EditCollegeModal;