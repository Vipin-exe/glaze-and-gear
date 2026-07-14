"use client";
import { useState, useEffect } from "react";

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/newsletter");
    const data = await res.json();
    setSubscribers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const deleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Unsubscribe ${email}? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setSubscribers(subscribers.filter((s) => s.id !== id));
      showToast("Subscriber removed", "success");
    } catch {
      showToast("Failed to remove subscriber", "error");
    } finally {
      setDeleting(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Email", "Subscribed On"],
      ...subscribers.map((s) => [s.email, new Date(s.createdAt).toLocaleDateString()]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = subscribers.filter((s) =>
    !searchQuery || s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by month for timeline
  const thisMonth = subscribers.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl z-50 text-white font-medium animate-in slide-in-from-bottom-4 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Newsletter</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">
            <span className="font-bold text-gray-700">{subscribers.length}</span> total subscribers ·{" "}
            <span className="font-bold text-green-600">+{thisMonth} this month</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-64"
          />
          <button
            onClick={exportCSV}
            disabled={subscribers.length === 0}
            className="px-5 py-2 bg-[#0a0a0a] text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#98202E] to-[#60101a] text-white rounded-2xl p-6">
          <p className="text-white/70 text-xs uppercase tracking-widest font-bold mb-1">Total Subscribers</p>
          <p className="text-4xl font-black">{subscribers.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200/60">
          <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">This Month</p>
          <p className="text-4xl font-black text-gray-900">+{thisMonth}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200/60 col-span-2 sm:col-span-1">
          <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Latest Subscriber</p>
          <p className="text-sm font-bold text-gray-900 truncate mt-1">
            {subscribers[0]?.email || "—"}
          </p>
          {subscribers[0] && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(subscribers[0].createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {subscribers.length === 0 ? "No subscribers yet. Share the newsletter form to grow your list!" : "No subscribers match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">#</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Subscribed On</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((sub, i) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-6 text-sm text-gray-400 font-mono">{i + 1}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#98202E]/10 text-[#98202E] flex items-center justify-center font-black uppercase text-sm shrink-0">
                          {sub.email.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900">{sub.email}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-gray-500 font-medium">
                      {new Date(sub.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => deleteSubscriber(sub.id, sub.email)}
                        disabled={deleting === sub.id}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-red-50 text-red-500 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 border border-red-100"
                      >
                        {deleting === sub.id ? "..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
