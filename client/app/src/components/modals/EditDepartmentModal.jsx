import { useEffect, useState } from "react";
import api from "../../api";

const EditDepartmentModal = ({ onClose, onUpdated, department }) => {
  const [name, setName] = useState(department.name);
  const [code, setCode] = useState(department.code);
  const [logo, setLogo] = useState(null);

  const [adminId, setAdminId] = useState(department.admin);
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
        setError("Failed to load admin details.");
      }
    };
    fetchAdmin();
  }, [adminId]);

  // Password Validation
  const handlePasswordChange = (value) => {
    setAdminPassword(value);

    if (value && value.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
    } else if (value && (!/\d/.test(value) || !/[A-Za-z]/.test(value))) {
      setPasswordError("Password must contain letters and numbers.");
    } else if (value && !adminConfirmPassword) {
      setPasswordError("Please confirm your password.");
    } else if (value !== adminConfirmPassword) {
      setPasswordError("Passwords do not match!");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setAdminConfirmPassword(value);

    if (adminPassword && value !== adminPassword) {
      setPasswordError("Passwords do not match!");
    } else {
      setPasswordError("");
    }
  };

  const isSubmitDisabled = () => {
    if (adminPassword && (passwordError || !adminConfirmPassword)) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUsernameError("");
    setLoading(true);

    if (!name.trim() || !code.trim()) {
      setError("Department name and code are required.");
      setLoading(false);
      return;
    }

    if (passwordError) {
      setError("Fix password issues first.");
      setLoading(false);
      return;
    }

    // Username Uniqueness Check
    if (adminUsername.trim()) {
      try {
        const res = await api.get(`/users/?username=${adminUsername.trim()}`);
        const users = Array.isArray(res.data) ? res.data : [res.data];
        const existingUser = users.find(
          (u) => u.username === adminUsername.trim()
        );

        if (existingUser && existingUser.id !== adminId) {
          setUsernameError("Username already exists.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Username check failed", err);
        setError("Failed to check username.");
        setLoading(false);
        return;
      }
    }

    try {
      let updatedAdminId = adminId;

      // Updating/Creating Admin
      if (adminUsername.trim() || adminEmail.trim()) {
        if (!adminUsername.trim() || !adminEmail.trim()) {
          setError("Username and email are required.");
          setLoading(false);
          return;
        }

        const adminData = {
          username: adminUsername.trim(),
          email: adminEmail.trim(),
          role: "DEPARTMENT_ADMIN",
        };

        if (adminPassword) adminData.password = adminPassword;

        if (adminId) {
          const resAdmin = await api.patch(`/users/${adminId}/`, adminData);
          updatedAdminId = resAdmin.data.id;
        } else {
          const resAdmin = await api.post(`/users/`, adminData);
          updatedAdminId = resAdmin.data.id;
        }

        await api.patch(`/users/${updatedAdminId}/`, {
          department: department.id,
        });
      }

      // UPDATE DEPARTMENT
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("code", code.trim());
      formData.append("college", department.college);
      formData.append("admin", updatedAdminId || "");

      if (logo) formData.append("logo", logo);

      const resDept = await api.patch(
        `/departments/${department.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      onUpdated(resDept.data);
      onClose();
    } catch (error) {
      console.error("Update failed", error);

      if (error.response?.data) {
        const backendErrors = error.response.data;
        let messages = [];

        for (const field in backendErrors) {
          const val = backendErrors[field];
          messages.push(...(Array.isArray(val) ? val : [val]));
        }

        setError(messages.join(" "));
      } else {
        setError("Update failed. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="
        fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm 
        flex justify-center items-center p-4 z-50

        opacity-0 animate-fadeIn
      "
    >
      <div
        className="
          w-full max-w-3xl 
          bg-white dark:bg-[#1C1C1E] dark:text-white
          rounded-2xl shadow-2xl 
          p-6 max-h-[90vh] overflow-y-auto

          scale-95 opacity-0 animate-modalEnter
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Edit Department
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form
          id="departmentForm"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* LEFT SIDE */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Department Details
            </h3>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                <strong>ID:</strong> {department.id}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(department.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Updated:</strong>{" "}
                {new Date(department.updated_at).toLocaleString()}
              </p>
            </div>

            {/* Modern inputs */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Department Name *</span>
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
              <span className="text-sm font-medium">Code *</span>
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
              <span className="text-sm font-medium">Department Logo</span>
              <input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => setLogo(e.target.files[0])}
              />
            </label>

            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Current Logo:</p>
              <img
                src={department.logo}
                className="w-20 h-20 object-cover rounded-full border"
                alt="Dept logo"
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Admin</h3>

            <label className="block mb-4">
              <span className="text-sm font-medium">Username</span>
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
              <span className="text-sm font-medium">Email</span>
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
              <span className="text-sm font-medium">
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
              <span className="text-sm font-medium">Confirm Password</span>
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

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end mt-8 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 rounded-lg 
              bg-gray-300 text-black
              dark:bg-[#3A3A3C] dark:text-white
              hover:bg-gray-400 dark:hover:bg-[#4A4A4D]
              transition
            "
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="departmentForm"
            disabled={loading || isSubmitDisabled()}
            className="
              px-4 py-2 rounded-lg font-medium text-white
              bg-blue-600 hover:bg-blue-700 
              dark:bg-blue-700 dark:hover:bg-blue-500
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

export default EditDepartmentModal;
