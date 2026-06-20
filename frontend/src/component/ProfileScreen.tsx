import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const formData = new FormData();
      if (name.trim()) formData.append("name", name);
      if (email.trim()) formData.append("email", email);
      if (password.trim()) formData.append("password", password);
      if (file) formData.append("profilePic", file);

      const res = await fetch("/api/auth/update", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      updateUser(data.user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = filePreview || user?.profilePic;

  return (
    <>
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl shadow-blue-500/5 p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">Edit Profile</h2>
          <button
            onClick={() => navigate("/")}
            className="text-zinc-400 hover:text-zinc-100 transition cursor-pointer p-2 -mr-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-5">
          {/* Profile picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-zinc-400 font-medium text-3xl">{user?.name?.[0]}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-400 hover:text-blue-300 transition cursor-pointer py-2"
            >
              Change photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">
              New password <span className="text-zinc-600">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="New password"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-emerald-400 text-sm">{success}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded-xl p-2.5 transition cursor-pointer border border-zinc-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl py-2.5 text-sm font-medium transition cursor-pointer border border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-medium transition cursor-pointer"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Logout confirmation modal */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h3 className="text-zinc-100 font-semibold">Logout</h3>
              <p className="text-zinc-400 text-sm">Are you sure you want to logout?</p>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl py-2.5 text-sm font-medium transition cursor-pointer border border-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={() => { logout(); }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 text-sm font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Save confirmation modal */}
    {showConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-zinc-100 font-semibold">Save changes?</h3>
              <p className="text-zinc-400 text-sm">Are you sure you want to update your profile?</p>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl py-2.5 text-sm font-medium transition cursor-pointer border border-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={() => { setShowConfirm(false); handleSubmit(); }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium transition cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
