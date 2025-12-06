import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../utils/auth";

const ProtectedRoute = ({ children, roles }) => {
  const token = getToken();
  const role = getUserRole();

  // No token → not logged in
  if (!token) {
    return <Navigate to="/landing" replace />;
  }

  // Has token but role is not allowed
  if (roles && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children; 
};

export default ProtectedRoute;
