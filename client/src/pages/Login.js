import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    await login({ email, password });
    navigate("/dashboard");
  } catch (err) {
    alert("Login failed");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <form
        onSubmit={handleLogin}
        className="bg-[#1e293b] p-8 rounded-xl shadow-xl w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-[#334155] rounded mb-4 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-[#334155] rounded mb-4 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-cyan-500 hover:bg-cyan-600 p-3 rounded font-semibold">
          Login
        </button>

        <p className="mt-4 text-center text-gray-400">
          No account?{" "}
          <Link to="/register" className="text-cyan-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
