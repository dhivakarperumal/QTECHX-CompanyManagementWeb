/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const defaultAuthValue = {
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
  loading: false,
  loginOpen: false,
  setLoginOpen: () => {},
  profileName: "Admin",
  role: "admin",
  email: "",
  phone: "",
};

export const AuthContext = createContext(defaultAuthValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthValue;
};

const normalizeRoleValue = (roleValue) => roleValue?.toString().trim();

const loadStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser) return null;
    return {
      ...parsedUser,
      role: normalizeRoleValue(parsedUser.role),
    };
  } catch (error) {
    console.error("Failed to parse stored user", error);
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadStoredUser);
  const [loading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

    const login = (userData, token) => {
    const normalizedUser = userData
      ? { ...userData, role: normalizeRoleValue(userData.role) }
      : null;
    setUser(normalizedUser);
    if (normalizedUser) {
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem("user");
    }
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Map user data for Header/Sidebar compatibility
  const profileName = user?.username || user?.name || "Admin";
  const role = user?.role || "admin";
  const email = user?.email || "";
  const phone = user?.phone || "";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        loginOpen,
        setLoginOpen,
        profileName,
        role,
        email,
        phone
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};