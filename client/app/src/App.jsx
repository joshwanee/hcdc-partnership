import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";

/* SUPERADMIN */
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import Dashboard from "./pages/superadmin/Dashboard";
import Colleges from "./pages/superadmin/Colleges";
import Departments from "./pages/superadmin/Departments";
import Partnerships from "./pages/superadmin/Partnerships";
import Users from "./pages/superadmin/Users";
import ViewingSection from "./pages/ViewingSection";  

/* COLLEGE ADMIN */
import CollegeAdminLayout from "./layouts/CollegeAdminLayout";
import CollegeDashboard from "./pages/collegeAdmin/CollegeDashboard";
import CollegeDepartments from "./pages/collegeAdmin/CollegeDepartments";
import CollegePartnerships from "./pages/collegeAdmin/CollegePartnerships";

/* DEPARTMENT ADMIN */
import DepartmentAdminLayout from "./layouts/DepartmentAdminLayout";
import DepartmentDashboard from "./pages/departmentAdmin/DepartmentDashboard";
import DepartmentPartnerships from "./pages/departmentAdmin/DepartmentPartnership";

const App = () => {
  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route path="/landing" element={<Landing />} />

        {/* ==========================
           SUPERADMIN ROUTES
        =========================== */}
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute roles={["SUPERADMIN"]}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="colleges" element={<Colleges />} />
          <Route path="departments" element={<Departments />} />
          <Route path="departments/:collegeId" element={<Departments />} />
          <Route path="partnerships" element={<Partnerships />} />
          <Route path="users" element={<Users />} />
          <Route path="viewing-section" element={<ViewingSection />} />
        </Route>

        {/* ==========================
           COLLEGE ADMIN ROUTES
        =========================== */}
        <Route
          path="/college/*"
          element={
            <ProtectedRoute roles={["COLLEGE_ADMIN"]}>
              <CollegeAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CollegeDashboard />} />
          <Route path="departments" element={<CollegeDepartments />} />
          <Route path="partnerships" element={<CollegePartnerships />} />
          <Route path="viewing-section" element={<ViewingSection />} />
        </Route>

        {/* ==========================
           DEPARTMENT ADMIN ROUTES
        =========================== */}
        <Route
          path="/department/*"
          element={
            <ProtectedRoute roles={["DEPARTMENT_ADMIN"]}>
              <DepartmentAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DepartmentDashboard />} />
          <Route path="partnerships" element={<DepartmentPartnerships />} />
          <Route path="viewing-section" element={<ViewingSection />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/landing" />} />

      </Routes>
    </Router>
  );
};

export default App;
