import { useState } from "react";
import api from "../../api";

const AddDepartmentModal = ({ onClose, onAdded, collegeId, colleges }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [logo, setLogo] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(collegeId || "");

  // Admin fields
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  // PASSWORD VALIDATION
  const validatePassword = (value, confirmValue = adminConfirmPassword) => {
    if (!value) return "";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/\d/.test(value) || !/[A-Za-z]/.test(value))
      return "Password must contain letters and numbers.";
    if (confirmValue && value !== confirmValue)
      return "Passwords do not match.";
    return "";
  };

  const handlePasswordChange = (value) => {
    setAdminPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleConfirmPasswordChange = (value) => {
    setAdminConfirmPassword(value);
    setPasswordError(validatePassword(adminPassword, value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");

    if (!name.trim() || !code.trim() || (!collegeId && !selectedCollege)) {
      setBackendError("Department name, code, and college are required.");
      return;
    }

    if (passwordError) return;

    if (adminPassword && adminPassword !== adminConfirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      let adminId = null;

      // CREATE ADMIN IF PROVIDED
      if (adminUsername.trim() || adminEmail.trim()) {
        if (!adminUsername.trim() || !adminEmail.trim() || !adminPassword) {
          setBackendError(
            "Username, email, and password are required for admin."
          );
          setLoading(false);
          return;
        }

        const adminPayload = {
          username: adminUsername.trim(),
          email: adminEmail.trim(),
          password: adminPassword,
          role: "DEPARTMENT_ADMIN",
        };

        const userRes = await api.post("users/", adminPayload);
        adminId = userRes.data.id;
      }

      // CREATE DEPARTMENT
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("code", code.trim());
      formData.append("college", collegeId || selectedCollege);
      if (adminId) formData.append("admin", adminId);
      if (logo) formData.append("logo", logo);

      const deptRes = await api.post("departments/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const departmentId = deptRes.data.id;

      // LINK ADMIN TO DEPARTMENT
      if (adminId) {
        await api.patch(`users/${adminId}/`, { department: departmentId });
      }

      onAdded(deptRes.data);
      onClose();
    } catch (err) {
      console.error("Failed to add department", err);

      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        let messages = [];

        Object.keys(backendErrors).forEach((field) => {
          const errors = backendErrors[field];
          if (Array.isArray(errors)) {
            messages.push(...errors);
          } else {
            messages.push(errors);
          }
        });

        setBackendError(messages.join(" "));
      } else {
        setBackendError("Something went wrong. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 bg-black/40 dark:bg-black/60 
        backdrop-blur-sm 
        flex justify-center items-center 
        z-50 p-4
        
        opacity-0 animate-fadeIn
      "
    >
      <div
        className="
          w-full max-w-3xl 
          bg-white dark:bg-[#1C1C1E] 
          rounded-2xl shadow-2xl 
          p-6 max-h-[90vh] overflow-y-auto
          dark:text-white

          scale-95 opacity-0 animate-modalEnter
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Add Department
        </h2>

        {backendError && (
          <p className="text-red-500 text-sm mb-4">{backendError}</p>
        )}

        <form
          id="addDepartmentForm"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* LEFT COLUMN */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Department Details</h3>

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

            {!collegeId && (
              <label className="block mb-4">
                <span className="text-sm font-medium">College *</span>
                <select
                  className="
                    w-full border p-2 rounded-lg mt-1
                    bg-white text-black
                    dark:bg-[#2C2C2E] dark:border-[#3A3A3C] dark:text-white
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                  "
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block mb-4">
              <span className="text-sm font-medium">Department Logo</span>
              <input
                type="file"
                accept="image/*"
                className="mt-2 text-sm"
                onChange={(e) => setLogo(e.target.files[0])}
              />
            </label>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Department Admin (Optional)
            </h3>

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
              <span className="text-sm font-medium">Password</span>
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

        {/* Action Buttons */}
        <div className="flex justify-end mt-8 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              px-4 py-2 rounded-lg font-medium
              bg-gray-300 text-black
              dark:bg-[#3A3A3C] dark:text-white
              hover:bg-gray-400 dark:hover:bg-[#4A4A4D]
              transition
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            form="addDepartmentForm"
            disabled={!!passwordError || loading}
            className="
              px-4 py-2 rounded-lg font-medium text-white
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-700 dark:hover:bg-blue-500
              disabled:opacity-50 transition
            "
          >
            {loading ? "Adding..." : "Add Department"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentModal;
