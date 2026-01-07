import { useState, useEffect } from "react";
import ImageWithFallback from "../ImageWithFallback";
import api from "../../api";

const EditPartnershipModal = ({ onClose, onUpdated, partnership }) => {
  const [title, setTitle] = useState(partnership.title);
  const [description, setDescription] = useState(partnership.description);
  const [status, setStatus] = useState(partnership.status);
  const [logo, setLogo] = useState(null);

  // NEW FIELDS
  const [contactPerson, setContactPerson] = useState(partnership.contact_person || "");
  const [contactEmail, setContactEmail] = useState(partnership.contact_email || "");
  const [contactPhone, setContactPhone] = useState(partnership.contact_phone || "");
  const [phoneType, setPhoneType] = useState(partnership.phone_type || "cell"); // Added phone type state
  const [dateStarted, setDateStarted] = useState(partnership.date_started || "");
  const [dateEnded, setDateEnded] = useState(partnership.date_ended || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    if(!phone) return null; // Allow empty phone number
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

  // Sanitize initial contactPhone (remove non-digits, enforce max)
  useEffect(() => {
    if (!contactPhone) return;
    const digits = contactPhone.replace(/\D/g, "");
    const max = phoneType === "cell" ? 11 : 10;
    const newVal = digits.slice(0, max);
    if (newVal !== contactPhone) setContactPhone(newVal);
    // Auto-detect phone type from initial number length
    if (digits.length === 11) {
      setPhoneType("cell");
    } else if (digits.length > 0) {
      setPhoneType("telephone");
    }
  }, []);

  // Auto-adjust phoneType while editing based on digits length
  useEffect(() => {
    const digits = (contactPhone || "").replace(/\D/g, "");
    if (digits.length === 11 && phoneType !== "cell") {
      setPhoneType("cell");
    } else if (digits.length > 0 && digits.length <= 10 && phoneType !== "telephone") {
      setPhoneType("telephone");
    }
  }, [contactPhone]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
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
      formData.append("department", partnership.department);

      // NEW FIELDS
      formData.append("contact_person", contactPerson || "");
      formData.append("contact_email", contactEmail || "");
      formData.append("contact_phone", contactPhone || "");
      formData.append("phone_type", phoneType); // Send phone type

      if (dateStarted) formData.append("date_started", dateStarted);
      if (dateEnded) formData.append("date_ended", dateEnded);

      // Only attach logo if user chose a new one
      if (logo instanceof File) {
        formData.append("logo", logo);
      }

      const res = await api.patch(`/partnerships/${partnership.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdated(res.data);
      onClose();
    } catch (error) {
      console.error("Update failed", error.response?.data || error);
      setError("Update failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm 
        flex justify-center items-center z-50 p-4
        opacity-0 animate-fadeIn"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto
          bg-white text-black dark:bg-[#1C1C1E] dark:text-white
          scale-95 opacity-0 animate-modalEnter"
        onMouseDown={(e) => e.stopPropagation()}
      >

        <h2 className="text-2xl font-bold mb-4 text-center">Edit Partnership</h2>

        <form
          id="editPartnershipForm"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          {/* LEFT COLUMN */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Partnership Details</h3>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>ID:</strong> {partnership.id}</p>
              <p><strong>Created:</strong> {new Date(partnership.created_at).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(partnership.updated_at).toLocaleString()}</p>
            </div>

            {/* TITLE */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Title *</span>
              <input
                type="text"
                className="w-full border p-2 rounded-lg mt-1 
                  bg-white text-black dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            {/* DESCRIPTION */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Description *</span>
              <textarea
                className="w-full border p-2 rounded-lg mt-1 h-28 resize-none
                  bg-white text-black dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>

            {/* STATUS */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Status</span>
              <select
                className="w-full border p-2 rounded-lg mt-1
                  bg-white text-black dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            {/* LOGO UPLOAD */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Change Logo</span>
              <input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => setLogo(e.target.files[0])}
              />
            </label>

            {/* CURRENT LOGO */}
            <div className="mb-3">
              <p className="text-sm font-semibold mb-1">Current Logo:</p>
              <ImageWithFallback
                src={partnership.logo}
                alt="Partnership Logo"
                className="w-20 h-20 object-cover rounded-full border"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact & Dates</h3>

            {/* CONTACT PERSON */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Contact Person</span>
              <input
                type="text"
                className="w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </label>

            {/* CONTACT EMAIL */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Contact Email</span>
              <input
                type="email"
                className="w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </label>

            {/* PHONE TYPE SELECTION */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Phone Type</span>
              <select
                className="w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]"
                value={phoneType}
                onChange={(e) => setPhoneType(e.target.value)}
              >
                <option value="cell">Cell Phone</option>
                <option value="telephone">Telephone</option>
              </select>
            </label>

            {/* CONTACT PHONE */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Contact Phone</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={phoneType === "cell" ? 11 : 10}
                className="w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]"
                value={contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
            </label>

            {/* DATE STARTED */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Date Started *</span>
              <input
                type="date"
                className="w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]"
                value={dateStarted}
                onChange={(e) => setDateStarted(e.target.value)}
              />
            </label>

            {/* DATE ENDED */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Date Ended (Optional)</span>
              <input
                type="date"
                className="w-full border p-2 rounded-lg mt-1
                  bg-white dark:bg-[#2C2C2E] dark:text-white dark:border-[#3A3A3C]"
                value={dateEnded}
                onChange={(e) => setDateEnded(e.target.value)}
                disabled={!dateStarted} // Disable if Date Started is empty
              />
            </label>
          </div>

        </form>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gray-300 text-black
              dark:bg-[#3A3A3C] dark:text-white
              hover:bg-gray-400 dark:hover:bg-[#4A4A4D]"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="editPartnershipForm"
            className="px-4 py-2 rounded-lg font-medium text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500
              disabled:opacity-50 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPartnershipModal;
