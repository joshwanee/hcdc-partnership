import { useEffect, useState } from "react";
import api from "../../api";
import UserModal from "../../components/modals/UserModal";
import DataTable from "../../components/ui/DataTable";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ NEW: Role Filter Dropdown
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Fetch everything
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [usersRes, collegesRes, departmentsRes] = await Promise.all([
          api.get("users/"),
          api.get("colleges/"),
          api.get("departments/"),
        ]);

        setUsers(usersRes.data);
        setColleges(collegesRes.data);
        setDepartments(departmentsRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const collegeMap = colleges.reduce(
    (map, col) => ({ ...map, [col.id]: col.code }),
    {}
  );

  const departmentMap = departments.reduce(
    (map, dep) => ({ ...map, [dep.id]: dep.code }),
    {}
  );

  const handleUpdate = () => {
    api.get("users/").then((res) => setUsers(res.data));
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`users/${userId}/`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user.");
    }
  };

  // ⭐ FILTERING LOGIC
  const filteredUsers = users.filter((u) => {
    // Exclude SUPER_ADMIN users
    if (u.role === "SUPER_ADMIN") return false;
    if (roleFilter === "ALL") return true;
    return u.role === roleFilter;
  });

  // Prepare rows for DataTable
  const tableData = filteredUsers.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role.replace("_", " "),
    college: u.college ? collegeMap[u.college] : "—",
    department: u.department ? departmentMap[u.department] : "—",
  }));

  return (
    <div className="px-0 md:px-6 py-4 w-full dark:text-white">

      {/* ⭐ TITLE + DROPDOWN ON RIGHT */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Users</h2>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="
            p-2 border rounded 
            bg-white dark:bg-black 
            dark:text-white 
            border-gray-300 dark:border-gray-600
          "
        >
          <option value="ALL">All Users</option>
          <option value="COLLEGE_ADMIN">College Admin</option>
          <option value="DEPARTMENT_ADMIN">Department Admin</option>
          <option value="GUEST">Guest</option>
        </select>
      </div>

      {/* ⭐ REUSABLE DATATABLE */}
      <DataTable
        columns={[
          { header: "Username", accessor: "username" },
          { header: "Email", accessor: "email" },
          { header: "Role", accessor: "role" },
          { header: "College", accessor: "college" },
          { header: "Department", accessor: "department" },
        ]}
        data={tableData}
        loading={loading}
        onEdit={(row) => {
          const realUser = users.find((u) => u.id === row.id);
          setSelectedUser(realUser);
          setShowModal(true);
        }}
        onDelete={(id) => handleDelete(id)}
      />

      {/* MODAL */}
      {showModal && selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onUpdated={handleUpdate}
        />
      )}
    </div>
  );
};

export default Users;
