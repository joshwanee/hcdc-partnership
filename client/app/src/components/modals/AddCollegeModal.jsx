import { useState } from "react";
import api from "../../api";
import { FiUpload } from "react-icons/fi";

const AddCollegeModal = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Admin fields
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");

  // Errors
  const [passwordError, setPasswordError] = useState("");
  const [backendError, setBackendError] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔥 Password Validation
  const validatePassword = (value, confirmValue = adminConfirmPassword) => {
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

    if (passwordError) return;

    if (adminPassword !== adminConfirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create Admin User
      const adminPayload = {
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: "COLLEGE_ADMIN",
      };

      const userRes = await api.post("users/", adminPayload);
      const adminId = userRes.data.id;

      // 2️⃣ Create College
      const formData = new FormData();
      formData.append("name", name);
      formData.append("code", code);
      formData.append("admin", adminId);
      if (logo) formData.append("logo", logo);

      // CHANGE: Capture the college response to get the college ID
      const collegeRes = await api.post("colleges/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const collegeId = collegeRes.data.id; // Assuming the response includes the college ID

      // CHANGE: Update the admin user to associate with the college
      await api.patch(`users/${adminId}/`, { college: collegeId });

      onAdded();
      onClose();

    } catch (err) {
      console.error("Failed to add college", err);

      // 🔥 Catch backend validation errors (like "This password is too common.")
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
      fixed inset-0 
      bg-black/40 dark:bg-black/60 
      backdrop-blur-sm 
      flex justify-center items-center 
      z-50 p-4

      opacity-0 animate-fadeIn
    "
  >
    {/* Modal Card */}
    <div
      className="
        w-full max-w-3xl 
        bg-white dark:bg-[#1C1C1E] 
        dark:text-white
        rounded-2xl shadow-2xl 
        p-6 max-h-[90vh] overflow-y-auto

        scale-95 opacity-0 animate-modalEnter
      "
    >
      {/* Title */}
      <h2 className="text-2xl font-bold mb-6 text-center">
        Add New College
      </h2>

      {backendError && (
        <p className="text-red-500 text-sm mb-3">{backendError}</p>
      )}

      <form
        id="addCollegeForm"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">College Details</h3>

          {/* INPUT STYLE */}
          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">
              College Name *
            </span>
            <input
              type="text"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:text-white
                dark:border-[#3A3A3C]

                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">
              College Code *
            </span>
            <input
              type="text"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:text-white
                dark:border-[#3A3A3C]
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>

          <label className="block mb-6">
  <span className="text-sm font-medium dark:text-white">
    College Logo <span className="text-xs text-gray-500">(Optional)</span>
  </span>

  <div className="mt-2">
    <label
      className="
        group flex flex-col items-center justify-center
        w-full max-w-sm p-5
        border-2 border-dashed rounded-xl cursor-pointer
        border-red-400 dark:border-blue-400
        bg-red-50/50 dark:bg-blue-950/40
        hover:bg-red-100/70 dark:hover:bg-blue-900/60
        transition-all duration-300
      "
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          setLogo(file);
          setLogoPreview(URL.createObjectURL(file));
        }}
      />

      {logoPreview ? (
        <>
          <img
            src={logoPreview}
            alt="Selected logo"
            className="w-28 h-28 rounded-full object-cover shadow-md"
          />
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            {logo.name}
          </p>
        </>
      ) : (
        <>
          <FiUpload className="text-4xl text-red-600 dark:text-blue-400" />
          <p className="mt-2 text-sm font-semibold text-red-700 dark:text-blue-300">
            Click to upload image
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Please use WEBP format for better performance.
          </p>
        </>
      )}
    </label>
  </div>
</label>


        </div>

        {/* Right Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">College Admin Details</h3>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">
              Admin Username *
            </span>
            <input
              type="text"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:text-white
                dark:border-[#3A3A3C]
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              required
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">
              Admin Email *
            </span>
            <input
              type="email"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:text-white
                dark:border-[#3A3A3C]
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">
              Admin Password *
            </span>
            <input
              type="password"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:text-white
                dark:border-[#3A3A3C]
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={adminPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium dark:text-white">
              Confirm Password *
            </span>
            <input
              type="password"
              className="
                w-full border p-2 rounded-lg mt-1
                bg-white text-black
                dark:bg-[#2C2C2E] dark:text-white
                dark:border-[#3A3A3C]
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              "
              value={adminConfirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              required
            />
          </label>

          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
        </div>
      </form>

      {/* Buttons */}
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
        >
          Cancel
        </button>

        <button
          type="submit"
          form="addCollegeForm"
          disabled={!!passwordError || loading}
          className={`
            px-4 py-2 rounded-lg font-medium text-white transition
            ${passwordError 
              ? "bg-gray-400 dark:bg-[#2C2C2E]" 
              : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            }
          `}
        >
          {loading ? "Processing..." : "Add College"}
        </button>
      </div>
    </div>
  </div>
);

};

export default AddCollegeModal;