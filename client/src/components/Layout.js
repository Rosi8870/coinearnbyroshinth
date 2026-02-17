import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, Wallet, LayoutDashboard, Trophy, Shield } from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // 💰 Coin → Rupees Conversion (5 Coins = ₹1)
  const rupees = user?.coins ? (user.coins / 5).toFixed(2) : "0.00";

  return (
    <div className="flex min-h-screen bg-[#0b1220] text-white">

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64 bg-[#111827] border-r border-gray-800 p-6 z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-2xl font-bold text-cyan-400">
            Earn Here
          </h2>
          <button onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Desktop Title */}
        <h2 className="hidden md:block text-2xl font-bold text-cyan-400 mb-12">
          Earn Here
        </h2>

        <nav className="space-y-4">

          <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />}>
            Dashboard
          </NavItem>

          <NavItem to="/leaderboard" icon={<Trophy size={18} />}>
            Leaderboard
          </NavItem>

          {/* Admin Link */}
          {user?.role === "admin" && (
            <NavItem to="/admin" icon={<Shield size={18} />}>
              Admin Panel
            </NavItem>
          )}

          {/* Withdraw Button */}
          <button
            onClick={() => {
              setShowWithdraw(true);
              setOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition"
          >
            <Wallet size={18} />
            Withdraw
          </button>

        </nav>
      </aside>

      {/* Main Section */}
      <main className="flex-1 p-4 md:p-10">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-10">

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={26} />
          </button>

          <h1 className="text-xl md:text-2xl font-semibold">
            Welcome {user?.username}
          </h1>

          {/* Coins + Rupees */}
          <div className="flex items-center gap-4">

            <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold text-sm md:text-base">
              {user?.coins || 0} Coins
              <span className="ml-2 text-xs font-medium">
                (₹ {rupees})
              </span>
            </div>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition text-sm md:text-base"
            >
              Logout
            </button>

          </div>
        </div>

        {children}

      </main>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

          <div className="bg-[#111827] p-8 rounded-2xl w-[90%] max-w-md text-center border border-gray-700">

            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
              Withdrawal Notice
            </h2>

            <p className="text-gray-300 mb-4">
              Your Current Balance:
            </p>

            <p className="text-3xl font-bold text-green-400 mb-6">
              ₹ {rupees}
            </p>

            <p className="text-gray-400 mb-6">
              Withdrawal will be available after election.
            </p>

            <button
              onClick={() => setShowWithdraw(false)}
              className="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg transition"
            >
              OK
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

/* Nav Item Component */
function NavItem({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          isActive
            ? "bg-cyan-500/10 text-cyan-400"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
