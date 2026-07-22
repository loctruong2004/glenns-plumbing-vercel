import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

const API       = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "glenns_admin_token";

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  NEW:       { label: "New",       cls: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
  CONTACTED: { label: "Contacted", cls: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-500" },
  QUOTED:    { label: "Quoted",    cls: "bg-purple-50 text-purple-700 border-purple-200",dot: "bg-purple-500" },
  SCHEDULED: { label: "Scheduled", cls: "bg-indigo-50 text-indigo-700 border-indigo-200",dot: "bg-indigo-500" },
  DONE:      { label: "Done",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  LOST:      { label: "Lost",      cls: "bg-red-50 text-red-600 border-red-200",         dot: "bg-red-500" },
};
const STATUSES = Object.keys(STATUS_META);

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  service: string;
  source: string;
  status: string;
  message: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

// ─── Icons (inline SVG to avoid extra deps) ───────────────────────────────────
const ChevronDown = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);
const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const ExcelIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 18l-1.5-2.5L5.5 18H4l2.25-3.5L4 11h1.5l1.5 2.5L8.5 11H10l-2.25 3.5L10 18H8.5zm5 0-1.5-2.5L10.5 18H9l2.25-3.5L9 11h1.5l1.5 2.5L13.5 11H15l-2.25 3.5L15 18h-1.5z"/>
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const GearIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const MailIcon = () => (
  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        onLogin(data.token);
      } else {
        setError(data.error ?? "Login failed. Please try again.");
      }
    } catch {
      setError("Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-[16px] text-gray-800 outline-none " +
    "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3a5f] mb-4 shadow-lg">
            <ShieldIcon />
          </div>
          <h1 className="font-bold text-[26px] text-[#1e3a5f]">Glenn's Plumbing</h1>
          <p className="text-[16px] text-gray-500 mt-1">Admin Portal — Sign in to continue</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-4">
          <div>
            <label className="block text-[15px] font-semibold text-gray-700 mb-1.5">Username</label>
            <input
              value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="admin" autoComplete="username" required className={inp}
            />
          </div>
          <div>
            <label className="block text-[15px] font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" required className={inp}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[15px] font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#2563eb] text-white font-bold text-[18px] hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 shadow-md"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({
  token,
  onClose,
}: {
  token: string;
  onClose: () => void;
}) {
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  const authHeaders = { Authorization: `Bearer ${token}`, "content-type": "application/json" };

  useEffect(() => {
    fetch(`${API}/api/admin/settings`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setEmail(d.settings.notification_email ?? "");
          setPhone(d.settings.notification_phone ?? "");
        }
      })
      .catch(() => setError("Could not load settings."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const patch = (key: string, value: string | null) =>
        fetch(`${API}/api/admin/settings`, {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ key, value }),
        }).then((r) => r.json());

      const [emailRes, phoneRes] = await Promise.all([
        patch("notification_email", email.trim() || null),
        patch("notification_phone", phone.trim() || null),
      ]);

      if (emailRes.ok && phoneRes.ok) setSaved(true);
      else setError(emailRes.error ?? phoneRes.error ?? "Save failed.");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-[18px] text-[#1e3a5f]">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-[22px] leading-none"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[15px] text-gray-400">Loading…</div>
        ) : (
          <form onSubmit={save} className="space-y-5">
            {/* Notification email */}
            <div>
              <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-700 mb-2">
                <MailIcon />
                Admin Notification Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
              />
              <p className="mt-2 text-[13px] text-gray-400">
                A notification email will be sent to this address every time a new quote request comes in.
                Leave blank to disable admin notifications.
              </p>
            </div>

            {/* Notification phone (SMS) */}
            <div>
              <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-700 mb-2">
                <PhoneIcon />
                Admin Notification Phone (SMS)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
                placeholder="+1 555 123 4567"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-gray-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors"
              />
              <p className="mt-2 text-[13px] text-gray-400">
                A text message will be sent to this number every time a new quote request comes in.
                Use US format (e.g. +1 followed by 10 digits). Leave blank to disable SMS notifications.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[14px] text-red-600 font-medium">
                {error}
              </div>
            )}
            {saved && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-[14px] text-emerald-700 font-medium">
                ✓ Settings saved successfully.
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-[15px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-[#2563eb] text-white font-bold text-[15px] hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Workers Modal (quản lý thợ) ──────────────────────────────────────────────
interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  job: string | null;
  createdAt: string;
}

const EMPTY_WORKER = { name: "", phone: "", email: "", job: "" };

function WorkersModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);

  // Form dùng chung cho cả thêm mới lẫn sửa. editingId = null => đang thêm mới.
  const [form, setForm]           = useState(EMPTY_WORKER);
  const [editingId, setEditingId] = useState<string | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "content-type": "application/json" };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/api/admin/workers`, { headers: authHeaders });
      const data = await res.json();
      if (data.ok) setWorkers(data.workers);
      else setError(data.error ?? "Could not load workers.");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm(EMPTY_WORKER); setEditingId(null); };

  const startEdit = (w: Worker) => {
    setEditingId(w.id);
    setForm({ name: w.name, phone: w.phone, email: w.email ?? "", job: w.job ?? "" });
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const url = editingId
        ? `${API}/api/admin/workers/${editingId}`
        : `${API}/api/admin/workers`;
      const res  = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: authHeaders,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) { resetForm(); await load(); }
      else setError(data.error ?? "Save failed.");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (w: Worker) => {
    if (!window.confirm(`Delete worker "${w.name}"? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    try {
      const res  = await fetch(`${API}/api/admin/workers/${w.id}`, {
        method: "DELETE", headers: authHeaders,
      });
      const data = await res.json();
      if (data.ok) {
        if (editingId === w.id) resetForm();
        await load();
      } else setError(data.error ?? "Delete failed.");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setBusy(false);
    }
  };

  const inp =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-[16px] text-gray-800 outline-none " +
    "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
  const lbl = "block text-[14px] font-bold text-gray-700 mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-9 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center text-white">
              <UsersIcon />
            </div>
            <div>
              <h2 className="font-bold text-[22px] text-[#1e3a5f] leading-none">Workers</h2>
              <p className="text-[13px] text-gray-400 mt-1">{workers.length} worker{workers.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-[24px] leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-9 py-7 space-y-7">
          {/* Add / Edit form */}
          <form onSubmit={submit} className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
            <div className="text-[15px] font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${editingId ? "bg-amber-500" : "bg-emerald-500"}`} />
              {editingId ? "Edit worker" : "Add a new worker"}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Name <span className="text-blue-500">*</span></label>
                <input
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Smith" className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Phone <span className="text-blue-500">*</span></label>
                <input
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. (646) 555-1234" type="tel" className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Email <span className="font-medium text-gray-400">(optional)</span></label>
                <input
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. john@gmail.com" type="email" className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Job / trade <span className="font-medium text-gray-400">(optional)</span></label>
                <input
                  value={form.job} onChange={(e) => setForm({ ...form, job: e.target.value })}
                  placeholder="e.g. Drain specialist" className={inp}
                />
              </div>
            </div>
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[15px] text-red-600 font-medium">
                {error}
              </div>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="submit" disabled={busy}
                className="px-7 py-3 rounded-xl bg-[#2563eb] text-white font-bold text-[16px] hover:bg-[#1d4ed8] transition-colors disabled:opacity-60 shadow-sm"
              >
                {busy ? "Saving…" : editingId ? "Save changes" : "+ Add worker"}
              </button>
              {editingId && (
                <button
                  type="button" onClick={resetForm}
                  className="px-7 py-3 rounded-xl border border-gray-200 text-[16px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* List */}
          {loading ? (
            <div className="py-14 text-center text-[16px] text-gray-400">Loading workers…</div>
          ) : workers.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-[17px] font-semibold text-gray-500">No workers yet</p>
              <p className="text-[14px] text-gray-400 mt-1">Add your first one using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-[16px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    {["Name", "Phone", "Email", "Job", "Actions"].map((h, i) => (
                      <th key={i} className={`px-5 py-4 text-[13px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap ${i === 4 ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workers.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-semibold text-[#1e3a5f] whitespace-nowrap">{w.name}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <a href={`tel:${w.phone}`} className="text-[#2563eb] font-medium hover:underline">{w.phone}</a>
                      </td>
                      <td className="px-5 py-4 text-gray-500 max-w-[220px] truncate" title={w.email ?? ""}>
                        {w.email || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        {w.job
                          ? <span className="inline-block bg-slate-100 text-slate-700 rounded-lg px-2.5 py-1 text-[14px] font-semibold">{w.job}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => startEdit(w)}
                            className="px-3.5 py-2 rounded-lg border border-gray-200 text-[14px] font-semibold text-gray-600 hover:border-blue-400 hover:text-[#2563eb] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(w)}
                            disabled={busy}
                            className="px-3.5 py-2 rounded-lg border border-gray-200 text-[14px] font-semibold text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dispatch Modal (điều phối lead cho thợ) ──────────────────────────────────
function buildDispatchMessage(l: Lead): string {
  const lines = [
    "New job — Glenn's Plumbing",
    "",
    `Customer: ${l.name}`,
    `Phone: ${l.phone}`,
  ];
  if (l.address) lines.push(`Address: ${l.address}`);
  lines.push(`Service: ${l.service}`);
  if (l.message) lines.push(`Notes: ${l.message}`);
  lines.push("", "Please contact the customer to schedule.");
  return lines.join("\n");
}

function DispatchModal({
  token,
  lead,
  onClose,
}: {
  token: string;
  lead: Lead;
  onClose: () => void;
}) {
  const [workers, setWorkers]     = useState<Worker[]>([]);
  const [loading, setLoading]     = useState(true);
  const [workerId, setWorkerId]   = useState("");
  const [subject, setSubject]     = useState("New job — Glenn's Plumbing");
  const [message, setMessage]     = useState(() => buildDispatchMessage(lead));
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState<
    { email: boolean; sms: boolean; worker: string; hasEmail: boolean } | null
  >(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "content-type": "application/json" };

  useEffect(() => {
    fetch(`${API}/api/admin/workers`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setWorkers(d.workers);
          if (d.workers.length > 0) setWorkerId(d.workers[0].id);
        } else setError(d.error ?? "Could not load workers.");
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedWorker = workers.find((w) => w.id === workerId);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId) { setError("Please choose a worker."); return; }
    if (!message.trim()) { setError("Message is empty."); return; }
    setSending(true);
    setError("");
    try {
      const res  = await fetch(`${API}/api/admin/leads/${lead.id}/dispatch`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ workerId, subject, message }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({
          email: data.sent.email,
          sms: data.sent.sms,
          worker: data.worker.name,
          hasEmail: data.worker.hasEmail,
        });
      } else setError(data.error ?? "Send failed.");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setSending(false);
    }
  };

  const inp =
    "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[15px] text-gray-800 outline-none " +
    "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-colors";
  const Tick = ({ ok }: { ok: boolean }) => (
    <span className={ok ? "text-emerald-600 font-bold" : "text-gray-400"}>{ok ? "✓ sent" : "✕ not sent"}</span>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-full flex flex-col">
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-[18px] text-[#1e3a5f]">Send to worker</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Lead: <span className="font-semibold text-gray-600">{lead.name}</span> · {lead.service}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-[22px] leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-7 py-6">
          {loading ? (
            <div className="py-10 text-center text-[15px] text-gray-400">Loading workers…</div>
          ) : result ? (
            // ── Kết quả gửi ──
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="mt-4 font-bold text-[18px] text-[#1e3a5f]">Dispatched to {result.worker}</h3>
              <div className="mt-3 inline-flex flex-col gap-1 text-[15px] text-gray-600">
                <div>Email: {result.hasEmail ? <Tick ok={result.email} /> : <span className="text-gray-400">no email on file</span>}</div>
                <div>SMS: <Tick ok={result.sms} /></div>
              </div>
              {!result.email && !result.sms && (
                <p className="mt-4 text-[13px] text-amber-600 max-w-xs mx-auto">
                  Nothing was actually sent — check that Twilio (SMS) and SMTP (email) are configured on the server.
                </p>
              )}
              <div className="mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-[15px] hover:bg-[#1d4ed8] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : workers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[15px] text-gray-500">No workers yet.</p>
              <p className="text-[13px] text-gray-400 mt-1">Add a worker first using the “Workers” button, then dispatch.</p>
            </div>
          ) : (
            // ── Form điều phối ──
            <form onSubmit={send} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Worker</label>
                <select value={workerId} onChange={(e) => setWorkerId(e.target.value)} className={inp}>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}{w.job ? ` — ${w.job}` : ""} · {w.phone}
                    </option>
                  ))}
                </select>
                {selectedWorker && !selectedWorker.email && (
                  <p className="mt-1.5 text-[12.5px] text-amber-600">
                    This worker has no email — only SMS will be sent.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Email subject <span className="font-medium text-gray-400">(email only)</span>
                </label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inp} />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Message <span className="font-medium text-gray-400">(edit before sending)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={9}
                  className={inp + " resize-none font-mono text-[13.5px] leading-relaxed"}
                />
                <p className="mt-1 text-[12px] text-gray-400">Sent as the SMS body and the email body.</p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[14px] text-red-600 font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-[15px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={sending}
                  className="flex-1 py-3 rounded-xl bg-[#2563eb] text-white font-bold text-[15px] hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send email + SMS"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("ALL");
  const [fromDate, setFromDate]   = useState("");
  const [toDate, setToDate]       = useState("");
  const [updating, setUpdating]   = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showWorkers, setShowWorkers]   = useState(false);
  const [dispatchLead, setDispatchLead] = useState<Lead | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "content-type": "application/json" };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/api/admin/leads`, { headers: authHeaders });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      if (data.ok) setLeads(data.leads);
      else setError(data.error ?? "Failed to load data.");
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const changeStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch(`${API}/api/admin/leads/${id}/status`, {
        method: "PATCH", headers: authHeaders, body: JSON.stringify({ status }),
      });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } finally {
      setUpdating(null);
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const shown = leads.filter((l) => {
    if (filter !== "ALL" && l.status !== filter) return false;
    const d = new Date(l.createdAt);
    if (fromDate && d < new Date(fromDate + "T00:00:00")) return false;
    if (toDate   && d > new Date(toDate   + "T23:59:59")) return false;
    return true;
  });

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

  const clearDates = () => { setFromDate(""); setToDate(""); };

  // ── Excel Export ───────────────────────────────────────────────────────────
  const exportExcel = () => {
    const rows = shown.map((l) => ({
      Name:    l.name,
      Phone:   l.phone,
      Email:   l.email    ?? "",
      Address: l.address  ?? "",
      Service: l.service,
      Source:  l.source,
      Status:  STATUS_META[l.status]?.label ?? l.status,
      Message: l.message  ?? "",
      Date:    fmtDate(l.createdAt),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws["!cols"] = [
      { wch: 22 }, { wch: 16 }, { wch: 28 }, { wch: 30 },
      { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    const today = new Date().toISOString().slice(0, 10);
    const label = filter !== "ALL" ? `-${filter.toLowerCase()}` : "";
    XLSX.writeFile(wb, `glenns-leads${label}-${today}.xlsx`);
  };

  // ── Input style ────────────────────────────────────────────────────────────
  const dateInp =
    "rounded-xl border border-gray-200 px-3 py-2 text-[15px] text-gray-700 outline-none " +
    "focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-colors bg-white";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Settings Modal ── */}
      {showSettings && (
        <SettingsModal token={token} onClose={() => setShowSettings(false)} />
      )}

      {/* ── Workers Modal ── */}
      {showWorkers && (
        <WorkersModal token={token} onClose={() => setShowWorkers(false)} />
      )}

      {/* ── Dispatch Modal ── */}
      {dispatchLead && (
        <DispatchModal token={token} lead={dispatchLead} onClose={() => setDispatchLead(null)} />
      )}

      {/* ── Header ── */}
      <header className="bg-[#1e3a5f] text-white px-8 py-5 flex items-center justify-between shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
            <ShieldIcon />
          </div>
          <div>
            <div className="font-bold text-[20px] leading-tight">Glenn's Plumbing</div>
            <div className="text-[14px] text-white/55">Admin Dashboard</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowWorkers(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1e3a5f] text-[16px] font-bold hover:bg-white/90 transition-colors shadow-sm"
          >
            <UsersIcon /> Workers
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[16px] font-medium transition-colors"
          >
            <GearIcon /> Settings
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[16px] font-medium transition-colors"
          >
            <LogoutIcon /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-[1680px] mx-auto px-8 py-10">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {/* All */}
          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-2xl border p-6 text-left transition-all ${
              filter === "ALL"
                ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-lg"
                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            <div className={`text-[42px] font-bold leading-none ${filter === "ALL" ? "text-white" : "text-[#1e3a5f]"}`}>
              {leads.length}
            </div>
            <div className={`text-[13px] font-semibold mt-2.5 uppercase tracking-wide ${filter === "ALL" ? "text-white/65" : "text-gray-400"}`}>
              All Leads
            </div>
          </button>

          {/* Per-status */}
          {STATUSES.map((s) => {
            const m      = STATUS_META[s];
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-2xl border p-6 text-left transition-all ${
                  active
                    ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-lg"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${active ? "bg-white" : m.dot}`} />
                </div>
                <div className={`text-[42px] font-bold leading-none ${active ? "text-white" : "text-[#1e3a5f]"}`}>
                  {counts[s] ?? 0}
                </div>
                <div className={`text-[13px] font-semibold mt-2.5 uppercase tracking-wide ${active ? "text-white/65" : "text-gray-400"}`}>
                  {m.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Filters & Actions Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 mb-4 flex flex-wrap items-center gap-3">
          {/* Date range */}
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <span className="text-[15px] font-semibold text-gray-500">From</span>
            <input
              type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className={dateInp}
            />
            <span className="text-[15px] font-semibold text-gray-500">To</span>
            <input
              type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              className={dateInp}
            />
            {(fromDate || toDate) && (
              <button
                onClick={clearDates}
                className="text-[14px] text-gray-400 hover:text-red-500 font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Result count */}
          <span className="text-[15px] text-gray-400">
            Showing <span className="font-semibold text-gray-700">{shown.length}</span> of {leads.length} records
          </span>

          {/* Refresh */}
          <button
            onClick={fetchLeads}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-[15px] text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            <RefreshIcon /> Refresh
          </button>

          {/* Export Excel */}
          <button
            onClick={exportExcel}
            disabled={shown.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-bold transition-colors disabled:opacity-50 shadow-sm"
          >
            <ExcelIcon /> Export Excel
          </button>
        </div>

        {/* ── Leads Table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[21px] text-[#1e3a5f]">
              Leads
              {filter !== "ALL" && (
                <span className={`ml-2.5 text-[15px] rounded-full border px-3 py-1 font-semibold ${STATUS_META[filter]?.cls}`}>
                  {STATUS_META[filter]?.label}
                </span>
              )}
              {(fromDate || toDate) && (
                <span className="ml-2.5 text-[15px] text-gray-400 font-normal">
                  {fromDate && `from ${fromDate}`} {toDate && `to ${toDate}`}
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="mt-3 text-[14px] text-gray-400">Loading leads…</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <p className="text-[15px] text-red-500 font-medium">{error}</p>
              <button onClick={fetchLeads} className="mt-3 text-[13px] text-blue-600 hover:underline">Try again</button>
            </div>
          ) : shown.length === 0 ? (
            <div className="py-24 text-center text-gray-400 text-[15px]">No leads found for the selected filters.</div>
          ) : (
            <table className="w-full table-fixed text-[15px]">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  {["Customer", "Contact", "Address", "Service", "Status", "Date", "Action"].map((h) => (
                    <th key={h} className={`px-4 py-4 text-[12.5px] font-bold text-gray-400 uppercase tracking-wider ${h === "Action" ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shown.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors group align-top">
                    {/* Customer (+ source + message) */}
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[16px] text-[#1e3a5f] break-words">{lead.name}</div>
                      <div className="text-[12px] text-gray-400 uppercase tracking-wide mt-0.5">{lead.source}</div>
                      {lead.message && (
                        <div className="text-[13.5px] text-gray-400 mt-1 line-clamp-2 break-words" title={lead.message}>
                          {lead.message}
                        </div>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4">
                      <a href={`tel:${lead.phone}`} className="font-semibold text-[15px] text-[#2563eb] hover:underline break-words">
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <div className="text-[13.5px] text-gray-400 mt-1 break-words" title={lead.email}>
                          {lead.email}
                        </div>
                      )}
                    </td>

                    {/* Address */}
                    <td className="px-4 py-4 text-[14px] text-gray-500 break-words">
                      {lead.address || <span className="text-gray-200">—</span>}
                    </td>

                    {/* Service */}
                    <td className="px-4 py-4">
                      <span className="inline-block bg-slate-100 text-slate-700 rounded-lg px-2.5 py-1 text-[13.5px] font-semibold break-words">
                        {lead.service}
                      </span>
                    </td>

                    {/* Status — select with arrow */}
                    <td className="px-4 py-4">
                      <div className="relative">
                        <select
                          value={lead.status}
                          onChange={(e) => changeStatus(lead.id, e.target.value)}
                          disabled={updating === lead.id}
                          className={`w-full appearance-none pr-8 text-[14px] font-semibold rounded-lg border px-3 py-2 outline-none cursor-pointer disabled:opacity-50 transition-colors ${STATUS_META[lead.status]?.cls ?? ""}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_META[s].label}</option>
                          ))}
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                          <ChevronDown cls="w-4 h-4" />
                        </span>
                        {updating === lead.id && (
                          <span className="absolute right-1 -top-4">
                            <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date — stacked to save width */}
                    <td className="px-4 py-4 text-gray-500 text-[13.5px]">
                      <div>{fmtDate(lead.createdAt)}</div>
                      <div className="text-gray-400">
                        {new Date(lead.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    {/* Dispatch to worker */}
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setDispatchLead(lead)}
                        title="Send this lead to a worker (email + SMS)"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1e3a5f] text-white text-[14px] font-bold hover:bg-[#16304f] transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Send
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!token) return <LoginPage onLogin={setToken} />;
  return <Dashboard token={token} onLogout={logout} />;
}
