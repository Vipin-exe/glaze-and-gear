"use client";
import React, { useState, useEffect } from "react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c: any) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">View registered users and their lifetime value.</p>
        </div>
        
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full md:w-64"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Details</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Orders</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Lifetime Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-gray-500">No customers found.</td></tr>
                ) : (
                  filteredCustomers.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold uppercase shrink-0">
                            {c.name ? c.name.charAt(0) : c.email.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{c.name || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500">{c.email}</div>
                            <div className="text-[10px] text-gray-400 mt-1">Joined {new Date(c.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          c.role === 'ADMIN' ? 'bg-[#98202E]/10 text-[#98202E]' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="p-6 text-center font-bold text-gray-600">
                        {c.orderCount}
                      </td>
                      <td className="p-6 text-right font-black text-lg text-gray-900">
                        ₹{c.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
