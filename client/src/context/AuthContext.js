import { createContext, useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (data) => {
    await API.post("/auth/register", data);
    toast.success("Registration successful!");
  };

  const login = async (data) => {
    const res = await API.post("/auth/login", data);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);
    toast.success("Login successful!");
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const dailyLogin = async () => {
    const res = await API.post("/rewards/daily-login");

    if (res.data.coins || res.data.dailyStreak) {
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      toast.success(res.data.message);
    } else {
      toast(res.data.message);
    }
  };

  const earnCoins = async (type, watchTime = 0) => {
  try {
    const res = await API.post("/rewards/earn", { type, watchTime });

    const updated = { ...user, coins: res.data.coins };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));

    toast.success(res.data.message);
  } catch (err) {
    toast.error(err.response?.data?.message);
  }
};


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        register,
        login,
        logout,
        dailyLogin,
        earnCoins
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
