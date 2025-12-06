import { useEffect, useState } from "react";
import api from "../../api";

const UserModal = ({ user, onClose, onUpdated }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(user.role);
  const [college, setCollege] = useState(user.college || "");
  const [department, setDepartment] = useState(user.department || "");
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [passwordError, setPasswordError] = useState("");
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load colleges + departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegesRes, departmentsRes] = await Promise.all([
          api.get("colleges/"),
          api.get("departments/"),
        ]);
        setColleges(collegesRes.data);
        setDepartments(departmentsRes.data);
      } catch (err) {
        console.error("Failed to fetch colleges/departments", err);
      }
    };
    fetchData();
  }, []);

  // Validate password
  const validatePassword = (value, confirmValue = confirmPassword) => {
    if (value && value.length < 8)
      return "Password must be at least 8 characters.";

    if (value && (!/\d/.test(value) || !/[A-Za-z]/.test(value)))
      return "Password must contain letters and numbers.";

    if (confirmValue && value !== confirmValue)
      return "Passwords do not match.";

    return "";
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setPasswordError(validatePassword(password, value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");

    if (passwordError) return;
    if (password && password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username,
        email,
        role,
        college: college || null,
        department: department || null,
      };

      if (password) payload.password = password;

      await api.patch(`users/${user.id}/`, payload);
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update user", err);

      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        let messages = [];
        Object.keys(backendErrors).forEach((field) => {
          const errors = backendErrors[field];
          if (Array.isArray(errors)) messages.push(...errors);
          else messages.push(errors);
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
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="
        relative z-50 w-full max-w-md p-6 rounded-xl shadow-xl
        bg-white dark:bg-black
        text-black dark:text-white
        border border-gray-300 dark:border-gray-700
        max-h-[90vh] overflow-y-auto
      ">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>

        {backendError && (
          <p className="text-red-500 text-sm mb-3">{backendError}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <label className="block">
            <span className="text-sm font-semibold">Username *</span>
            <input
              type="text"
              className="
                w-full border rounded p-2 mt-1
                bg-gray-100 dark:bg-gray-800
                dark:border-gray-600
              "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          {/* Email */}
          <label className="block">
            <span className="text-sm font-semibold">Email *</span>
            <input
              type="email"
              className="
                w-full border rounded p-2 mt-1
                bg-gray-100 dark:bg-gray-800
                dark:border-gray-600
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {/* Role */}
          <label className="block">
            <span className="text-sm font-semibold">Role *</span>
            <select
              className="
                w-full border rounded p-2 mt-1 
                bg-gray-100 dark:bg-gray-800
                dark:border-gray-600
              "
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="COLLEGE_ADMIN">College Admin</option>
              <option value="DEPARTMENT_ADMIN">Department Admin</option>
            </select>
          </label>

          {/* College */}
          <label className="block">
            <span className="text-sm font-semibold">College</span>
            <select
              className="
                w-full border rounded p-2 mt-1
                bg-gray-100 dark:bg-gray-800
                dark:border-gray-600
              "
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            >
              <option value="">Select College</option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </label>

          {/* Department */}
          <label className="block">
            <span className="text-sm font-semibold">Department</span>
            <select
              className="
                w-full border rounded p-2 mt-1
                bg-gray-100 dark:bg-gray-800
                dark:border-gray-600
              "
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </label>

          {/* Password */}
          <label className="block">
            <span className="text-sm font-semibold">Password (optional)</span>
            <input
              type="password"
              className="
                w-full border rounded p-2 mt-1
                bg-gray-100 dark:bg-gray-800
                dark:border-gray-600
              "
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </label>

          {/* Confirm */}
          <label className="block">
            <span className="text-sm font-semibold">Confirm Password</span>
            <input
              type="password"
              className="
                w-full border rounded p-2 mt-1
                bg-gray-100 dark:bg-gray-800
                dark:border-gray-600
              "
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
          </label>

          {/* Password Validation */}
          {passwordError && (
            <p className="text-red-500 text-xs">{passwordError}</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 rounded 
                bg-gray-300 dark:bg-gray-700 
                text-black dark:text-white
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!!passwordError || loading}
              className={`
                px-4 py-2 rounded text-white
                ${passwordError || loading
                  ? "bg-gray-500"
                  : "bg-blue-600 hover:bg-blue-700"}
              `}
            >
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UserModal;
