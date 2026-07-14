"use client";
import React, { useState, useEffect } from "react";

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountPercent, setDiscountPercent] = useState("");
  const [flatDiscountAmount, setFlatDiscountAmount] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promos");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPromos(data);
    } catch (err) {
      showToast("Error loading promo codes", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        code, 
        discountType,
        discountPercent: discountType === "PERCENTAGE" ? Number(discountPercent) : undefined, 
        flatDiscountAmount: discountType === "FLAT" ? Number(flatDiscountAmount) : undefined,
        isActive,
        expiresAt: expiresAt ? expiresAt : undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined
      };
      
      const url = editingId ? `/api/promos/${editingId}` : "/api/promos";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`Promo code ${editingId ? 'updated' : 'created'} successfully!`, "success");
        cancelForm();
        fetchPromos();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || `Error ${editingId ? 'updating' : 'creating'} promo code.`, "error");
      }
    } catch (err) {
      showToast("Error: " + (err as Error).message, "error");
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountPercent("");
    setFlatDiscountAmount("");
    setIsActive(true);
    setExpiresAt("");
    setMaxUses("");
    setMinOrderValue("");
    setMaxDiscountAmount("");
  };

  const handleEditClick = (promo: any) => {
    setEditingId(promo.id);
    setCode(promo.code);
    setDiscountType(promo.discountType || "PERCENTAGE");
    setDiscountPercent(promo.discountPercent ? promo.discountPercent.toString() : "");
    setFlatDiscountAmount(promo.flatDiscountAmount ? promo.flatDiscountAmount.toString() : "");
    setIsActive(promo.isActive);
    setExpiresAt(promo.expiresAt ? new Date(promo.expiresAt).toISOString().split('T')[0] : "");
    setMaxUses(promo.maxUses ? promo.maxUses.toString() : "");
    setMinOrderValue(promo.minOrderValue ? promo.minOrderValue.toString() : "");
    setMaxDiscountAmount(promo.maxDiscountAmount ? promo.maxDiscountAmount.toString() : "");
    setShowForm(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/promos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      showToast(`Promo code ${!currentStatus ? 'activated' : 'deactivated'}`, "success");
      setPromos(promos.map((p: any) => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (err) {
      showToast("Error updating status.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      const res = await fetch(`/api/promos/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Promo code deleted successfully", "success");
        fetchPromos();
      } else {
        showToast("Failed to delete promo code", "error");
      }
    } catch (err) {
      showToast("Error deleting promo code", "error");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl z-[4000] text-white font-medium animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Promo Codes</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">Create and manage discount codes.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) {
              cancelForm();
            } else {
              setShowForm(true);
            }
          }} 
          className="bg-[#0a0a0a] text-white px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 flex items-center gap-2"
        >
          {showForm ? "Cancel" : "➕ Create Promo"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-200/60 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4">{editingId ? 'Edit Promo Code' : 'Create New Promo Code'}</h2>
          <form onSubmit={handleAddPromo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Code Name</label>
              <input required value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none uppercase" placeholder="e.g. SUMMER20" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Discount Type</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none bg-white">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>
            
            {discountType === "PERCENTAGE" ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Discount Percentage (%)</label>
                <input required type="number" min="1" max="100" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="20" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Flat Discount Amount (₹)</label>
                <input required type="number" min="1" value={flatDiscountAmount} onChange={e => setFlatDiscountAmount(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="e.g. 70" />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Expiry Date (Optional)</label>
              <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Max Total Uses (Optional)</label>
              <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="e.g. 100" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Min Order Value ₹ (Optional)</label>
              <input type="number" min="1" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="e.g. 1000" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Max Discount Amount ₹ (Optional)</label>
              <input type="number" min="1" value={maxDiscountAmount} onChange={e => setMaxDiscountAmount(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="e.g. 500" />
            </div>

            <div className="flex items-center gap-3 md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 accent-[#98202E]" />
              <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Active</label>
              <span className="text-xs text-gray-500 ml-2">(Customers can use this code right now)</span>
            </div>

            <div className="md:col-span-2 flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={cancelForm}
                className="mr-4 px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-[#98202E] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7a1a25] transition-colors shadow-lg shadow-[#98202E]/20"
              >
                {editingId ? 'Update Promo Code' : 'Save Promo Code'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading promo codes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Code</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Discount</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Limits</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Usage</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promos.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-gray-500">No promo codes found.</td></tr>
                ) : (
                  promos.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <div className="font-mono text-lg font-black text-[#98202E] bg-[#98202E]/5 inline-block px-3 py-1 border border-[#98202E]/20 rounded-lg">
                          {p.code}
                        </div>
                      </td>
                      <td className="p-6 font-bold text-gray-900 text-lg">
                        {p.discountType === 'FLAT' ? `₹${p.flatDiscountAmount} OFF` : `${p.discountPercent}% OFF`}
                      </td>
                      <td className="p-6 text-sm text-gray-600">
                        {p.minOrderValue && <div className="mb-1">Min: ₹{p.minOrderValue}</div>}
                        {p.maxDiscountAmount && <div className="mb-1">Max Disc: ₹{p.maxDiscountAmount}</div>}
                        {p.expiresAt && <div className="text-xs text-red-500 font-medium">Exp: {new Date(p.expiresAt).toLocaleDateString()}</div>}
                        {!p.minOrderValue && !p.maxDiscountAmount && !p.expiresAt && <span className="text-gray-400">None</span>}
                      </td>
                      <td className="p-6 text-sm text-gray-600 font-bold">
                        {p.usedCount} {p.maxUses ? `/ ${p.maxUses}` : 'uses'}
                      </td>
                      <td className="p-6">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${p.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(p)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit Promo"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => toggleStatus(p.id, p.isActive)}
                            className={`p-2 rounded-lg transition-colors ${p.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                            title={p.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {p.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
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
