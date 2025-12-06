const CollegeModal = ({ isOpen, college, departments, onClose }) => {
  if (!isOpen || !college) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-11/12 md:w-1/2 lg:w-1/3 p-6 rounded-xl shadow-lg animate-fadeIn">
        <h3 className="text-xl font-bold mb-4">
          Departments under {college.name}
        </h3>

        {/* Departments List */}
        {departments.length > 0 ? (
          <ul className="space-y-2">
            {departments.map((dept) => (
              <li key={dept.id} className="p-2 bg-gray-100 rounded-lg">
                {dept.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No departments available.</p>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CollegeModal;
