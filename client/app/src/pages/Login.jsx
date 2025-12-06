import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { setToken, setUserRole, setUser } from "../utils/auth";

const Login = ({ onClose }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("token/", { username, password });
      const { access } = res.data;

      const payload = JSON.parse(atob(access.split(".")[1]));
      const role = payload.role ? payload.role.toUpperCase() : "";
      const userId = payload.user_id;

      setToken(access);
      setUserRole(role);

      const userRes = await api.get(`/users/${userId}/`);
      setUser(userRes.data);

      if (role === "SUPERADMIN") navigate("/superadmin/dashboard");
      else if (role === "COLLEGE_ADMIN") navigate("/college/dashboard");
      else if (role === "DEPARTMENT_ADMIN") navigate("/department/dashboard");
      else setError("You do not have access to this system.");
    } catch (err) {
      console.error(err);
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 
                    rounded-2xl shadow-2xl p-10 
                    border-4 border-red-400 dark:border-blue-600 
                    transition-all">

      {/* CLOSE BUTTON */}
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 
                   dark:text-gray-300 dark:hover:text-white text-xl"
        onClick={onClose}
      >
        ✖
      </button>

      {/* TITLE */}
      <h2 className="text-3xl font-bold text-center mb-8 
                     text-gray-800 dark:text-white">
        Login
      </h2>

      {error && <p className="text-red-600 text-center mb-3">{error}</p>}

      <form className="space-y-6" onSubmit={handleLogin}>
        
        {/* Username */}
        <div>
          <label className="block text-sm font-medium 
                            text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-4 py-3 
                       border border-gray-300 dark:border-gray-600 
                       dark:bg-gray-700 dark:text-white 
                       rounded-lg shadow-sm focus:border-blue-500"
            placeholder="Enter your username"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium 
                            text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-4 py-3 
                       border border-gray-300 dark:border-gray-600 
                       dark:bg-gray-700 dark:text-white 
                       rounded-lg shadow-sm focus:border-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 text-lg font-semibold rounded-lg 
                     bg-red-600 hover:bg-red-700 
                     dark:bg-blue-600 dark:hover:bg-blue-700 
                     text-white transition-all"
        >
          Log In
        </button>

      </form>
    </div>
  );
};

export default Login;
