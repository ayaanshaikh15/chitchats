import { useState, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-\[\]\\/]/.test(p) },
];

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const checks = useMemo(() => requirements.map((r) => r.test(password)), [password]);

  const allValid = checks.every(Boolean);

  const strength = useMemo(() => {
    const count = checks.filter(Boolean).length;
    if (count <= 2) return { label: "Weak", color: "bg-red-500", text: "text-red-400" };
    if (count <= 3) return { label: "Fair", color: "bg-yellow-500", text: "text-yellow-400" };
    if (count <= 4) return { label: "Good", color: "bg-blue-500", text: "text-blue-400" };
    return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
  }, [checks]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allValid) return;
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-600/5 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-zinc-800 shadow-2xl shadow-blue-500/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/25">
              <img className="w-8 h-8 " src="./favicon.png" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Create account</h1>
            <p className="text-zinc-400 mt-1.5">Join the conversation</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {password && (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                        style={{ width: `${(checks.filter(Boolean).length / requirements.length) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${strength.text}`}>{strength.label}</span>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${checks[i] ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}
                        >
                          {checks[i] ? (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v.01M12 8v4m0 4h.01" />
                            </svg>
                          )}
                        </span>
                        <span className={checks[i] ? "text-emerald-400" : "text-zinc-500"}>{req.label}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (password.length > 0 && !allValid)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-600/50 disabled:to-blue-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-zinc-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
