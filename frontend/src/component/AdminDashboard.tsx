import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSocket, getOnlineUsersSnapshot } from "../lib/socket";
import Loader from "./Loader";

interface UserStats {
  id: string;
  name: string;
  email: string;
  profilePic?: string;
  role: string;
  isOnline: boolean;
}

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    total: number;
    online: number;
    offline: number;
    users: UserStats[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const fetchStats = () => {
    setLoading(true);
    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const updateOnlineStatus = (onlineIds: string[]) => {
    setStats((prev) => {
      if (!prev) return prev;
      const users = prev.users.map((u) => ({
        ...u,
        isOnline: onlineIds.includes(u.id),
      }));
      const online = users.filter((u) => u.isOnline).length;
      return { ...prev, users, online, offline: prev.total - online };
    });
  };

  useEffect(() => {
    if (!me) return;
    const socket = getSocket(me.id);
    updateOnlineStatus(getOnlineUsersSnapshot());
    socket.on("getOnlineUsers", updateOnlineStatus);
    return () => { socket.off("getOnlineUsers"); };
  }, [me]);

  const handleMakeAdmin = async (id: string) => {
    setPromoting(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/make-admin/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ text: data.message, error: false });
      fetchStats();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Failed to promote", error: true });
    } finally {
      setPromoting(null);
    }
  };

  if (loading && !stats) return <Loader />;

  const filtered = stats?.users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <>
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-zinc-400 hover:text-zinc-100 transition cursor-pointer p-2 -ml-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Admin Dashboard</h1>
              <p className="text-zinc-500 text-sm">Manage users and admins</p>
            </div>
          </div>
          {me?.profilePic && (
            <img
              src={me.profilePic}
              alt=""
              className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-700"
            />
          )}
        </div>

        {/* Toast message */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              message.error
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {message.error ? (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-zinc-400 text-sm font-medium">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-zinc-100">{stats?.total ?? 0}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-zinc-400 text-sm font-medium">Online Now</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{stats?.online ?? 0}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-700/50 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-zinc-500" />
              </div>
              <span className="text-zinc-400 text-sm font-medium">Offline</span>
            </div>
            <p className="text-3xl font-bold text-zinc-400">{stats?.offline ?? 0}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl pl-10 pr-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>

        {/* Users Table — Desktop */}
        <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-5 py-3.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">User</th>
                  <th className="px-5 py-3.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3.5 text-zinc-500 text-xs font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                          {u.profilePic ? (
                            <img src={u.profilePic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-zinc-400 text-xs font-medium">{u.name[0]}</span>
                          )}
                        </div>
                        <span className="text-zinc-100 text-sm font-medium truncate max-w-[180px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400 text-sm">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${u.isOnline ? "bg-emerald-500" : "bg-zinc-500"}`} />
                        <span className={`text-sm ${u.isOnline ? "text-emerald-400" : "text-zinc-500"}`}>
                          {u.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-zinc-700/50 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role === "admin" ? (
                        <span className="text-zinc-600 text-sm">—</span>
                      ) : (
                        <button
                          onClick={() => setConfirmTarget(u.id)}
                          disabled={promoting === u.id}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition cursor-pointer"
                        >
                          {promoting === u.id ? "Promoting..." : "Make Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-12">No users found</p>
          )}
        </div>

        {/* Users List — Mobile */}
        <div className="md:hidden space-y-2">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                {u.profilePic ? (
                  <img src={u.profilePic} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-400 text-sm font-medium">{u.name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-zinc-100 text-sm font-medium truncate">{u.name}</p>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${u.isOnline ? "bg-emerald-500" : "bg-zinc-500"}`} />
                </div>
                <p className="text-zinc-500 text-xs truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      u.role === "admin"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-zinc-700/50 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {u.role}
                  </span>
                  <span className={`text-[10px] ${u.isOnline ? "text-emerald-400" : "text-zinc-500"}`}>
                    {u.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              {u.role !== "admin" && (
                <button
                  onClick={() => setConfirmTarget(u.id)}
                  disabled={promoting === u.id}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition cursor-pointer shrink-0"
                >
                  {promoting === u.id ? "..." : "Make Admin"}
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-12">No users found</p>
          )}
        </div>
      </div>
    </div>

    {/* Confirm make admin modal */}
    {confirmTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-zinc-100 font-semibold">Make Admin</h3>
              <p className="text-zinc-400 text-sm">Are you sure you want to promote this user to admin?</p>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setConfirmTarget(null)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl py-2.5 text-sm font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => { const id = confirmTarget; setConfirmTarget(null); handleMakeAdmin(id); }}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl py-2.5 text-sm font-medium transition cursor-pointer"
            >
              Promote
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
