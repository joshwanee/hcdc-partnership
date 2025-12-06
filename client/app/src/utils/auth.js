// -------- TOKEN --------
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

// -------- ROLE (optional helper) --------
export const getUserRole = () => localStorage.getItem("role");
export const setUserRole = (role) => localStorage.setItem("role", role);
export const removeUserRole = () => localStorage.removeItem("role");

// -------- FULL USER OBJECT --------
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem("user");
};
