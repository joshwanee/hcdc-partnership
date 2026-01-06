import { useState, useEffect } from "react";
import api from "../../api";
import { FiUpload } from "react-icons/fi";


const AddPartnershipModal = ({ onClose, onAdded, departmentId, departments }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [logo, setLogo] = useState(null);

  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [phoneType, setPhoneType] = useState("cell");  // New state for phone type

  const [dateStarted, setDateStarted] = useState("");
  const [dateEnded, setDateEnded] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState(departmentId || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    const cellPhoneRegex = /^[0-9]{11}$/;  // Cell phone (e.g., 09123456789)
    const telPhoneRegex = /^[0-9]{7,10}$/; // Telephone (e.g., 2123456)
    
    if (phoneType === "cell" && !cellPhoneRegex.test(phone)) {
      return "Invalid cell phone number. It should be 11 digits.";
    }

    if (phoneType === "telephone" && !telPhoneRegex.test(phone)) {
      return "Invalid telephone number. It should be between 7 and 10 digits.";
    }

    return null;
  };

  // Ensure only digits and enforce max length based on phoneType
  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, "");
    const max = phoneType === "cell" ? 11 : 10;
    setContactPhone(digits.slice(0, max));
  };

  // Trim contactPhone if phoneType changes to a smaller max
  useEffect(() => {
    const max = phoneType === "cell" ? 11 : 10;
    if (contactPhone.length > max) {
      setContactPhone(contactPhone.slice(0, max));
    }
  }, [phoneType]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !title.trim() ||
      !description.trim() ||
      (!departmentId && !selectedDepartment) ||
      !dateStarted
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const phoneValidationError = validatePhoneNumber(contactPhone);
    if (phoneValidationError) {
      setError(phoneValidationError);
      setLoading(false);
      return;
    }

    // Date Ended validation if Date Started is not empty
    if (dateStarted && dateEnded) {
      const startDate = new Date(dateStarted);
      const endDate = new Date(dateEnded);

      if (endDate <= startDate) {
        setError("Date Ended must be a future date compared to Date Started.");
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("status", status);
      formData.append("department", departmentId || selectedDepartment);

      // New Fields
      formData.append("contact_person", contactPerson);
      formData.append("contact_email", contactEmail);
      formData.append("contact_phone", contactPhone);
      formData.append("phone_type", phoneType); // Send phone type

      formData.append("date_started", dateStarted);
      if (dateEnded) formData.append("date_ended", dateEnded);
      if (logo && logo instanceof File) {
        formData.append("logo", logo);
      }

      const res = await api.post(`/partnerships/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onAdded(res.data);
      onClose();
    } catch (error) {
      console.error("Add failed", error.response?.data || error);
      setError(JSON.stringify(error.response?.data) || "Add failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className="
        fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm 
        flex justify-center items-center z-50 p-4
        opacity-0 animate-fadeIn
      "
      onMouseDown={onClose}
    >
      <div
        className="
          w-full max-w-3xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto
          bg-white text-black 
          dark:bg-[#1C1C1E] dark:text-white
          scale-95 opacity-0 animate-modalEnter
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Add Partnership</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form
          id="addPartnershipForm"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          {/* Left Column */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Partnership Details</h3>

            {/* Title */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Title *</span>
              <input
                type="text"
                className="
                  w-full border p-2 rounded-lg mt-1 
                  bg-white text-black 
                  dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                "
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            {/* Description */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Description *</span>
              <textarea
                className="
                  w-full border p-2 rounded-lg mt-1 h-28 resize-none
                  bg-white text-black 
                  dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                "
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>

            {/* Status */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Status</span>
              <select
                className="
                  w-full border p-2 rounded-lg mt-1
                  bg-white text-black 
                  dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                "
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            {/* Department Dropdown */}
            {!departmentId && (
              <label className="block mb-4">
                <span className="text-sm font-medium">Department *</span>
                <select
                  className="
                    w-full border p-2 rounded-lg mt-1
                    bg-white text-black 
                    dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                  "
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Logo */}
            <label className="block mb-4">
              <span className="text-sm font-medium">
                Partnership Logo <span className="text-xs text-gray-500">(Optional)</span>
              </span>

              <label
                className="
                  mt-1 flex flex-col items-center gap-3
                  w-full p-2.5
                  border-2 border-dashed rounded-lg cursor-pointer
                  border-red-400 dark:border-blue-500
                  bg-red-50/40 dark:bg-blue-950/30
                  hover:bg-red-100/60 dark:hover:bg-blue-900/50
                  transition-all duration-300
                "
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogo(e.target.files[0])}
                />

                <div className="flex flex-row items-center gap-1">
                  <FiUpload className="text-lg flex text-red-600 dark:text-blue-400" />

                  <span className="flex text-sm text-red-700 dark:text-blue-300">
                  Upload logo
                </span>
                </div>

                
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Please use WEBP format for better performance.
                </p>
              </label>

              {logo && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400 truncate">
                  {logo.name}
                </p>
              )}
            </label>

          </div>

          {/* Right Column */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact & Dates</h3>

            {/* Contact Person */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Contact Person</span>
              <input
                type="text"
                className="
                  w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                "
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </label>

            {/* Contact Email */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Contact Email</span>
              <input
                type="email"
                className="
                  w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                "
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </label>

            {/* PHONE TYPE SELECTION */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Phone Type</span>
              <select
                className="
                  w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                "
                value={phoneType}
                onChange={(e) => setPhoneType(e.target.value)}
              >
                <option value="cell">Cell Phone</option>
                <option value="telephone">Telephone</option>
              </select>
            </label>

            {/* Contact Phone */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Contact Phone</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={phoneType === "cell" ? 11 : 10}
                className="
                  w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                "
                value={contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
            </label>

            {/* Date Started */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Date Started *</span>
              <input
                type="date"
                className="
                  w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                "
                value={dateStarted}
                onChange={(e) => setDateStarted(e.target.value)}
                required
              />
            </label>

            {/* Date Ended */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Date Ended (Optional)</span>
              <input
                type="date"
                className="
                  w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                "
                value={dateEnded}
                onChange={(e) => setDateEnded(e.target.value)}
                disabled={!dateStarted}  // Disable if Date Started is empty
              />
            </label>
          </div>

        </form>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="
              px-4 py-2 rounded-lg bg-gray-300 text-black
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
            form="addPartnershipForm"
            disabled={loading}
            className="
              px-4 py-2 rounded-lg font-medium text-white
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-700 dark:hover:bg-blue-500
              disabled:opacity-50 transition
            "
          >
            {loading ? "Adding..." : "Add Partnership"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPartnershipModal;
