import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    referralCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { username, email, password, referralCode } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("All required fields must be filled");
      return;
    }

    try {
      setLoading(true);

      await register({
        username,
        email,
        password,
        referralCode: referralCode || null,
      });

      alert("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <form
        onSubmit={handleRegister}
        className="bg-[#1e293b] p-8 rounded-xl shadow-xl w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={handleChange}
          className="w-full p-3 bg-[#334155] rounded mb-4 outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={handleChange}
          className="w-full p-3 bg-[#334155] rounded mb-4 outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
          className="w-full p-3 bg-[#334155] rounded mb-4 outline-none"
        />

        <input
          type="text"
          name="referralCode"
          placeholder="Referral Code (Optional)"
          value={referralCode}
          onChange={handleChange}
          className="w-full p-3 bg-[#334155] rounded mb-6 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 p-3 rounded font-semibold transition"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
