// client/src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

// Initialise auth state from localStorage (no useEffect needed)
const getInitialAuth = () => {
  try {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      return {
        user: JSON.parse(storedUser),
        token: storedToken,
      };
    }
  } catch (e) {
    console.warn("Failed to parse stored auth:", e);
  }
  return { user: null, token: null };
};

export const AuthProvider = ({ children }) => {
  const { user: initialUser, token: initialToken } = getInitialAuth();

  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(initialToken);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
    }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// This is a hook, not a component – tell ESLint to chill 🙂
/* eslint-disable-next-line react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
