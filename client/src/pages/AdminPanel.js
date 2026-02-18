import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // Delete user handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // Change role handler
  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await API.patch(`/admin/users/${id}/role`, { role: newRole });
      setUsers(users.map((u) => (u._id === id ? { ...u, role: res.data.role } : u)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Role update failed");
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6 text-red-400">Admin Panel</h1>
      <div className="bg-[#1e293b] rounded-xl p-2 sm:p-6 overflow-x-auto">
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="block w-full md:table">
            <div className="hidden md:table-header-group">
              <div className="table-row border-b border-gray-600">
                <div className="table-cell p-3 font-semibold">Username</div>
                <div className="table-cell p-3 font-semibold">Email</div>
                <div className="table-cell p-3 font-semibold">Coins</div>
                <div className="table-cell p-3 font-semibold">Role</div>
                <div className="table-cell p-3 font-semibold">Actions</div>
              </div>
            </div>
            <div className="md:table-row-group">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="block md:table-row border-b border-gray-700 last:border-0 bg-[#1e293b] md:bg-transparent mb-4 md:mb-0 rounded-lg md:rounded-none shadow md:shadow-none"
                >
                  <div className="flex md:table-cell flex-col md:flex-row md:items-center p-3">
                    <span className="md:hidden text-xs text-gray-400">Username</span>
                    <span>{u.username}</span>
                  </div>
                  <div className="flex md:table-cell flex-col md:flex-row md:items-center p-3">
                    <span className="md:hidden text-xs text-gray-400">Email</span>
                    <span>{u.email}</span>
                  </div>
                  <div className="flex md:table-cell flex-col md:flex-row md:items-center p-3">
                    <span className="md:hidden text-xs text-gray-400">Coins</span>
                    <span className="text-yellow-400">{u.coins}</span>
                  </div>
                  <div className="flex md:table-cell flex-col md:flex-row md:items-center p-3">
                    <span className="md:hidden text-xs text-gray-400">Role</span>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="bg-[#1e293b] border border-gray-600 rounded px-2 py-1"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div className="flex md:table-cell flex-col md:flex-row md:items-center p-3">
                    <span className="md:hidden text-xs text-gray-400">Actions</span>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded mt-2 md:mt-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
